require 'sqlite3'
require 'pp'

# Connect to the SQLite database
db = SQLite3::Database.new 'db/database.db'

# Drop and recreate the 'login' table
db.execute('DROP TABLE IF EXISTS login')
db.execute('CREATE TABLE login
               (id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL,
                password INTEGER NOT NULL
               )')

# Drop and recreate the 'cache' table
db.execute('DROP TABLE IF EXISTS cache')
db.execute('CREATE TABLE cache
               (id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL UNIQUE,
                cacheinfo VARCHAR(255) NOT NULL
               )')

# Example data received from the user
user_name = 'JohnDoe'
user_password = 123456
cache_info = 'example_cache_info'

# Insert user data into the 'login' table
db.execute('INSERT INTO login (name, password) VALUES (?, ?)', [user_name, user_password])

# Insert data into the 'cache' table
db.execute('INSERT INTO cache (name, cacheinfo) VALUES (?, ?)', [user_name, cache_info])

# Verify the data insertion by printing the 'login' and 'cache' tables
db.results_as_hash = true
pp login_result = db.execute('SELECT * FROM login')
pp cache_result = db.execute('SELECT * FROM cache')
