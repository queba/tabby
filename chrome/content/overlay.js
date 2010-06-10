var tabby = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("tabby-strings");
  },

  onKeyPress: function(e) {
    if (e.keyCode == e.DOM_VK_ESCAPE) {
        this.hide_toolbar();
    }
  },

  onChange: function(obj) {
    var ctrl = obj.controller;
    if (ctrl.searchStatus == ctrl.STATUS_COMPLETE_MATCH) {
        var selected = obj.textValue;
        // FIXME this is really only a temporary hack...
        var re = /\d+ - /;
        if (re.test(selected)) {
            var spacePos = selected.indexOf(" ");
            var tabIndex = parseInt(selected.substr(0, spacePos));
            gBrowser.mTabContainer.selectedIndex = tabIndex - 1;
        }
    }
  },

  toggle_toolbar: function() {
    var toolbar = document.getElementById("tabby-bar");
    var input = document.getElementById("tabby-input");
    if (toolbar.getAttribute("hidden") == "") {
        input.inputField.blur();
        input.blur();
    } else {
        toolbar.setAttribute("hidden", "");
        input.inputField.focus();
        input.focus();
        input.select();
    }
  },

  hide_toolbar: function() {
    var toolbar = document.getElementById("tabby-bar");
    var input = document.getElementById("tabby-input");
    input.inputField.blur();
    input.blur();
    toolbar.setAttribute("hidden", "true");
  },

};

window.addEventListener("load", tabby.onLoad, false);
