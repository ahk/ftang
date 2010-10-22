require 'environment'
require 'json'
require 'cgi'
require 'lib/ftang/player_command'
require 'lib/ftang/playlist_pool'

module Ftang
  class Server < Sinatra::Base

    get '/' do
      #if request.ws?
          #request.ws_handshake!

          #request.ws_io.each do |record|
            #ws_io.write_utf8(record)
            #break if record == "Goodbye"
          #end

          #begin
            #request.ws_quit!
          #rescue
            #nil
          #end
      #end
      
      session[:playlist] ||= []
      haml :base
    end

    get '/artists' do
      @artists = database.get_artists(settings.collection_name)
      @artists.sort!
      partial :artists, :locals => {:artists => @artists}
    end

    get %r{/play/([^/]+)} do
      capture :artist
      
      @albums_covers = {}
      database.get_albums(settings.collection_name, @artist).each do |album|
        @albums_covers.merge!({"#{album}" => "missing"})
      end
      
      @albums_covers = @albums_covers.sort {|a,b| a[1]<=>b[1]}
      partial :albums, :locals => {:artist => @artist, :albums => @albums_covers}
    end

    get %r{/playlist/add/([^/]+)/([^/]+)} do
      capture :artist, :album
      p "artist: #{@artist}, album: #{@album}"
      @songs = database.get_tracks(settings.collection_name, @artist, @album).map do |track_path|
        tags = database.get_tags(settings.collection_name, @artist, @album, track_path)
        { 
          "name" => tags['title'],
          "mp3" => get_relative_path(track_path),
          "tracknum" => tags['tracknum'] || 0
        }
      end
      @songs = @songs.sort_by { |song| song['tracknum'].to_i }
      @songs.each {|song| session[:playlist] << song}
      @songs.to_json
    end

    get %r{/playlist/delete/([^/]+)} do
      capture :song_index
      session[:playlist].delete_at(@song_index.to_i)
      200
    end

    get '/playlist/load' do
      content_type :json
      session[:playlist].to_json
    end

    get '/playlist/clear' do
      session[:playlist] = []
      200
    end

    get '/session/clear' do
      reset_session
      200
    end

  end
end
