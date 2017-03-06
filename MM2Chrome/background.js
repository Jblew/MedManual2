/* global chrome */

chrome.browserAction.onClicked.addListener(function(tab) {
   window.open('tree.html', "", "height=800,width=600");
});