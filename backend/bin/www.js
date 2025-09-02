/**
 * Module dependencies.
 */
import app from '../app.js'
import debugLib from 'debug'
import http from 'http'
const debug = debugLib('node-express-es6:server')
// 使用全域的 process 物件，不需要 import
import { initializeWebSocket } from '../configs/websocket.js'

// 從全域 process 物件解構 exit 函數
const { exit } = process
// node:process 語法：Node.js 18+ 的新特性，用於明確指定內建模組。ESLint 相容性：某些 ESLint 規則可能不支援這個新語法。全域變數：process 在 Node.js 環境中本來就是全域可用的。
// 導入dotenv 使用 .env 檔案中的設定值 process.env
import 'dotenv/config.js'

// 全域未捕獲異常處理
process.on('uncaughtException', function (err) {
    console.log('❌ 未捕獲的異常:', err);
    // 在生產環境中，你可能想要記錄到檔案或發送通知
    // 但不要立即退出，讓伺服器繼續運行
});

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3005')
app.set('port', port)

// 調試：檢查端口配置
console.log('🔍 端口配置檢查:')
console.log('process.env.PORT:', process.env.PORT)
console.log('process.env.PORT || 3005:', process.env.PORT || '3005')
console.log('normalizePort 結果:', port)
console.log('port 類型:', typeof port)
console.log('port 值:', port)
// app.set('port', port) 設定 Express 應用程式的埠號
// 這裡的作用：將埠號儲存到 Express 應用程式中，供其他部分使用

// name: 設定值的名稱
// value: 設定值的值
// 設定值的值可以是字串、數字、布林值、物件、陣列等
// 設定一個名為 'port' 的配置值
// app.set('port', 3005)

// 之後可以用 app.get('port') 來取得
// var currentPort = app.get('port')  // 回傳：3005
/**
 * Create HTTP server.
 */

var server = http.createServer(app)

/**
 * Listen on provided port, on all network interfaces.
 */
initializeWebSocket(server)

server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

/**
 * Normalize a port into a number, string, or false.
 */

// 正規化埠號
// 輸入：接收一個值 val (可能是字串或數字)
function normalizePort(val) {
  // 處理：將輸入值轉換成有效的埠號

  // 將輸入值轉換成數字
  var port = parseInt(val, 10)

  // 檢查是否為有效的數字
  if (isNaN(port)) {
    // 如果無效，則返回原始值
    return val
  }

  // 檢查是否為有效的埠號
  if (port >= 0) {
    // 如果有效，則返回埠號
    return port
  }

  // 如果無效，則返回 false
  return false
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port
  // 這是指如果port的型別是字串的話就有字串Pipe加上埠號否則就是字串Port加上埠號

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${port} 需要系統管理員權限`)
      exit(1)
      break
    case 'EADDRINUSE':
      console.error(`Port ${port} 已被其他程式使用中`)
      exit(1)
      break
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address()
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
  debug('Listening on ' + bind)
  console.log(`伺服器啟動成功 http://localhost:${port}`)
}
