// backend/quick-db-test.js
import pool from './configs/pgClient.js'

console.log('🔍 快速測試資料庫連線...')

pool.query('SELECT NOW() as time')
  .then(result => {
    console.log('✅ 連線成功！')
    console.log('📅 時間:', result.rows[0].time)
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ 連線失敗:', error.message)
    process.exit(1)
  })
