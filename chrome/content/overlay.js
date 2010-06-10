var tabby = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("tabby-strings");
  },
};

window.addEventListener("load", tabby.onLoad, false);
