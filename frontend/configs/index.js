export const PORT = 3000
// 這個PORT 3000是指前端嗎
export const DEV = true

// 配置文件
export const config = {
  // 其他配置...
}

// 前端 API 請求的目標地址 (後端 URL)
// 只由環境變數 NEXT_PUBLIC_API_BASE_URL 決定：本機沒設時使用 localhost:3005，
// 雲端平台（Vercel）在環境變數介面填後端網址。注意：NEXT_PUBLIC_ 變數在 build 時寫進前端，修改後要重新部署
export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3005'
export const avatarBaseUrl = apiBaseUrl
// 使用 8080 是因為生產環境前端運行在 8080，後端也配置為 8080，保持前後端端口一致避免 CORS 問題
// 開發時前端用 3000，後端用 8080，生產時前後端都用 8080
// breadcrumb面包屑使用
// 用pathname英文對照中文的名稱(類似關聯陣列的物件)
// 使用方式需用 ex. pathnameLocale['home']
// 下面是防止自動格式化使用註解
/* eslint-disable */
// prettier-ignore
export const pathsLocaleMap = {
  'cart':'購物車',
  'forget-password':'重設密碼',
  'register':'註冊',
  'login':'登入',
  'member':'會員',
  'news':'新聞',
  'about': '關於我們',
  'product': '產品',
  'men': '男性',
  'women': '女性',
  'category': '分類',
  'list': '列表',
  'mobile': '手機',
  'pc': '電腦',
  'student': '學生資料',
  'com-test':'元件測試',
  'breadcrumb':'麵包屑',
  'home':'首頁',
  'posts':'張貼文章',
  'test':'測試',
  'user':'會員',
  'blog':'部落格',
}
/* eslint-enable */
