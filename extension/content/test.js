// https://github.com/robin-drexler/chrome-extension-auto-reload-watcher/blob/master/Gulpfile.js
// https://github.com/robin-drexler/chrome-extension-auto-reload/blob/master/app/js/background.js
var globalInsertEvent;

console.log("Hello!")

chrome.extension.onMessage.addListener(function (msg, sender, sendResponse){
  hideOccurrences(msg.selectionText);
});

function walkTheDOM(node, func) {
    func(node);
    node = node.firstChild;
    while (node) {
      setTimeout(walkTheDOM, 0, node, func);
      node = node.nextSibling;
    }
}

function processOccurence(text) {
  function _processOccurence(node) {
    if (node.parentNode.nodeName == "SCRIPT") return;  
    if (node.nodeType === 3) { // Is it a Text node?
      var nodeText = node.data.trim();
      if (nodeText.length > 0) { // Does it have non white-space text content?
        var indexOf = node.parentNode.innerHTML.toLowerCase().indexOf(text); 
        if (indexOf >= 0) {           
          var newInnerHtml = node.parentNode.innerHTML.split(''); 
          
          var newText = '<span class="hideway-hide">' + text + '</span>';
          
          newInnerHtml.splice(indexOf, text.length, newText);
          node.parentNode.innerHTML = newInnerHtml.join('');
        }
      }
    }
  }

  return _processOccurence;
}

function hideOccurrences(text) {
  text = text.toLowerCase();
  walkTheDOM(document.body, processOccurence(text));

  document.body.removeEventListener("DOMNodeInserted", globalInsertEvent, false);

  globalInsertEvent = function(text) {
    function test(mutation) { 
      var node = mutation.target;
      walkTheDOM(node, processOccurence(text));
    }
    return test;
  }(text);

  document.body.addEventListener("DOMNodeInserted", globalInsertEvent, false);
}

