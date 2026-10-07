// 資料庫 SSL 設定，pgClient.js 與 db.js 共用
// 開發與正式環境使用同一份程式碼，差異只來自環境變數：
// DATABASE_CA_CERT：選填，雲端資料庫（Supabase）的 CA 憑證 PEM 內容，換行可寫成 \n
//   有填：啟用 SSL 並驗證伺服器身分，防止中間人攻擊
//   沒填：不使用 SSL，供本機資料庫使用
const ca = process.env.DATABASE_CA_CERT?.replace(/\\n/g, '\n')

export const dbSsl = ca ? { ca, rejectUnauthorized: true } : undefined
