require 'sqlite3'
require 'pp'
require 'bcrypt'

# Connect to the SQLite database
db = SQLite3::Database.new 'db/database.db'

# Drop and recreate the 'users' table
db.execute('DROP TABLE IF EXISTS users')
db.execute('CREATE TABLE users
               (id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL
               )')

# Drop and recreate the 'cache' table
db.execute('DROP TABLE IF EXISTS cache')
db.execute('CREATE TABLE cache
               (id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                cacheinfo TEXT NOT NULL
               )')

# Drop and recreate the 'forks' table
db.execute('DROP TABLE IF EXISTS forks')
db.execute('CREATE TABLE forks
               (id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL,
                comment TEXT,
                status VARCHAR(50) CHECK(status IN ("done", "not done", "not reviewed")) NOT NULL DEFAULT "not reviewed"
               )')

puts 'Tables have been created successfully!'

# Example data received from the user
user_name = 'JohnDoe'
user_password = BCrypt::Password.create('123456')  # Hash the password using BCrypt
cache_info = 'example_cache_info'

# Insert user data into the 'users' table
db.execute('INSERT INTO users (name, password) VALUES (?, ?)', [user_name, user_password])

# Insert data into the 'cache' table
db.execute('INSERT INTO cache (name, cacheinfo) VALUES (?, ?)', [user_name, cache_info])

# Verify the data insertion by printing the 'users' and 'cache' tables
db.results_as_hash = true
pp user_result = db.execute('SELECT * FROM users')
pp cache_result = db.execute('SELECT * FROM cache')
