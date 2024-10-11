require 'sqlite3'
require 'pp'
require 'bcrypt'

# Connect to the SQLite database
db = SQLite3::Database.new 'db/database.db'

# Drop and recreate the 'users' table with GitHub data fields
db.execute('DROP TABLE IF EXISTS users')
db.execute('CREATE TABLE users
               (id INTEGER PRIMARY KEY AUTOINCREMENT,
                github_id INTEGER UNIQUE, 
                username TEXT,
                name TEXT NOT NULL,
                password TEXT,
                avatar_url TEXT,
                html_url TEXT,
                public_repos INTEGER
               )')

# Drop and recreate the 'cache' table
db.execute('DROP TABLE IF EXISTS cache')
db.execute('CREATE TABLE cache
               (id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                cacheinfo TEXT NOT NULL
               )')

# Drop and recreate the 'forks' table
db.execute('DROP TABLE IF EXISTS forks')
db.execute('CREATE TABLE forks
               (id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                comment TEXT,
                status TEXT CHECK(status IN ("done", "not done", "not reviewed")) NOT NULL DEFAULT "not reviewed"
               )')

puts 'Tables have been created successfully!'

# Example data for a local user (non-GitHub)
local_user_name = 'JohnDoe'
local_user_password = BCrypt::Password.create('123456')  # Hash the password using BCrypt

# Example data for a GitHub user
github_user_id = 123456
github_username = 'githubUser123'
github_name = 'JaneDoe'
github_avatar_url = 'https://github.com/images/avatar.jpg'
github_html_url = 'https://github.com/githubUser123'
github_public_repos = 42

# Insert local user data into the 'users' table
db.execute('INSERT INTO users (name, password) VALUES (?, ?)', [local_user_name, local_user_password])

# Insert GitHub user data into the 'users' table
db.execute('INSERT INTO users (github_id, username, name, avatar_url, html_url, public_repos) VALUES (?, ?, ?, ?, ?, ?)', 
           [github_user_id, github_username, github_name, github_avatar_url, github_html_url, github_public_repos])

# Example data for the cache table
cache_name = 'example_cache_entry'
cache_info = 'example_cache_info'

# Insert data into the 'cache' table
db.execute('INSERT INTO cache (name, cacheinfo) VALUES (?, ?)', [cache_name, cache_info])

# Verify the data insertion by printing the 'users' and 'cache' tables
db.results_as_hash = true
pp user_result = db.execute('SELECT * FROM users')
pp cache_result = db.execute('SELECT * FROM cache')
