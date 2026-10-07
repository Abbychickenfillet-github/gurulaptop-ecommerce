// CORS 允許的來源，app.js 與 routes/group.js 共用
// 開發與正式環境共用同一份程式碼，差異只來自環境變數：
// CORS_ORIGINS：以逗號分隔的來源清單，例如 https://gurulaptop-frontend.vercel.app
//   雲端平台（Vercel）填前端網址，本機不填時使用下面的 localhost 預設值
// 注意：前端 fetch 與 axios 都帶 credentials，Access-Control-Allow-Origin 不能是 *
const localDefaults = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3005',
  'http://localhost:8080',
  'https://localhost:8080',
]

export const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  : localDefaults
