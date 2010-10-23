$(function() {
  var ws;

  if ("WebSocket" in window) {
    console.log("Horray you have web sockets Trying to connect...");
    ws = new WebSocket("ws://"+ window.location.hostname +":8081");

    ws.onopen = function() {
      FTANGPlayer.setWS(ws);
      FTANGPlayer.broadcastAction('getClientId')
    };

    ws.onmessage = function (evt)
    {
      console.log('incoming: ', evt.data)
      var data = $.parseJSON(evt.data);
      FTANGPlayer.handleWS(data);
    };

    ws.onclose = function()
    {
      console.log("ftang socket closed");
    };

  } else {
    alert("You FUNDAMENTALLY LACK web sockets");
  };

});
