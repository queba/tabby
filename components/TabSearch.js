Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function TabSearch() {
    this.wrappedJSObject = this;
}

TabSearch.prototype = {
    classDescription : "Auto completing tab searching",
    classID : Components.ID("{a9a434f0-a6a1-11de-8a39-0800200c9a66}"),
    contractID : "@software.nju.edu.cn/tabsearch;1",
}

