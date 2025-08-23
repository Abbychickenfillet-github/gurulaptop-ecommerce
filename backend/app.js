import * as fs from 'fs'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import createError from 'http-errors'
import express from 'express'
// import db from '##/configs/mysql.js'
import pool from '##/configs/pgClient.js'

import logger from 'morgan'
import path from 'path'
import session from 'express-session'
import authRouter from './routes/auth.js'
import loginRouter from './routes/login.js'
import signupRouter from './routes/signup.js'
import dashboardRouter from './routes/dashboard.js'
import eventsRouter from './routes/events.js'
import couponRouter from './routes/coupon.js'
import couponUserRouter from './routes/coupon-user.js'
import chatRoutes from './routes/chat.js'
import GroupRequests from './routes/group-request.js'
// import googleLoginRouter from './routes/google-login.js'
import forgotPasswordRouter from './routes/forgot-password.js'
// 使用檔案的session store，存在sessions資料夾
import sessionFileStore from 'session-file-store'
const FileStore = sessionFileStore(session)
// FileStore 是一個將 session 數據存儲在伺服器文件系統中的方案，而不是存在記憶體中。為什麼要用 FileStore：
// 持久化保存：當伺服器重啟時，session 資料不會丟失
// 開發階段方便：可以直接查看 session 文件內容進行除錯
// 不需要額外的數據庫服務：適合小型專案或開發環境

// 但在生產環境中通常不建議使用 FileStore：

// 性能較差：讀寫文件比操作記憶體慢
// 擴展性差：如果是多台伺服器，無法共享 session
// 安全性考慮：文件可能被直接訪問
// 修正 ESM 中的 __dirname 與 windows os 中的 ESM dynamic import
import { fileURLToPath, pathToFileURL } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 讓console.log呈現檔案與行號，與字串訊息呈現顏色用
import { extendLog } from '#utils/tool.js'
import 'colors'
extendLog() 

// 建立 Express 應用程式
const app = express()

// 所有請求都會經過這些中間件：

// cors設定，參數為必要，注意不要只寫`app.use(cors())`
app.use(
  cors({
    origin: ['http://localhost:3000','http://localhost:3001', 'https://localhost:9000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })
)
// 中間件1

// ---
app.use(express.json()) // 中間件2 
//
// 視圖引擎設定
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// 記錄HTTP要求
app.use(logger('dev')) // 中間件3
// 設定日誌格式，使用 morgan 套件
// 這裡使用 'dev' 模式，會顯示簡潔的日誌格式
// 其他可選模式有 'combined', 'common', 'short', 'tiny'


// 剖析 POST 與 PUT 要求的JSON格式資料
app.use(express.json({ 
  limit: '20mb' , // 限制請求體的大小為20MB
  strict: true,         // 只接受 array 和 object
  type: 'application/json'  // 只處理這種 Content-Type
}))
// 沒有 express.json()，你的 req.body 會是 undefined！

// 這個limit:'20mb'是傳入參數
app.use(express.urlencoded({ extended: false, limit: '20mb' }))// 中間件4

// 剖折 Cookie 標頭與增加至 req.cookies 
// cookie-parser 的作用就是簡化後端伺服器對 Cookie 的處理，將原始的字串格式轉換為易於使用的 JavaScript 物件，從而讓開發者能專注於處理業務邏輯，而不必費心於底層的資料解析。
app.use(cookieParser())// 中間件5


// 在 public 的目錄，提供影像、CSS 等靜態檔案
app.use(express.static(path.join(__dirname, 'public')))// 中間件6
// 路由1
app.use('/api/auth', authRouter)
// 路由2

app.use('/api/login', loginRouter)
app.use('/api/signup', signupRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/events', eventsRouter)
app.use('/api/forgot-password', forgotPasswordRouter)
app.use('/api/auth', authRouter)


//優惠卷路由
app.use('/api/coupon', couponRouter)
app.use('/api/coupon-user', couponUserRouter)

async function testConnection() {
  try {
    const connection = await pool.connect()
    console.log('✅ PostgreSQL 資料庫連線成功')
    connection.release()
  } catch (error) {
    console.error('❌ PostgreSQL 資料庫連線失敗:', error)
    process.exit(1) // 如果連線失敗就終止程式
  }
}

testConnection()
// fileStore的選項 session-cookie使用
const fileStoreOptions = { logFn: function () {} }
app.use(
  session({
    store: new FileStore(fileStoreOptions), // 使用檔案記錄session
    name: 'SESSION_ID', // cookie名稱，儲存在瀏覽器裡
    secret: '67f71af4602195de2450faeb6f8856c0', // 安全字串，應用一個高安全字串
    cookie: {
      maxAge: 30 * 86400000, // 30 * (24 * 60 * 60 * 1000) = 30 * 86400000 => session保存30天
    },
    resave: false,
    saveUninitialized: false,
  })
)
// 以上那個session-cookie 應該不是我們的
// 載入routes中的各路由檔案，並套用api路由 START
const apiPath = '/api' // 預設路由
const routePath = path.join(__dirname, 'routes')
const filenames = await fs.promises.readdir(routePath)

for (const filename of filenames) {
  const item = await import(pathToFileURL(path.join(routePath, filename)))
  const slug = filename.split('.')[0]
  app.use(`${apiPath}/${slug === 'index' ? '' : slug}`, item.default)
}
// 載入routes中的各路由檔案，並套用api路由 END

// 捕抓404錯誤處理
app.use(function (req, res, next) {
  next(createError(404))
})

// 錯誤處理函式
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  // 更改為錯誤訊息預設為JSON格式
  res.status(500).send({ error: err })
})

// 儲存group預設圖片
// 設定靜態檔案提供
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')))

// 確保上傳目錄存在
const uploadDir = path.join(__dirname, 'public', 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 使用聊天室路由
app.use('/api/chat', chatRoutes)
app.use('/api/', GroupRequests)
// 在 app.js 最底部加上這個測試路由
// app.get('/api/auth/check', (req, res) => {
//   res.json({
//     status: 'success', 
//     data: { 
//       isAuth: false, 
//       user: null 
//     }
//   })
// })
// 動態端口設定 - 如果 3005 被佔用，嘗試其他端口
// const findAvailablePort = (startPort = 3005) => {
//   return new Promise((resolve) => {
//     const server = app.listen(startPort, () => {
//       const port = server.address().port
//       server.close(() => resolve(port))
//     }).on('error', () => {
//       // 如果端口被佔用，嘗試下一個端口
//       findAvailablePort(startPort + 1).then(resolve)
//     })
//   })
// }

// 啟動伺服器
// const startServer = async () => {
//   try {
//     const port = await findAvailablePort()
    
//     app.listen(port, () => {
//       console.log(`✅ 伺服器成功啟動在 http://localhost:${port}`)
//       console.log(`🚀 環境: ${process.env.NODE_ENV || 'development'}`)
//     })
//   } catch (error) {
//     console.error('❌ 伺服器啟動失敗:', error)
//     process.exit(1)
//   }
// }

// 優雅關閉處理
// process.on('SIGTERM', () => {
//   console.log('🛑 收到 SIGTERM 信號，正在關閉伺服器...')
//   process.exit(0)
// })

// process.on('SIGINT', () => {
//   console.log('🛑 收到 SIGINT 信號，正在關閉伺服器...')
//   process.exit(0)
// })


export default app
