chrome.contextMenus.create({
  "title": "Скройте текст", 
  "contexts":["selection"],
  "onclick": function(info, tab) {
    chrome.tabs.sendMessage(tab.id, info, function(){});
  }
});  
