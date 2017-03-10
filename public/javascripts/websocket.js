/*var webSocketHost = location.protocol === 'https:' ? 'wss://' : 'ws://';
var externalIp = $('body').data('external-ip');
var webSocketUri =  webSocketHost + externalIp + ':65080/echo';

/* Helper to keep an activity log on the page. */
/*function log(text){
  status.text(status.text() + text + '\n');
}

/* Establish the WebSocket connection and register event handlers. */
/*var websocket = new WebSocket(webSocketUri);

websocket.onopen = function() {
  log('Connected');
};

websocket.onclose = function() {
  log('Closed');
};

websocket.onmessage = function(e) {
  log('Message received');
  console.log(e.data)
};

websocket.onerror = function(e) {
  log('Error (see console)');
  console.log(e);
};*/