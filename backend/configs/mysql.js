import mysql from 'mysql2/promise.js'

// 讀取.env檔用
import 'dotenv/config.js'

// 資料庫連結資訊
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true, // 轉換日期字串格式用
})
// 測試連線
db.getConnection()
  .then((connection) => {
    console.log('資料庫連線成功')
    connection.release()
  })
  .catch((err) => {
    console.error('資料庫連線失敗:', err)
  })
// 輸出模組
export default db
