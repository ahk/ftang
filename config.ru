require '/home/maxo/.gems/gems/rack-0.9.1/lib/rack.rb'
require '/home/maxo/.gems/gems/sinatra-0.9.2/lib/sinatra.rb'
require '/home/maxo/.gems/gems/pow-0.2.2/lib/pow.rb'
require '/home/maxo/.gems/gems/haml-2.0.9/lib/haml.rb'
require 'ftang.rb'
log = File.new("log/sinatra.log", "w")
STDOUT.reopen(log)
STDERR.reopen(log)
run Sinatra::Application