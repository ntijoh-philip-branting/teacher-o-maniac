require 'sinatra'
require 'sqlite3'
require 'bcrypt'
require_relative 'db/seed'
class Backend < Sinatra::Base
  enable :sessions
  def db
    @db ||= SQLite3::Database.new('./db/db.sqlite').tap do |db|
      db.results_as_hash = true
    end
  end
  get '/' do
    erb :index
  end

  #destroy
  delete '/api/employees/:id' do
    content_type :json
    result = @db.execute('DELETE FROM employees WHERE id = ?', params['id'])
    return {result: 'success'}.to_json
end
  
end