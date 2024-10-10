require 'debug'
# use binding.break for debug

class Server < Sinatra::Base

    def initialize
        super
        @db = SQLite3::Database.new('db/company.db')
        @db.results_as_hash = true
    end

    set :protection, false

    get '/' do
        erb :layout 
    end


  
end
