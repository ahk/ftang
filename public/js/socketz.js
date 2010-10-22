$(function() {
  var ws;

if ("WebSocket" in window) {
  console.log("Horray you have web sockets Trying to connect...");
  ws = new WebSocket("ws://localhost:8081");

  ws.onopen = function() {
    // Web Socket is connected. You can send data by send() method.
    console.log("connected...");
    ws.send("hello from the browser");
    ws.send("more from browser");
  };

  ws.onmessage = function (evt)
  {
    var data = evt.data;
    console.log(data);
  };

  ws.onclose = function()
  {
    console.log(" socket closed");
  };

} else {
  alert("You have no web sockets");
};

setInterval(function(){ws.send('ping!')},1000)

});
