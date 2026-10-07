import { Sequelize } from 'sequelize'
import { dbSsl } from './dbSsl.js'
// 環境變數由 app.js 與 bin/www.js 統一載入，這裡不載入 dotenv

// 開發與正式環境共用同一份程式碼，連線字串只來自環境變數 DATABASE_URL
const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:abc123@localhost:5432/project_db'

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  dialectOptions: { ssl: dbSsl },
  // serverless 每個實例只開少量連線，避免耗盡資料庫的連線數
  pool: { max: 3 },
  logging: false,
})

// 測試連接：失敗只記錄，不 throw，避免 serverless 函式因為未處理的 Promise 錯誤而結束
sequelize
  .authenticate()
  .then(() => console.log('✅ Sequelize PostgreSQL 連接成功'))
  .catch((error) => console.error('❌ 無法連線到資料庫:', error.message))

export default sequelize
