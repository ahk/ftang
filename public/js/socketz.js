$(function() {
  console.log('did runnin')
  socket = new io.Socket('localhost', {port : 8080});
  socket.connect();
  //socket.send('some data');
  //socket.on('message', function(data){
    //alert('got some data' + data);
  //});
  
});
