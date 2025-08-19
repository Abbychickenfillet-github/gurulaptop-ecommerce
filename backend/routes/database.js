import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pool from '##/configs/pgClient.js' // 改為PostgreSQL連接池

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 執行單個 SQL 檔案的函式
 */
async function runSqlFile(filePath) {
  try {
    const sqlContent = fs.readFileSync(filePath, 'utf8')
    
    // 移除註解和空行，並分割 SQL 語句
    const sqlStatements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'))

    const client = await pool.connect()
    const results = []

    try {
      console.log(`🔄 開始執行 SQL 檔案: ${path.basename(filePath)}`)
      
      for (let i = 0; i < sqlStatements.length; i++) {
        const statement = sqlStatements[i]
        if (statement.trim()) {
          console.log(`   執行語句 ${i + 1}/${sqlStatements.length}`)
          const result = await client.query(statement)
          results.push(result)
        }
      }

      console.log(`✅ SQL 檔案執行完成: ${path.basename(filePath)}`)
      return { success: true, results, statements: sqlStatements.length }
    } catch (error) {
      console.error(`❌ 執行 SQL 檔案失敗: ${path.basename(filePath)}`, error)
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      details: error.code || 'UNKNOWN_ERROR'
    }
  }
}

// GET /api/database/init - 初始化所有資料庫
router.get('/init', async (req, res) => {
  try {
    const databaseDir = path.join(__dirname, '../database')
    
    // 檢查 database 資料夾是否存在
    if (!fs.existsSync(databaseDir)) {
      return res.status(404).json({
        status: 'error',
        message: 'database 資料夾不存在',
        path: databaseDir
      })
    }

    // 獲取所有 .sql 檔案
    const sqlFiles = fs.readdirSync(databaseDir)
      .filter(file => file.endsWith('.sql'))
      .map(file => path.join(databaseDir, file))

    if (sqlFiles.length === 0) {
      return res.json({
        status: 'warning',
        message: '沒有找到任何 SQL 檔案',
        path: databaseDir
      })
    }

    const results = []
    let successCount = 0
    
    // 依序執行每個 SQL 檔案
    for (const filePath of sqlFiles) {
      const fileName = path.basename(filePath)
      console.log(`\n🔄 處理檔案: ${fileName}`)
      
      const result = await runSqlFile(filePath)
      results.push({
        file: fileName,
        ...result
      })
      
      if (result.success) {
        successCount++
      }
    }

    const hasErrors = results.some(r => !r.success)
    
    res.json({
      status: hasErrors ? 'partial_success' : 'success',
      message: `處理完成！成功: ${successCount}/${sqlFiles.length}`,
      summary: {
        total: sqlFiles.length,
        success: successCount,
        failed: sqlFiles.length - successCount
      },
      results
    })
  } catch (error) {
    console.error('❌ 資料庫初始化失敗:', error)
    res.status(500).json({
      status: 'error',
      message: '資料庫初始化失敗',
      error: error.message
    })
  }
})

// POST /api/database/execute - 執行指定的 SQL 檔案
router.post('/execute', async (req, res) => {
  try {
    const { fileName } = req.body
    
    if (!fileName) {
      return res.status(400).json({
        status: 'error',
        message: '請提供檔案名稱 (fileName)'
      })
    }

    // 安全檢查：只允許 .sql 檔案
    if (!fileName.endsWith('.sql')) {
      return res.status(400).json({
        status: 'error',
        message: '只允許執行 .sql 檔案'
      })
    }

    const filePath = path.join(__dirname, '../database', fileName)
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'error',
        message: `SQL 檔案不存在: ${fileName}`,
        path: filePath
      })
    }

    const result = await runSqlFile(filePath)
    
    if (result.success) {
      res.json({
        status: 'success',
        message: `SQL 檔案 ${fileName} 執行完成`,
        file: fileName,
        statements: result.statements,
        results: result.results
      })
    } else {
      res.status(500).json({
        status: 'error',
        message: `執行 SQL 檔案 ${fileName} 時發生錯誤`,
        file: fileName,
        error: result.error,
        details: result.details
      })
    }
  } catch (error) {
    console.error('❌ 執行 SQL 檔案失敗:', error)
    res.status(500).json({
      status: 'error',
      message: '執行 SQL 檔案失敗',
      error: error.message
    })
  }
})

// GET /api/database/files - 列出所有可用的 SQL 檔案
router.get('/files', (req, res) => {
  try {
    const databaseDir = path.join(__dirname, '../database')
    
    if (!fs.existsSync(databaseDir)) {
      return res.json({
        status: 'warning',
        files: [],
        count: 0,
        message: 'database 資料夾不存在',
        path: databaseDir
      })
    }

    const files = fs.readdirSync(databaseDir)
      .filter(file => file.endsWith('.sql'))
      .map(file => {
        const filePath = path.join(databaseDir, file)
        const stats = fs.statSync(filePath)
        return {
          name: file,
          size: stats.size,
          sizeReadable: `${(stats.size / 1024).toFixed(2)} KB`,
          modified: stats.mtime,
          created: stats.birthtime
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))

    res.json({
      status: 'success',
      files,
      count: files.length,
      path: databaseDir
    })
  } catch (error) {
    console.error('❌ 讀取 SQL 檔案清單失敗:', error)
    res.status(500).json({
      status: 'error',
      message: '讀取 SQL 檔案清單失敗',
      error: error.message
    })
  }
})

// GET /api/database/status - 檢查資料庫連線狀態
router.get('/status', async (req, res) => {
  try {
    const client = await pool.connect()
    
    try {
      // 測試簡單查詢
      const result = await client.query('SELECT 1 as test')
      
      res.json({
        status: 'success',
        message: '資料庫連線正常',
        connected: true,
        timestamp: new Date().toISOString(),
        test: result.rows[0]
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ 資料庫連線檢查失敗:', error)
    res.status(500).json({
      status: 'error',
      message: '資料庫連線失敗',
      connected: false,
      error: error.message
    })
  }
})

export default router