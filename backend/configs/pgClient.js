// backend/db/pgClient.js
import { Pool } from 'pg'
import dotenv from 'dotenv'
dotenv.config()

// 根據環境選擇資料庫連線配置
let poolConfig

if (process.env.NODE_ENV === 'production') {
  // 生產環境：使用 zeabur 連線字串
  if (process.env.ZEABUR_CONNECTION_STRING) {
    poolConfig = {
      connectionString: process.env.ZEABUR_CONNECTION_STRING,
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }
    console.log('🚀 使用 Zeabur 生產環境連線')
  } else {
    // 如果沒有 zeabur 連線字串，使用環境變數
    poolConfig = {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }
    console.log('🚀 使用環境變數生產環境連線')
  }
} else {
  // 開發環境：使用本地資料庫，禁用 SSL
  poolConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'project_db',
    password: process.env.DB_PASSWORD || 'abc123',
    port: process.env.DB_PORT || 5432,
    ssl: false, // 本地開發環境完全禁用 SSL
  }
  console.log('🛠️ 使用開發環境連線配置')
}

// 調試：檢查連線配置
console.log('🔍 pgClient 連線配置檢查:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('DB_USER:', process.env.DB_USER)
console.log('DB_HOST:', process.env.DB_HOST)
console.log('DB_NAME:', process.env.DB_NAME)
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ 已設置' : '❌ 未設置')
console.log('DB_PORT:', process.env.DB_PORT)
console.log(
  'ZEABUR_CONNECTION_STRING:',
  process.env.ZEABUR_CONNECTION_STRING ? '✅ 已設置' : '❌ 未設置'
)

const pool = new Pool(poolConfig)

export default pool
