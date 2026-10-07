// backend/configs/pgClient.js
import { Pool } from 'pg'
import { dbSsl } from './dbSsl.js'

// 開發與正式環境共用同一份程式碼，連線字串只來自環境變數 DATABASE_URL：
// 本機填 localhost，雲端平台（Vercel）填 Supabase 的連線字串
const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:abc123@localhost:5432/project_db'

const pool = new Pool({
  connectionString,
  ssl: dbSsl,
  // serverless 每個實例只開少量連線，避免耗盡資料庫的連線數
  max: 3,
})

export default pool
