// https://github.com/robin-drexler/chrome-extension-auto-reload-watcher/blob/master/Gulpfile.js
// https://github.com/robin-drexler/chrome-extension-auto-reload/blob/master/app/js/background.js
var globalInsertEvent;
var selectedText;
console.log("Hello!")


chrome.extension.onMessage.addListener(function (msg, sender, sendResponse){
  if (msg.selectionText) {
    hideOccurrences(msg.selectionText);
  } else {
    console.log(selectedText + '!!');
  }
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
    if (node.parentNode && node.parentNode.nodeName == "SCRIPT") return;  
    if (!node.parentNode) return;
    if (node.nodeType === 3) { // Is it a Text node?
      var nodeText = node.data.trim();
      if (nodeText.length > 0) { // Does it have non white-space text content?
        var indexOf = node.parentNode.innerHTML.toLowerCase().indexOf(text); 
        // todo - if innerHTML has more than one text occurence, check every one
        if (indexOf >= 0) {           
          var newInnerHtml = node.parentNode.innerHTML.split(''); 
          
          var newText = '<span class="hideway-hide">' + text + '</span>';
          
          newInnerHtml.splice(indexOf, text.length, newText);
          window.block = true;
          node.parentNode.innerHTML = newInnerHtml.join('');
          window.block = false;
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
      if (window.block) return;
      if (mutation.target.className && mutation.target.className.indexOf('hideway-hide') != -1) return;
      var node = mutation.target;
      walkTheDOM(node, processOccurence(text));
    }
    return test;
  }(text);

  document.body.addEventListener("DOMNodeInserted", globalInsertEvent, false);
}

document.addEventListener('contextmenu', function(e) {
  var selection = window.getSelection();
  var _selectedText = selection.toString();

  if (!_selectedText) {
    selection.modify('extend','backward','word');        
    var b = selection.toString();

    selection.modify('extend','forward','word');
    var a = selection.toString();
    selection.modify('move','forward','character');

    selectedText = (b + a).trim();
    if (confirm("Скрыть " + selectedText + "?(" + selectedText.length + ")")) {
      hideOccurrences(selectedText);
    }
    return e.preventDefault();
  } else {
    selectedText = _selectedText;
  }

  // hideOccurrences(selectedText);
  // chrome.storage.local.set({"selectedText": selectedText})

}, false);


      