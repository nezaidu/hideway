// https://github.com/robin-drexler/chrome-extension-auto-reload-watcher/blob/master/Gulpfile.js
// https://github.com/robin-drexler/chrome-extension-auto-reload/blob/master/app/js/background.js
var globalInsertEvent;
var selectedText;


chrome.extension.onMessage.addListener(function (msg, sender, sendResponse){
  if (msg.selectionText) {
    chrome.storage.local.get("words", function(response) {
      var words = response.words;
      words.push(msg.selectionText);
      chrome.storage.local.set({words: words}, function() {
        window.location.reload();
      })
    })
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

function highlightWords(text, keyword) {
  // http://stackoverflow.com/questions/24234304/regex-match-entire-word-characters-between-whitespace-that-contain-letters-i
  var words = text.split(" ");
  var keep = [];
  
  for (var i = 0; i < words.length; i++) {
    if (words[i].indexOf("spanclass") != -1) {
      keep.push({"index": i, "word": words[i]});
      words[i] = "EXCLUDE";
    }
  };

  text = words.join(" ");
  var regexp = new RegExp('(\\S*' + keyword + '(?!span)\\S*)', 'gi');

  words = text.split(" ");

  for (var i = 0; i < keep.length; i++) {
    words[keep[i]["index"]] = keep[i]["word"];
  };
  text = words.join(" ");

  return text.replace(regexp, "<spanclass='hideway-hide'>$1</span>");
}

function processOccurence(words) {
  function _processOccurence(node) {
    if (node.parentNode && node.parentNode.nodeName == "SCRIPT") return;  
    if (!node.parentNode) return;
    if (node.nodeType === 3) { // Is it a Text node?
      var nodeText = node.data.trim().toLowerCase();

      if (nodeText.length > 0) { 
        var newNode = document.createElement('span');
        var newInnerHtml = node.data;

        for (index in words) {
          var newInnerHtml = highlightWords(newInnerHtml, words[index]);
        }

        if (newInnerHtml.indexOf('<span') != -1) {
          newNode.innerHTML = newInnerHtml.replace(/spanclass/g, 'span class')
          // newNode.className = 'hideway-hide2';
          window.block = true;
          node.parentNode.replaceChild(newNode, node);
          window.block = false;
        }
      }
    }
  }

  return _processOccurence;
}

function hideOccurrences(words) {
  walkTheDOM(document.body, processOccurence(words));

  document.body.removeEventListener("DOMNodeInserted", globalInsertEvent, false);

  globalInsertEvent = function(words) {
    function test(mutation) { 
      if (window.block) return;
      if (mutation.target.className && mutation.target.className.indexOf('hideway-hide') != -1) return;
      var node = mutation.target;
      walkTheDOM(node, processOccurence(words));
    }
    return test;
  }(words);

  document.body.addEventListener("DOMNodeInserted", globalInsertEvent, false);
}

document.addEventListener('contextmenu', function(e) {
  var selection = window.getSelection();
  var _selectedText = selection.toString();

  if (!_selectedText) {
    if (!e.ctrlKey) return;
    selection.modify('extend','backward','word');        
    var b = selection.toString();

    selection.modify('extend','forward','word');
    var a = selection.toString();
    selection.modify('move','forward','character');

    selectedText = (b + a).trim();
    if (confirm("Скрыть " + selectedText + "?(" + selectedText.length + ")")) {
      chrome.storage.local.get("words", function(response) {
        var words = response.words;
        words.push(selectedText);
        chrome.storage.local.set({words: words}, function() {
          window.location.reload();
        })
      })
    }
    return e.preventDefault();
  } else {
    selectedText = _selectedText;
  }
  // chrome.storage.local.set({"selectedText": selectedText})

}, false);

chrome.storage.local.get("words", function(response) {
  hideOccurrences(response.words);
})

// chrome.storage.local.set({"words": [
//   "касьянов", "крымнаш", "путин", "кадыров", "чечня", 
//   "собянин", "навальный", "единая россия", 
//   "чайка", "дальнобойщик", "ходорковск"]}, function() {

//   })
