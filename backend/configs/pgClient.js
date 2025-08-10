// backend/db/pgClient.js
import pkg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Render 需要這行
  }
})

export default pool
