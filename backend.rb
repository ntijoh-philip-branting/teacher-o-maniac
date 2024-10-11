require 'sinatra'
require 'sqlite3'
require 'bcrypt'
require_relative 'db/seed'

class Backend < Sinatra::Base
  enable :sessions

  def db
    @db ||= SQLite3::Database.new('./db/database.db').tap do |db|
      db.results_as_hash = true
    end
  end

  get '/' do
    erb :index
  end

  # Login
  post '/login' do
    content_type :json
    user = db.execute('SELECT * FROM users WHERE name = ?', params[:name]).first
  
    if user && BCrypt::Password.new(user['password']) == params[:password]
      session[:user_id] = user['id']
      { result: 'success', message: 'Inloggning lyckades!' }.to_json
    else
      { result: 'error', message: 'Felaktigt användarnamn eller lösenord.' }.to_json
    end
  end

  # Logout
  post '/logout' do
    session.clear
    { result: 'success', message: 'Utloggning lyckades!' }.to_json
  end

  # Search for cache
  get '/cache/:id' do
    content_type :json
    cache_entry = db.execute('SELECT * FROM cache WHERE id = ?', params[:id]).first

    if cache_entry
      { result: 'success', data: cache_entry }.to_json
    else
      halt 404, { result: 'error', message: 'Cache entry not found.' }.to_json
    end
  end

  # Add cache
  post '/cache' do
    content_type :json
    db.execute('INSERT INTO cache (name, cacheinfo) VALUES (?, ?)', [params[:name], params[:cacheinfo]])
    { result: 'success', message: 'Cachepost skapad!' }.to_json
  end

  # Update cache
  put '/cache/:id' do
    content_type :json
    db.execute('UPDATE cache SET cacheinfo = ? WHERE id = ?', [params[:cacheinfo], params[:id]])
    { result: 'success', message: 'Cachepost uppdaterad!' }.to_json
  end

  # Delete cache
  delete '/cache/:id' do
    content_type :json
    db.execute('DELETE FROM cache WHERE id = ?', params[:id])
    { result: 'success', message: 'Cachepost raderad!' }.to_json
  end
end
