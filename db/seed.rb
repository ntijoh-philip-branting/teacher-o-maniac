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
end