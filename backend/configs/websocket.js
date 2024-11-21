import { WebSocketServer } from 'ws'
import { chatService } from '../services/chatService.js'

const initializeWebSocket = (server) => {
  const wss = new WebSocketServer({ server })

  wss.on('connection', (ws, req) => {
    console.log('新的 WebSocket 連接')
    // 初始化檢測
    ws.isAlive = true
    ws.on('pong', () => {
      ws.isAlive = true
    })

    // 將連接處理委託給 chatService
    chatService.handleConnection(ws, req)
  })

  // 處理 WebSocket server 錯誤
  wss.on('error', (error) => {
    console.error('WebSocket Server 錯誤:', error)
  })

  // 定時清理斷開的連接
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        return ws.terminate()
      }
      ws.isAlive = false
      ws.ping(() => {})
    })
  }, 30000)

  // 當伺服器關閉時清理 interval
  wss.on('close', () => {
    clearInterval(interval)
  })

  return wss
}

export { initializeWebSocket }
