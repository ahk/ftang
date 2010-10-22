require 'json'

module Ftang
  class PlayerCommand
    def initialize(client_id, name)
      @name = name 
      @client_id = client_id
    end

    def to_json
      {
        :client_id  => @client_id,
        :command => @name
      }.to_json
    end
  end
end
