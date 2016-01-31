(function (console) {
  "use strict";

  console.log('reloaded!');
    
  const CHROME_EXTENSION_URL = 'http://ru.lipsum.com/';
  const SOCKET_IO_PORT = '8890';

  var socket = io('http://localhost:' + SOCKET_IO_PORT);

  reloadExtensions();

  function reloadTab(tab) {
    console.log('reloading tab', tab);
    chrome.tabs.reload(tab.id);
  }

  function reloadExtensions() {
    // search for any open extension tab and reload
    chrome.tabs.query({
      url: "*://*/*"
    }, function (tabs) {
      console.log('found tabs', tabs.length, tabs);

      if (tabs.length) {
        tabs.slice(0, 1).map(reloadTab);
      }
    });
  }

  socket.on('file.change', function () {
    console.log('received ping');
    chrome.runtime.reload();
    // reloadExtensions();
  });

})(window.console);