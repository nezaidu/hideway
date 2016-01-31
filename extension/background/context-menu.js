chrome.contextMenus.create({
  "title": "Скрыть '%s'", 
  "id": "main",
  "contexts":["selection", "all"],
  "onclick": function(info, tab) {
    chrome.tabs.sendMessage(tab.id, info, function(){});
  }
});  

chrome.runtime.onMessage.addListener(function(msg, tab, sendResponse) {
  chrome.contextMenus.update("main", {title: msg.newValue});
  sendResponse();  
})

// chrome.storage.onChanged.addListener(function(changes, namespace) {
//     for (key in changes) {
//       var storageChange = changes[key];
//       if (key == "selectedText") {
//         chrome.contextMenus.update("main", {title: changes[key].newValue});
//       };
//     }    
// })
