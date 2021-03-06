/*
 * Copyright (c) 2010, Yin QIU
 * All rights reserved.

 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:

 *   * Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *   * Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *   * Neither the name of the Nanjing University nor the names of its
 *     contributors may be used to endorse or promote products derived from
 *     this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// the following code was originally from MDN at
// https://developer.mozilla.org/en/How_to_implement_custom_autocomplete_search_component

const Ci = Components.interfaces;

const CLASS_ID = Components.ID("24dbbc70-73a6-11df-93f2-0800200c9a66");
const CLASS_NAME = "Tab Name AutoComplete";
const CONTRACT_ID = "@mozilla.org/autocomplete/search;1?name=tabby";

// Implements nsIAutoCompleteResult
function TabbyAutoCompleteResult(searchString, searchResult,
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

TabbyAutoCompleteResult.prototype = {
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
   * Return the label of the tab
   */
  getValueAt: function(index) {
    return this._results[index];
  },

  /**
   * Return the URI of the tab
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
   * Get the favicon of the tab at the specified index
   */
  getImageAt : function (index) {
    return this._images[index];
  },

  /**
   * Remove the value at the given index from the autocomplete results.
   * If removeFromDb is set to true, the value should be removed from
   * persistent storage as well.
   *
   * This function also closes the specified tab
   */
  removeValueAt: function(index, removeFromDb) {
                   /*
                    * *not working yet*
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                           .getService(Components.interfaces.nsIWindowMediator);
    var mainWindow = wm.getMostRecentWindow("navigator:browser"); 
    var bb = mainWindow.gBrowser;
    var closing_tab = this._results[index];
    var spacePos = closing_tab.indexOf(" ");
    var tabIndex = parseInt(closing_tab.substr(0, spacePos));
    bb.removeTab(bb.mTabContainer.getItemAtIndex(tabIndex - 1));

    this._results.splice(index, 1);
    this._comments.splice(index, 1);
    */
  },

  QueryInterface: function(aIID) {
    if (!aIID.equals(Ci.nsIAutoCompleteResult) && !aIID.equals(Ci.nsISupports))
        throw Components.results.NS_ERROR_NO_INTERFACE;
    return this;
  }
};


// Implements nsIAutoCompleteSearch
function TabbyAutoCompleteSearch() {
}

TabbyAutoCompleteSearch.prototype = {

  _input: null,

  set input(aInput) {
    this._input = aInput;
  },

  get input() {
    return this._input;
  },

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
          var escaped_token = tokens[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
          matchers[i] = new RegExp(escaped_token, "i");
      }
      for (var i = 0; i < num; i++) {
          var b = bb.getBrowserAtIndex(i);
          var tab = bb.mTabContainer.childNodes[i];
          var label = tab.label
          var url = b.currentURI.spec;
          if (this._match(matchers, label, url)) {
              results.push((i+1) + " - " + label);
              comments.push(url);
              images.push(tab.image ? tab.image : "chrome://mozapps/skin/places/defaultFavicon.png");
          }
      }
      var newResult = new TabbyAutoCompleteResult(searchString,
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
var TabbyAutoCompleteSearchFactory = {
  singleton: null,
  createInstance: function (aOuter, aIID) {
    if (aOuter != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    if (this.singleton == null)
      this.singleton = new TabbyAutoCompleteSearch();
    return this.singleton.QueryInterface(aIID);
  }
};

// Module
var TabbyAutoCompleteSearchModule = {
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
      return TabbyAutoCompleteSearchFactory;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  canUnload: function(aCompMgr) { return true; }
};

// Module initialization
function NSGetModule(aCompMgr, aFileSpec) { return TabbyAutoCompleteSearchModule; }
