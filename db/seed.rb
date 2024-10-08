require 'sqlite3'
require 'pp'
db = SQLite3::Database.new 'db/company.db'
db.execute('DROP TABLE IF EXISTS employees')
db.execute('CREATE TABLE employees
               (id INTEGER PRIMARY KEY AUTOINCREMENT,
                img VARCHAR(40),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(20),
                department_id INTEGER NOT NULL,
                FOREIGN KEY(department_id) REFERENCES departments(id)
               )')
db.execute('DROP TABLE IF EXISTS departments')
db.execute('CREATE TABLE departments
               (id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL UNIQUE)')
rows = File.readlines('db/employee_data.csv')
rows.shift #skip headers
rows.each do |row|
  columns = row.split(',')
  #check if department already exists
  department_name = columns.last.chomp
  department_id = db.execute('SELECT id FROM departments WHERE name = ?', department_name).first
  if department_id.nil?
    #the department does not yet exist
    db.execute('INSERT INTO departments (name) VALUES(?)', department_name)
    #get id for the newly inserted department
    department_id = db.execute('SELECT id FROM departments WHERE name = ?', department_name).first
  end
  db.execute('INSERT INTO employees (img, name, email, phone, department_id) VALUES (?,?,?,?,?)', [columns[0], columns[1], columns[2], columns[3], department_id])
end
db.results_as_hash = true
pp result = db.execute('SELECT * FROM employees')