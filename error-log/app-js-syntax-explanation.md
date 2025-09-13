# app.js 語法詳細解釋

## 概述
這是 Next-Guru 專案的主要 Express.js 應用程式入口檔案，使用 ES6 模組語法 (ESM) 和現代 JavaScript 特性。

## 1. 環境變數載入 (第1-19行)

### 語法解釋
```javascript
// 1. 首先載入環境變數
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

// 獲取 __dirname 的 ESM 等效方式
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 根據 NODE_ENV 載入對應的環境檔案
if (process.env.NODE_ENV === 'production') {
  dotenv.config({
    path: path.resolve(__dirname, '.env.production')
  })
} else {
  dotenv.config({
    path: path.resolve(__dirname, '.env.development')
  })
}
```

**重要概念：**
- `import.meta.url`：ESM 中獲取當前模組的 URL
- `fileURLToPath()`：將 file:// URL 轉換為檔案路徑
- `path.dirname()`：獲取檔案所在目錄
- `path.resolve()`：解析絕對路徑
- 環境變數必須在載入其他模組之前先載入

## 2. 模組匯入 (第21-66行)

### 核心模組匯入
```javascript
// 2. 然後才是其他 import
import * as fs from 'fs'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import createError from 'http-errors'
import express from 'express'
import pool from '##/configs/pgClient.js'
import logger from 'morgan'
```

**語法說明：**
- `import * as fs`：匯入整個模組並命名為 fs
- `import express from 'express'`：預設匯入
- `import { fileURLToPath } from 'url'`：具名匯入
- `##/configs/pgClient.js`：使用路徑別名，`##` 代表專案根目錄

### 路由模組匯入
```javascript
import authRouter from './routes/auth.js'
import loginRouter from './routes/login.js'
import signupRouter from './routes/signup.js'
// ... 其他路由
```

## 3. 環境變數檢查 (第57-67行)

### 調試輸出
```javascript
// 3. 調試：確認環境變數是否被載入
console.log('🔍 環境變數載入檢查:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('ACCESS_TOKEN_SECRET:', process.env.ACCESS_TOKEN_SECRET ? '✅ 已設置' : '❌ 未設置')
```

**語法說明：**
- `process.env`：存取環境變數
- 三元運算子：`condition ? trueValue : falseValue`
- `extendLog()`：自定義 console.log 功能

## 4. Express 應用程式初始化 (第69-95行)

### CORS 設定
```javascript
const corsOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://yunlavendar-guru-smart-laptop.zeabur.app',
      'https://guru-laptop-lavendarbug-vqq.zeabur.app',
      'https://localhost:8080'
    ]
  : [
      'http://localhost:3000', 
      'http://localhost:3001', 
      'http://localhost:3005',
      'https://guru-laptop-lavendarbug-vqq.zeabur.app'
    ]

app.use(
  cors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })
)
```

**語法說明：**
- 條件運算子根據環境設定不同的 CORS origins
- `app.use()`：註冊中間件
- `cors()`：跨域資源共享設定

## 5. 中間件設定 (第96-129行)

### JSON 解析中間件
```javascript
app.use(express.json({ 
  limit: '20mb', // 限制請求體的大小為20MB
  strict: true,         // 只接受 array 和 object
  type: 'application/json'  // 只處理這種 Content-Type
}))

app.use(express.urlencoded({ extended: false, limit: '20mb' }))
```

**語法說明：**
- `limit: '20mb'`：限制請求體大小
- `strict: true`：嚴格模式，只接受陣列和物件
- `extended: false`：使用 querystring 庫解析 URL 編碼資料

### Cookie 解析中間件
```javascript
app.use(cookieParser())
```

**功能說明：**
- 將 Cookie 標頭解析為 JavaScript 物件
- 簡化 Cookie 處理，將原始字串轉換為易用的物件

### 靜態檔案服務
```javascript
app.use(express.static(path.join(__dirname, 'public')))
```

## 6. 路由註冊 (第130-148行)

### 手動路由註冊
```javascript
app.use('/api/auth', authRouter)
app.use('/api/login', loginRouter)
app.use('/api/signup', signupRouter)
// ... 其他路由
```

**語法說明：**
- `app.use(path, router)`：將路由掛載到指定路徑
- 所有路由都使用 `/api` 前綴

## 7. 資料庫連線測試 (第149-161行)

### 非同步連線測試
```javascript
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
```

**語法說明：**
- `async/await`：處理非同步操作
- `try/catch`：錯誤處理
- `process.exit(1)`：終止程式並返回錯誤代碼

## 8. 健康檢查端點 (第178-213行)

### 根路徑健康檢查
```javascript
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})
```

### 詳細健康檢查
```javascript
app.get('/health', async (req, res) => {
  try {
    // 檢查資料庫連線
    const client = await pool.connect()
    await client.query('SELECT 1 as test')
    client.release()
    
    res.json({
      status: 'healthy',
      message: 'All services are running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected'
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      message: 'Service unavailable',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'disconnected',
      error: error.message
    })
  }
})
```

**語法說明：**
- `app.get(path, handler)`：定義 GET 路由
- `res.json()`：回傳 JSON 回應
- `res.status(code)`：設定 HTTP 狀態碼
- `new Date().toISOString()`：取得 ISO 格式時間戳

## 9. 動態路由載入 (第215-242行)

### 自動載入路由檔案
```javascript
const apiPath = '/api'
const routePath = path.join(__dirname, 'routes')
const filenames = await fs.promises.readdir(routePath)

for (const filename of filenames) {
  // 跳过已经手动注册的路由文件
  if (filename === 'index.js' || 
      filename === 'dashboard.js' || 
      // ... 其他排除條件
     ) {
    continue
  }
  const item = await import(pathToFileURL(path.join(routePath, filename)))
  const slug = filename.split('.')[0]
  app.use(`${apiPath}/${slug === 'index' ? '' : slug}`, item.default)
}
```

**語法說明：**
- `fs.promises.readdir()`：非同步讀取目錄
- `for...of`：遍歷陣列
- `continue`：跳過當前迭代
- `await import()`：動態匯入模組
- `filename.split('.')[0]`：取得檔案名稱（不含副檔名）
- 模板字面量：`${variable}` 字串插值

## 10. 錯誤處理 (第244-259行)

### 404 錯誤處理
```javascript
app.use(function (req, res, next) {
  next(createError(404))
})
```

### 全域錯誤處理
```javascript
app.use(function (err, req, res, next) {
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  
  res.status(err.status || 500)
  res.status(500).send({ error: err })
})
```

**語法說明：**
- `next(error)`：將錯誤傳遞給下一個錯誤處理中間件
- `res.locals`：設定回應區域變數
- `req.app.get('env')`：取得應用程式環境
- `err.status || 500`：使用錯誤狀態碼或預設 500

## 11. 靜態檔案和上傳處理 (第261-269行)

### 上傳目錄設定
```javascript
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')))

const uploadDir = path.join(__dirname, 'public', 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}
```

**語法說明：**
- `fs.existsSync()`：同步檢查檔案/目錄是否存在
- `fs.mkdirSync()`：同步建立目錄
- `{ recursive: true }`：遞迴建立目錄

## 12. 模組匯出 (第311行)

```javascript
export default app
```

**語法說明：**
- `export default`：預設匯出
- 這是 ESM 的匯出語法

## 重要語法概念總結

### 1. ES6 模組系統
- `import/export`：現代 JavaScript 模組語法
- `import.meta.url`：取得當前模組 URL
- 動態匯入：`await import()`

### 2. 非同步處理
- `async/await`：處理 Promise
- `try/catch`：錯誤處理
- `fs.promises`：檔案系統 Promise API

### 3. Express.js 中間件
- `app.use()`：註冊中間件
- 中間件執行順序很重要
- 錯誤處理中間件必須有四個參數

### 4. 環境變數處理
- `process.env`：存取環境變數
- `dotenv.config()`：載入 .env 檔案
- 條件式載入不同環境檔案

### 5. 路徑處理
- `path.join()`：安全地組合路徑
- `path.resolve()`：解析絕對路徑
- `path.dirname()`：取得目錄路徑

### 6. 條件運算子
- 三元運算子：`condition ? true : false`
- 邏輯 OR：`value || defaultValue`
- 陣列條件：根據環境設定不同值

這個 app.js 檔案展示了現代 Node.js 應用程式的完整結構，包含環境設定、中間件配置、路由管理、錯誤處理等核心功能。

## 測試路由安全性分析

### 當前存在的測試路由

#### 1. 根路徑健康檢查 (`/`)
```javascript
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})
```

#### 2. 詳細健康檢查 (`/health`)
```javascript
app.get('/health', async (req, res) => {
  try {
    const client = await pool.connect()
    await client.query('SELECT 1 as test')
    client.release()
    
    res.json({
      status: 'healthy',
      message: 'All services are running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected'
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      message: 'Service unavailable',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'disconnected',
      error: error.message
    })
  }
})
```

### 潛在安全風險分析

#### ✅ 建議保留的原因：
1. **容器部署需求**：Zeabur 等雲端平台需要健康檢查端點來確認服務狀態
2. **監控需求**：便於 DevOps 團隊監控服務健康狀態
3. **除錯便利性**：開發階段可以快速確認服務是否正常運行
4. **負載均衡器需求**：許多負載均衡器需要健康檢查端點

#### ⚠️ 潛在風險：
1. **資訊洩露**：`/health` 端點會暴露環境變數 (`NODE_ENV`) - **風險較低**
2. **資料庫連線暴露**：健康檢查會建立資料庫連線，可能被濫用
3. **服務發現**：攻擊者可以透過這些端點發現服務存在
4. **DDoS 風險**：如果沒有適當限制，可能被用於攻擊

### NODE_ENV 風險程度分析

#### 為什麼 NODE_ENV 風險相對較低：

1. **公開資訊**：`NODE_ENV` 通常只包含 `development`、`production`、`test` 等標準值
2. **非敏感資料**：不包含密碼、API 金鑰等敏感資訊
3. **常見做法**：許多應用程式都會在健康檢查中暴露環境資訊
4. **除錯價值**：對於運維團隊來說，知道當前環境是很有用的

#### 真正的風險來源：

1. **資料庫連線**：每次健康檢查都會建立資料庫連線，這可能被濫用
2. **服務發現**：攻擊者可以確認服務存在並了解基本架構
3. **錯誤訊息**：如果資料庫連線失敗，可能暴露資料庫相關資訊

### 建議的安全改進措施

#### 1. 限制存取來源
```javascript
// 只允許特定 IP 或內部網路存取
app.get('/health', (req, res, next) => {
  const allowedIPs = ['127.0.0.1', '::1', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16']
  const clientIP = req.ip || req.connection.remoteAddress
  
  if (!allowedIPs.some(ip => clientIP.includes(ip))) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  next()
}, async (req, res) => {
  // 健康檢查邏輯
})
```

#### 2. 簡化資訊暴露
```javascript
app.get('/health', async (req, res) => {
  try {
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(503).json({
      status: 'error'
    })
  }
})
```

#### 3. 添加速率限制
```javascript
import rateLimit from 'express-rate-limit'

const healthCheckLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 分鐘
  max: 10, // 每分鐘最多 10 次請求
  message: 'Too many health check requests'
})

app.get('/health', healthCheckLimiter, async (req, res) => {
  // 健康檢查邏輯
})
```

#### 4. 環境區分處理
```javascript
app.get('/health', async (req, res) => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  try {
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString()
    }
    
    // 只在開發環境暴露詳細資訊
    if (isDevelopment) {
      response.environment = process.env.NODE_ENV
      response.database = 'connected'
    }
    
    res.json(response)
  } catch (error) {
    const response = { status: 'error' }
    
    if (isDevelopment) {
      response.error = error.message
      response.database = 'disconnected'
    }
    
    res.status(503).json(response)
  }
})
```

### 最終建議

**建議保留健康檢查端點**，但需要進行以下改進：

1. **移除敏感資訊**：不要在生產環境暴露 `NODE_ENV` 和詳細錯誤訊息
2. **添加存取控制**：限制只有內部網路或特定 IP 可以存取
3. **實施速率限制**：防止濫用
4. **簡化回應內容**：只回傳必要的狀態資訊
5. **考慮使用專門的監控工具**：如 Prometheus + Grafana 替代簡單的健康檢查

這樣既能滿足運維需求，又能降低安全風險。

## 常見問題與解答

### Q: NODE_ENV 環境變數暴露會有安全風險嗎？

**A: 風險很低，可以保留。**

**原因分析：**

1. **公開資訊**：`NODE_ENV` 通常只包含 `development`、`production`、`test` 等標準值
2. **非敏感資料**：不包含密碼、API 金鑰等敏感資訊
3. **常見做法**：許多應用程式都會在健康檢查中暴露環境資訊
4. **除錯價值**：對於運維團隊來說，知道當前環境是很有用的

**真正的風險來源：**
- 資料庫連線：每次健康檢查都會建立資料庫連線，這可能被濫用
- 服務發現：攻擊者可以確認服務存在並了解基本架構
- 錯誤訊息：如果資料庫連線失敗，可能暴露資料庫相關資訊

**建議：**
- `NODE_ENV` 可以保留，因為風險很低且對運維有幫助
- 重點應該放在控制資料庫連線頻率和限制存取來源
- 實施速率限制防止濫用
