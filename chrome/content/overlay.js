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

var tabby = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("tabby-strings");

    input = document.getElementById("tabby-input");
  },

  onKeyPress: function(e) {
    if (e.keyCode == e.DOM_VK_ESCAPE) {
        this.hide_toolbar();
    }
  },

  onTextEntered: function(obj) {
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
