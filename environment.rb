require 'music-cache'
require 'haml'
require 'sass/plugin/rack'
require 'sinatra/base'
require 'pow'

class FTANG < Sinatra::Base
  use Rack::Session::Pool
  use Sass::Plugin::Rack
  Sass::Plugin.options[:css_location] = "./public/css" 
  Sass::Plugin.options[:template_location] = "./views"

  configure do
    set :root, File.dirname(__FILE__)
    set :views, Proc.new { File.join(root, "views") }
    set :public, Proc.new { File.join(root, "public") }
    set :database, Proc.new { @database ||= MusicCache::Database.new}
    set :collection_name, 'music'
    # I suggest symlinking this
    set :music_dir, Proc.new { File.join(public, 'music')}
    enable :logging
  end

  helpers do
    
    def database
      settings.database
    end
    
    def partial(page, options={})
      haml page, options.merge!(:layout => false)
    end
    
    def reset_session
      env['rack.session'] = {}
    end
    
    def get_cover(artist, album)
      Pow("#{settings.music_dir}/#{artist}/#{album}").files.each do |file|
        if file.extension =~ /jpe?g|png/i
          return file
        end
      end
      nil
    end
    
    def capture(*args)
      args.each_with_index do |arg, i|
        instance_variable_set("@#{arg}".to_sym, params[:captures][i])
      end
    end
    
    def get_relative_path(path)
      path.gsub('/Users/andrew/Music/iTunes/iTunes Media/Music', 'music')
    end
  end

  not_found do
    haml :"404"
  end
end

