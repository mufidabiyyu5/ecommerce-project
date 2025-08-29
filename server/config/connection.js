import { Client } from 'pg'
 
const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
})

const connectDatabase = async () => {
  try {
    await client.connect()
    const result = await client.query('SELECT NOW() as current_time')
    console.log('Database connected successfully at ' + result.rows[0].current_time)
  } catch (error) {
    console.error('Database connection failed:', error)
  }
}

export { client, connectDatabase }