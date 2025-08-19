// backend/db/pgClient.js
import pkg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pkg

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // 針對本地連線，不需要 Render 提供的 SSL 設定
  // connectionString是render專用的key
})
export default pool
