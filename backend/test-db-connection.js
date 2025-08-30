// backend/test-db-connection.js
import pool from './configs/pgClient.js'

async function testDatabaseConnection() {
  console.log('🔍 開始測試資料庫連線...')
  
  try {
    // 測試基本連線
    const client = await pool.connect()
    console.log('✅ 資料庫連線成功！')
    
    // 測試查詢
    const result = await client.query('SELECT NOW() as current_time')
    console.log('✅ 查詢測試成功！')
    console.log('📅 當前時間:', result.rows[0].current_time)
    
    // 測試 users 表格是否存在
    try {
      const usersResult = await client.query(`
        SELECT COUNT(*) as user_count 
        FROM users
      `)
      console.log('✅ users 表格存在！')
      console.log('👥 用戶數量:', usersResult.rows[0].user_count)
    } catch (tableError) {
      console.log('❌ users 表格不存在或無法訪問')
      console.log('錯誤詳情:', tableError.message)
    }
    
    client.release()
    console.log('✅ 測試完成，連線已釋放')
    
  } catch (error) {
    console.error('❌ 資料庫連線失敗！')
    console.error('錯誤詳情:', error.message)
    console.error('錯誤代碼:', error.code)
    
    // 提供常見錯誤的解決方案
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 解決方案:')
      console.log('1. 確認 PostgreSQL 服務是否正在運行')
      console.log('2. 檢查資料庫端口是否正確 (預設: 5432)')
      console.log('3. 確認防火牆設定')
    } else if (error.code === '28P01') {
      console.log('\n💡 解決方案:')
      console.log('1. 檢查資料庫用戶名和密碼是否正確')
      console.log('2. 確認用戶是否有連線權限')
    } else if (error.code === '3D000') {
      console.log('\n💡 解決方案:')
      console.log('1. 確認資料庫名稱是否正確')
      console.log('2. 確認資料庫是否存在')
    }
  } finally {
    // 關閉連線池
    await pool.end()
    console.log('🔒 連線池已關閉')
  }
}

// 執行測試
testDatabaseConnection()
