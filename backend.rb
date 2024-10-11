require 'sinatra'
require 'sqlite3'
require 'bcrypt'
require 'json'
require_relative 'db/seed'

class Backend < Sinatra::Base
  enable :sessions

  def db
    @db ||= SQLite3::Database.new('./db/database.db').tap do |db|
      db.results_as_hash = true
    end
  end

  get '/' do
    erb :layout
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
  get '/cache/:input_name' do
    content_type :json
    cache_entry = db.execute('SELECT * FROM cache WHERE name = ?', params[:input_name]).first
  
    if cache_entry
      # Parse the JSON stored in the cacheinfo field and return it
      cacheinfo = JSON.parse(cache_entry['cacheinfo'])
  
      { result: 'success', data: { id: cache_entry['id'], name: cache_entry['name'], cacheinfo: cacheinfo } }.to_json
    else
      halt 404, { result: 'error', message: 'Cache entry not found.' }.to_json
    end
  end
  

  # Add cache
  post '/cache' do
    content_type :json
  
    # Parse the incoming JSON data
    data = JSON.parse(request.body.read)
    
    name = data['name']
    cacheinfo = data['cacheinfo']  # This should be an array of repos
  
    # Store the entire array of repositories as a JSON string
    db.execute('INSERT INTO cache (name, cacheinfo) VALUES (?, ?)', [name, cacheinfo.to_json])
  
    { result: 'success', message: 'Cache data stored successfully!' }.to_json
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


  put '/forks' do
    content_type :json

    # Parse the incoming JSON data
    data = JSON.parse(request.body.read)

    name = data['full_name']
    cachecomment = data['comment']  # This should be a string
    status = data['option']

    p name
    p cachecomment
    p status

    # Ensure cachecomment and status are present
    if cachecomment.nil? || status.nil?
        halt 400, { result: 'error', message: 'Comment and status must be provided.' }.to_json
    end

    # Update the data in the database
    result = db.execute('UPDATE forks SET comment = ?, status = ? WHERE name = ?', [cachecomment, status, name])

    # Check if the update was successful
    if result.empty?
        halt 404, { result: 'error', message: 'No record found to update.' }.to_json
    else
        { result: 'success', message: 'Data updated successfully!' }.to_json
    end
end


end
