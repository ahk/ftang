require 'music-cache'
require 'haml'
require 'sass/plugin/rack'
require 'sinatra/base'
require 'pow'

class FTANG < Sinatra::Base
  use Rack::Session::Cookie
  use Sass::Plugin::Rack
  Sass::Plugin.options[:css_location] = "./public/css" 
  Sass::Plugin.options[:template_location] = "./views"


  configure do
    set :root, File.dirname(__FILE__)
    set :views, Proc.new { File.join(root, "views") }
    set :public, Proc.new { File.join(root, "public") }
    enable :logging
    enable :sessions
    # I suggest symlinking this
    MUSIC_DIR = "music"
    NOT_A_SONG = /.jpe?g|.png|.gif|.DS_Store/i
    DATABASE = MusicCache::Database.new
  end

  helpers do
    
    def base_dir;"public/#{MUSIC_DIR}";end
    
    def partial(page, options={})
      haml page, options.merge!(:layout => false)
    end
    
    def reset_session
      env['rack.session'] = {}
    end
    
    def get_cover(artist, album)
      Pow("#{base_dir}/#{artist}/#{album}").files.each do |file|
        if file.extension =~ /jpe?g|png/i
          return "/#{MUSIC_DIR}/#{artist}/#{album}/#{file.name}"
        end
      end
      nil
    end
    
    def capture(*args)
      args.each_with_index do |arg, i|
        instance_variable_set("@#{arg}".to_sym, params[:captures][i])
      end
    end
    
    def mc_db
      DATABASE
    end
    
    def mc_collection
      'test'
    end
    
    def get_relative_path(path)
      path.gsub('/Users/andrew/Music/iTunes/iTunes Music/', '/music/')
    end
  end

  not_found do
    haml :"404"
  end
end

