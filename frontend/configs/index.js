export const PORT = 3000
export const DEV = true

// 配置文件
export const config = {
  // 其他配置...
}

// 前端 API 請求的目標地址 (後端 URL)
// 部署環境：使用 Zeabur 後端服務地址
// 開發環境：使用本地後端服務地址
export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
  (typeof window !== 'undefined' && window.location.hostname.includes('zeabur.app') 
    ? 'https://guru-laptop-lavendarbug-vqq.zeabur.app'  // 生產環境後端服務
    : 'http://localhost:3005')  // 開發環境後端服務
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
