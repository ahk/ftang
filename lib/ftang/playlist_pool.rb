module Ftang
  class PlaylistPool
    def initialize
      @playlists = []
    end

    def broadcast(command)
      @playlists.each do |playlist|
        playlist.send(command.to_json)
      end
    end

    def delete(playlist)
      @playlists.delete(playlist)
    end

    def add(playlist)
      @playlists.push(playlist)
    end

    def get_id(playlist)
      @playlists.index(playlist)
    end
  end
end
