require 'sinatra'
require 'sqlite3'
require 'bcrypt'
require 'httparty'
require 'json'
require 'dotenv/load'
require 'logger'
require_relative 'db/seed'

class Backend < Sinatra::Base
  enable :sessions

  def initialize
    super
    @logger = Logger.new(STDOUT)  # Initialize logger
  end

  def db
    @db ||= SQLite3::Database.new('./db/database.db').tap do |db|
      db.results_as_hash = true
    end
  end

  CLIENT_ID = ENV['CLIENT_ID']
  CLIENT_SECRET = ENV['CLIENT_SECRET']
  REDIRECT_URI = 'http://localhost:9292/callback'

  get '/seed' do
    @logger.info("GET /seed called")
    seeder = DatabaseSeeder.new
    seeder.create_tables
    redirect '/'
  end
  
  get '/' do
    logged_in = !!session[:github_user_id]
    erb :apiTestcases, locals: { logged_in: logged_in }
  end

  get '/api/login-status' do
    @logger.info("GET /api/login-status called")
    content_type :json
    { logged_in: !!session[:github_user_id], user: session[:github_user_id] }.to_json
  end

  get '/callback' do
    @logger.info("GET /callback called with params: #{params.inspect}")
    code = params[:code]

    # Ensure the code is present
    unless code
      @logger.error("No code provided in the callback.")
      halt 400, { error: 'No code provided.' }.to_json
    end

    response = HTTParty.post('https://github.com/login/oauth/access_token', {
      body: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        redirect_uri: REDIRECT_URI
      },
      headers: { 'Accept' => 'application/json' }
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
      store_user_info(user_data)
      session[:github_user_id] = user_data['id']
      @logger.info("User successfully authenticated: #{user_data['login']}")
      redirect '/'
    else
      @logger.error("Authentication failed: #{token_info}")
      status 500
      { error: 'Authentication failed' }.to_json
    end
  end

  def store_user_info(user_data)
    @logger.info("Storing user info for github_id: #{user_data['id']}")
    db.execute('INSERT OR REPLACE INTO users (github_id, username, name, avatar_url, html_url, public_repos) VALUES (?, ?, ?, ?, ?, ?)', [
      user_data['id'],
      user_data['login'],
      user_data['name'],
      user_data['avatar_url'],
      user_data['html_url'],
      user_data['public_repos']
    ])
    @logger.info("User info stored for github_id: #{user_data['id']}")
  end

  get '/api/user' do
    @logger.info("GET /api/user called")
    @logger.info("Session data: #{session.inspect}")
    
    content_type :json
    github_user_id = session[:github_user_id]
  
    if github_user_id.nil?
      @logger.warn("No user logged in. Session user ID is nil.")
      status 401
      return { logged_in: false, user: nil }.to_json
    else
      @logger.info("User is logged in with github_user_id: #{github_user_id}")
    end
  
    user_info = db.execute('SELECT * FROM users WHERE github_id = ?', github_user_id).first
  
    if user_info
      @logger.info("User info retrieved: #{user_info.inspect}")
      { logged_in: true, user: user_info }.to_json
    else
      @logger.warn("User not found for github_id: #{github_user_id}")
      status 404
      { logged_in: false, user: nil }.to_json
    end
  end
  
  

  post '/login' do
    @logger.info("POST /login called with params: #{params.inspect}")
    content_type :json

    # Validate required params
    unless params[:name] && params[:password]
      @logger.error("Missing login parameters.")
      halt 400, { error: 'Missing username or password.' }.to_json
    end

    user = db.execute('SELECT * FROM users WHERE name = ?', params[:name]).first

    if user && BCrypt::Password.new(user['password']) == params[:password]
      session[:user_id] = user['id']
      @logger.info("Login successful for user: #{params[:name]}")
      { result: 'success', message: 'Login successful!' }.to_json
    else
      @logger.warn("Invalid login attempt for user: #{params[:name]}")
      { result: 'error', message: 'Invalid username or password.' }.to_json
    end
  end

  post '/logout' do
    @logger.info("POST /logout called")
    session.clear
    @logger.info("User logged out.")
    { result: 'success', message: 'Logout successful!' }.to_json
  end

  get '/cache/:id' do
    @logger.info("GET /cache/#{params[:id]} called")
    content_type :json
    cache_entry = db.execute('SELECT * FROM cache WHERE id = ?', params[:id]).first

    if cache_entry
      { result: 'success', data: cache_entry }.to_json
    else
      @logger.warn("Cache entry not found for id: #{params[:id]}")
      halt 404, { result: 'error', message: 'Cache entry not found.' }.to_json
    end
  end

  post '/cache' do
    @logger.info("POST /cache called with params: #{params.inspect}")
    content_type :json

    # Validate required params
    unless params[:name] && params[:cacheinfo]
      @logger.error("Missing cache parameters.")
      halt 400, { error: 'Missing name or cache info.' }.to_json
    end

    db.execute('INSERT INTO cache (name, cacheinfo) VALUES (?, ?)', [params[:name], params[:cacheinfo]])
    @logger.info("Cache entry created for name: #{params[:name]}")
    { result: 'success', message: 'Cache entry created!' }.to_json
  end

  put '/cache/:id' do
    @logger.info("PUT /cache/#{params[:id]} called with params: #{params.inspect}")
    content_type :json

    # Validate required params
    unless params[:cacheinfo]
      @logger.error("Missing cache info for update.")
      halt 400, { error: 'Missing cache info.' }.to_json
    end

    db.execute('UPDATE cache SET cacheinfo = ? WHERE id = ?', [params[:cacheinfo], params[:id]])
    @logger.info("Cache entry updated for id: #{params[:id]}")
    { result: 'success', message: 'Cache entry updated!' }.to_json
  end

  delete '/cache/:id' do
    @logger.info("DELETE /cache/#{params[:id]} called")
    content_type :json
    db.execute('DELETE FROM cache WHERE id = ?', params[:id])
    @logger.info("Cache entry deleted for id: #{params[:id]}")
    { result: 'success', message: 'Cache entry deleted!' }.to_json
  end
end