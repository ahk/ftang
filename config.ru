require 'rubygems'
require 'bundler/setup'

require 'logger'
require 'rack'
require 'sinatra'
require 'haml'
require 'environment'
require 'ftang'
require 'cgi'
require 'sass/plugin/rack'
require 'json'

use Sass::Plugin::Rack
Sass::Plugin.options[:css_location] = "./public" 
Sass::Plugin.options[:template_location] = "./views"

log = File.new("log/sinatra.log", "a+")
STDOUT.reopen(log)
STDERR.reopen(log)

run Sinatra::Application
