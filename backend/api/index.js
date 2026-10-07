// Vercel serverless 入口
// Express 的 app 本身就是 (req, res) 函式，直接匯出即可，不呼叫 listen。
// 本機仍用 bin/www.js 啟動（它會多掛 WebSocket，Vercel 不支援）。
import app from '../app.js'

export default app
