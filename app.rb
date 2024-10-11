require 'sinatra'
require 'httparty'
require 'json'
require 'dotenv/load'
require 'sqlite3'
require 'bcrypt'
require_relative 'db/seed'

class App < Sinatra::Base
  enable :sessions

  def db
    @db ||= SQLite3::Database.new('./db/database.db').tap do |db|
      db.results_as_hash = true
    end
  end

  # Your GitHub OAuth App Client ID and Client Secret
  CLIENT_ID = ENV['CLIENT_ID']
  CLIENT_SECRET = ENV['CLIENT_SECRET']
  REDIRECT_URI = 'http://localhost:9292/callback' # Ensure this matches your GitHub app settings

  # Route to serve your HTML with ERB
  get '/' do
    logged_in = !!session[:github_user_id]  # Check if the user is logged in
    erb :apiTestcases, locals: { logged_in: logged_in }  # Pass the login status to the view
  end

  # Check if user is logged in
  get '/api/login-status' do
    content_type :json
    if session[:github_user_id]
      { logged_in: true, user: session[:github_user_id]}.to_json
    else
      { logged_in: false }.to_json
    end
  end


  # Route to handle the GitHub OAuth callback
  get '/callback' do
    code = params[:code]
    puts("Issuing Callback")

    # Exchange the code for an access token
    response = HTTParty.post('https://github.com/login/oauth/access_token', {
      body: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        redirect_uri: REDIRECT_URI
      },
      headers: {
        'Accept' => 'application/json'
      }
    })

    token_info = JSON.parse(response.body)
    access_token = token_info['access_token']

    if access_token
      user_response = HTTParty.get('https://api.github.com/user', {
        headers: {
          'Authorization' => "token #{access_token}",
          'User-Agent' => 'YourAppName' 
        }
      })

      user_data = JSON.parse(user_response.body)

      # Store user information in the local database
      store_user_info(user_data)

      # Store the GitHub user ID in the session
      session[:github_user_id] = user_data['id']
      # Render a new view to display the user data
      erb :user_profile, locals: { user: user_data }
    else
      puts "GitHub response: #{token_info}" # Log for debugging
      status 500
      { error: 'Authentication failed' }.to_json
    end
  end

  # Method to store user information in the database
  def store_user_info(user_data)
    # db.execute('INSERT OR REPLACE INTO users (github_id, username, name, avatar_url, html_url, public_repos) VALUES (?, ?, ?, ?, ?, ?)', 
    #   user_data['id'], 
    #   user_data['login'], 
    #   user_data['name'], 
    #   user_data['avatar_url'], 
    #   user_data['html_url'], 
    #   user_data['public_repos']
    # )
  end

  # Route to get the currently logged-in user's information
  get '/api/user' do
    content_type :json

    # Get the user ID from the session
    github_user_id = session[:github_user_id]

    # Fetch user information from the database
    user_info = db.execute("SELECT * FROM users WHERE github_id = ?", github_user_id).first

    if user_info
      user_info.to_json
    else
      status 404
      { error: 'User not found' }.to_json
    end
  end

  # Login
  post '/login' do
    content_type :json
    user = db.execute('SELECT * FROM users WHERE name = ?', params[:name]).first
  
    if user && BCrypt::Password.new(user['password']) == params[:password]
      session[:user_id] = user['id']
      { result: 'success', message: 'Login successful!' }.to_json
    else
      { result: 'error', message: 'Invalid username or password.' }.to_json
    end
  end

  # Logout
  post '/logout' do
    session.clear
    { result: 'success', message: 'Logout successful!' }.to_json
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
    { result: 'success', message: 'Cache entry created!' }.to_json
  end

  # Update cache
  put '/cache/:id' do
    content_type :json
    db.execute('UPDATE cache SET cacheinfo = ? WHERE id = ?', [params[:cacheinfo], params[:id]])
    { result: 'success', message: 'Cache entry updated!' }.to_json
  end

  # Delete cache
  delete '/cache/:id' do
    content_type :json
    db.execute('DELETE FROM cache WHERE id = ?', params[:id])
    { result: 'success', message: 'Cache entry deleted!' }.to_json
  end
end
