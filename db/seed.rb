require 'sqlite3'
require 'pp'
require 'bcrypt'

'''
This is how you use the smack:

seeder = DatabaseSeeder.new
seeder.create_tables
seeder.seed_example_data

'''

class DatabaseSeeder
  def initialize
    @db = SQLite3::Database.new 'db/database.db'
    @db.results_as_hash = true
  end

  # Create tables
  def create_tables
    create_users_table
    create_cache_table
    create_forks_table
    puts 'Tables have been created successfully!'
  end

  # Insert example data into tables
  def seed_example_data
    seed_local_user
    seed_github_user
    seed_cache_data
    verify_data_insertion
  end

  private

  # Drop and recreate the 'users' table with GitHub data fields
  def create_users_table
    @db.execute('DROP TABLE IF EXISTS users')
    @db.execute(<<-SQL
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        github_id INTEGER UNIQUE,
        username TEXT,
        name TEXT NOT NULL,
        password TEXT,
        avatar_url TEXT,
        html_url TEXT,
        public_repos INTEGER
      )
    SQL
    )
  end

  # Drop and recreate the 'cache' table
  def create_cache_table
    @db.execute('DROP TABLE IF EXISTS cache')
    @db.execute(<<-SQL
      CREATE TABLE cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        cacheinfo TEXT NOT NULL
      )
    SQL
    )
  end

  # Drop and recreate the 'forks' table
  def create_forks_table
    @db.execute('DROP TABLE IF EXISTS forks')
    @db.execute(<<-SQL
      CREATE TABLE forks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        comment TEXT,
        status TEXT CHECK(status IN ("done", "not done", "not reviewed")) NOT NULL DEFAULT "not reviewed"
      )
    SQL
    )
  end

  # Seed example data for a local user (non-GitHub)
  def seed_local_user
    local_user_name = 'JohnDoe'
    local_user_password = BCrypt::Password.create('123456')
    @db.execute('INSERT INTO users (name, password) VALUES (?, ?)', [local_user_name, local_user_password])
  end


  # Seed example data for the cache table
  def seed_cache_data
    cache_name = 'example_cache_entry'
    cache_info = 'example_cache_info'
    @db.execute('INSERT INTO cache (name, cacheinfo) VALUES (?, ?)', [cache_name, cache_info])
  end

  # Verify the data insertion by printing the 'users' and 'cache' tables
  def verify_data_insertion
    pp user_result = @db.execute('SELECT * FROM users')
    pp cache_result = @db.execute('SELECT * FROM cache')
  end
end

# Usage example:
seeder = DatabaseSeeder.new
seeder.create_tables
seeder.seed_example_data
