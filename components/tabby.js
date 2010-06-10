const Ci = Components.interfaces;

const CLASS_ID = Components.ID("24dbbc70-73a6-11df-93f2-0800200c9a66");
const CLASS_NAME = "Tab Name AutoComplete";
const CONTRACT_ID = "@mozilla.org/autocomplete/search;1?name=tabby";

// Implements nsIAutoCompleteResult
function SimpleAutoCompleteResult(searchString, searchResult,
                                  defaultIndex, errorDescription,
                                  results, comments, images) {
  this._searchString = searchString;
  this._searchResult = searchResult;
  this._defaultIndex = defaultIndex;
  this._errorDescription = errorDescription;
  this._results = results;
  this._comments = comments;
  this._images = images;
}

SimpleAutoCompleteResult.prototype = {
  _searchString: "",
  _searchResult: 0,
  _defaultIndex: 0,
  _errorDescription: "",
  _results: [],
  _comments: [],
  _images: [],

  /**
   * The original search string
   */
  get searchString() {
    return this._searchString;
  },

  /**
   * The result code of this result object, either:
   *         RESULT_IGNORED   (invalid searchString)
   *         RESULT_FAILURE   (failure)
   *         RESULT_NOMATCH   (no matches found)
   *         RESULT_SUCCESS   (matches found)
   */
  get searchResult() {
    return this._searchResult;
  },

  /**
   * Index of the default item that should be entered if none is selected
   */
  get defaultIndex() {
    return this._defaultIndex;
  },

  /**
   * A string describing the cause of a search failure
   */
  get errorDescription() {
    return this._errorDescription;
  },

  /**
   * The number of matches
   */
  get matchCount() {
    return this._results.length;
  },

  /**
   * Get the value of the result at the given index
   */
  getValueAt: function(index) {
    return this._results[index];
  },

  /**
   * Get the comment of the result at the given index
   */
  getCommentAt: function(index) {
    return this._comments[index];
  },

  /**
   * Get the style hint for the result at the given index
   */
  getStyleAt: function(index) {
    if (!this._comments[index])
      return null;  // not a category label, so no special styling

    if (index == 0)
      return "suggestfirst";  // category label on first line of results

    return "suggesthint";   // category label on any other line of results
  },

  /**
   * Get the image for the result at the given index
   * The return value is expected to be an URI to the image to display
   */
  getImageAt : function (index) {
    if (!this._images[index])
        return null;
    return this._images[index];
  },

  /**
   * Remove the value at the given index from the autocomplete results.
   * If removeFromDb is set to true, the value should be removed from
   * persistent storage as well.
   */
  removeValueAt: function(index, removeFromDb) {
    this._results.splice(index, 1);
    this._comments.splice(index, 1);
  },

  QueryInterface: function(aIID) {
    if (!aIID.equals(Ci.nsIAutoCompleteResult) && !aIID.equals(Ci.nsISupports))
        throw Components.results.NS_ERROR_NO_INTERFACE;
    return this;
  }
};


// Implements nsIAutoCompleteSearch
function SimpleAutoCompleteSearch() {
}

SimpleAutoCompleteSearch.prototype = {
  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param searchString - The string to search for
   * @param searchParam - An extra parameter
   * @param previousResult - A previous result to use for faster searchinig
   * @param listener - A listener to notify when the search is complete
   */
  startSearch: function(searchString, searchParam, result, listener) {
      //var bb = gBrowser;
      var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                             .getService(Components.interfaces.nsIWindowMediator);
      var mainWindow = wm.getMostRecentWindow("navigator:browser"); 
      var bb = mainWindow.getBrowser();
      var results = [];
      var comments = [];
      var images = [];
      var num = bb.browsers.length;

      // TODO prioritize results by remembering users' choices
      // TODO Chinese pinyin support
      var tokens = searchString.split(/\s+/);
      var matchers = new Array(tokens.length);
      for (var i = 0; i < tokens.length; i++) {
          matchers[i] = new RegExp(tokens[i], "i");
      }
      for (var i = 0; i < num; i++) {
          var b = bb.getBrowserAtIndex(i);
          var tab = bb.mTabContainer.childNodes[i];
          var label = tab.label
          var url = b.currentURI.spec;
          if (this._match(matchers, label, url)) {
              results.push((i+1) + " - " + label);
              comments.push(url);
              images.push(tab.image);
          }
      }
      var newResult = new SimpleAutoCompleteResult(searchString,
            results.length == 0 ? Ci.nsIAutoCompleteResult.RESULT_NOMATCH : Ci.nsIAutoCompleteResult.RESULT_SUCCESS,
            0, "", results, comments, images);
      listener.onSearchResult(this, newResult);
  },

  /*
   * Stop an asynchronous search that is in progress
   */
  stopSearch: function() {
  },

  _match: function(matchers, label, url) {
    for (var i = 0; i < matchers.length; i++) {
        if (!matchers[i].test(label) && !matchers[i].test(url)) {
            return false;
        }
    }
    return true;
  },
    
  QueryInterface: function(aIID) {
    if (!aIID.equals(Ci.nsIAutoCompleteSearch) && !aIID.equals(Ci.nsISupports))
        throw Components.results.NS_ERROR_NO_INTERFACE;
    return this;
  }
};

// Factory
var SimpleAutoCompleteSearchFactory = {
  singleton: null,
  createInstance: function (aOuter, aIID) {
    if (aOuter != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    if (this.singleton == null)
      this.singleton = new SimpleAutoCompleteSearch();
    return this.singleton.QueryInterface(aIID);
  }
};

// Module
var SimpleAutoCompleteSearchModule = {
  registerSelf: function(aCompMgr, aFileSpec, aLocation, aType) {
    aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, CONTRACT_ID, aFileSpec, aLocation, aType);
  },

  unregisterSelf: function(aCompMgr, aLocation, aType) {
    aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);        
  },
  
  getClassObject: function(aCompMgr, aCID, aIID) {
    if (!aIID.equals(Components.interfaces.nsIFactory))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

    if (aCID.equals(CLASS_ID))
      return SimpleAutoCompleteSearchFactory;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  canUnload: function(aCompMgr) { return true; }
};

// Module initialization
function NSGetModule(aCompMgr, aFileSpec) { return SimpleAutoCompleteSearchModule; }
