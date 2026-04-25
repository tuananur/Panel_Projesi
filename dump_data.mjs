import mysql from 'mysql2/promise';
import fs from 'fs';

async function dump() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dashboard_db'
    });

    const [clients] = await connection.execute('SELECT * FROM Client');
    const [tasks] = await connection.execute('SELECT * FROM Task');
    const [users] = await connection.execute('SELECT * FROM User');

    const data = {
      clients,
      tasks,
      users
    };

    fs.writeFileSync('dump.json', JSON.stringify(data, null, 2));
    console.log('Dumped data successfully!');
    await connection.end();
  } catch (error) {
    console.error('Failed to dump data:', error);
  }
}

dump();
