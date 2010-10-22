require 'rubygems'
require 'bundler/setup'
#require 'em-websocket'
require 'lib/ftang'
    # A simple echo server example
require "sunshowers"
require 'rainbows'
use Rack::ContentLength

#class Sinatra::Request < Rack::Request
  #include Sunshowers::WebSocket
#end
run lambda { |env|
  req = Sunshowers::Request.new(env)
  if req.ws?
    req.ws_handshake!
    ws_io = req.ws_io
    ws_io.each do |record|
      ws_io.write(record)
      break if record == "Goodbye"
    end
    req.ws_quit! # Rainbows! should handle this quietly
  end
  FTANG.call(env)
}
#FTANG.run!(:port => 8080)
#run FTANG
#EventMachine.run do     # <-- Changed EM to EventMachine

  #EventMachine::WebSocket.start(:host => '0.0.0.0', :port => 8081) do |ws| # <-- Added |ws|
      ## Websocket code here
      ##
      #js = %Q(
          #{'jsonp' : function () { console.log('shirtz'); }}
      #)

      #ws.onopen {
             #ws.send js
      #}

      #ws.onmessage { |msg|
          #puts "got message #{msg}"
      #}

      #ws.onclose   {
          #puts 'close'
          #ws.send "WebSocket closed"
      #}

  #end

  ## You could also use Rainbows! instead of Thin.
  ## Any EM based Rack handler should do.
  #FTANG.run!(:port => 8080)

#end
