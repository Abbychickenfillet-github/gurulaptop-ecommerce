import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getFavs } from '@/services/user'

// ========================================
// 🔐 認證上下文 (Authentication Context)
// ========================================
// 這個 Context 用於在整個應用中共享用戶的認證狀態
// 包括：是否已登入、用戶數據、登入/登出函數等
const AuthContext = createContext()

// ========================================
// 🎯 初始用戶數據結構
// ========================================
// 定義用戶數據的默認值，確保數據結構一致
const initUserData = {
  user_id: 0,           // 用戶ID，0表示未登入
  name: '',             // 用戶姓名
  password: '',         // 密碼（前端不存儲明文密碼）
  gender: '',           // 性別
  birthdate: '',        // 生日
  phone: '',            // 手機號碼
  email: '',            // 郵箱地址
  country: '',          // 國家
  city: '',             // 城市
  district: '',         // 區域
  road_name: '',        // 道路名稱
  detailed_address: '', // 詳細地址
  image_path: '',       // 頭像路徑
  remarks: '',          // 備註
  level: 0,             // 用戶等級
  google_uid: null,     // Google登入ID
  line_uid: null,       // Line登入ID
  photo_url: '',        // 照片URL
  iat: '',              // 令牌簽發時間
  exp: ''               // 令牌過期時間
}

// ========================================
// 🏠 主組件：AuthProvider
// ========================================
// 這個組件包裝整個應用，提供認證相關的狀態和函數
export const AuthProvider = ({ children }) => {
  // ========================================
  // 📊 狀態管理
  // ========================================
  // auth: 存儲用戶的認證狀態和用戶數據
  // isLoading: 表示是否正在檢查認證狀態
  const [auth, setAuth] = useState({
    isAuth: false,       // 是否已認證（登入）
    userData: initUserData, // 用戶數據
    isLoading: true      
    // 是否正在加載（檢查認證狀態）
  })

  // ========================================
  // 🚀 路由相關
  // ========================================
  const router = useRouter()
  
  // 登入頁面路由
  const loginRoute = '/member/login'
  
  // 受保護的路由（需要登入才能訪問）
  const protectedRoutes = ['/dashboard', '/coupon/coupon-user']

  // ========================================
  // 🔑 登入函數
  // ========================================
  // 功能：處理用戶登入
  // 參數：email（郵箱）、password（密碼）
  const login = async (email, password) => {
    try {
      console.log('🚀 前端開始登入請求...')
      console.log('📧 登入 email:', email)
      console.log('🔑 登入 password:', password ? '[已隱藏]' : '未提供')
      
      // 向後端發送登入請求
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',  // 包含 cookies
        body: JSON.stringify({ email, password }),
      })
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      // 檢查 HTTP 響應狀態
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // 解析響應數據
      const result = await response.json()
      console.log('API 回應結果:', result)
      console.log('Response headers:', response.headers)
      console.log('Cookies after login:', document.cookie)
      
      // 檢查登入是否成功
      if (result.status === 'success') {
        console.log('✅ 前端登入成功，設定狀態...')
        
        // 使用函數式更新確保狀態正確設置
        setAuth(prevAuth => {
          console.log('更新前的狀態:', prevAuth)
          
          // 構建新的認證狀態
          const newState = {
            isAuth: true,  // 設置為已登入
            userData: {
              user_id: result.data.user_id,
              name: result.data.name,
              phone: result.data.phone,
              email: result.data.email,
              gender: result.data.gender,
              birthdate: result.data.birthdate,
              country: result.data.country,
              city: result.data.city,
              district: result.data.district,
              road_name: result.data.road_name,
              detailed_address: result.data.detailed_address,
              remarks: result.data.remarks,
              level: result.data.level,
              google_uid: result.data.google_uid || null,
              line_uid: result.data.line_uid || null,
              photo_url: result.data.photo_url || '',
              iat: result.data.iat || '',
              exp: result.data.exp || '',
            }
          }
          
          console.log('更新後的狀態:', newState)
          return newState
        })
        
        // 等待狀態更新完成後再跳轉
        // 延遲300ms確保狀態更新完成
        setTimeout(() => {
          console.log('🔄 延遲後的 auth 狀態:', auth)
          console.log('🍪 延遲後的 cookies:', document.cookie)
          console.log('🔄 導向 dashboard 頁面...')
          router.replace('/dashboard')  // 跳轉到儀表板
        }, 300)
        
      } else {
        console.error('登入失敗:', result.message || result)
      }
    } catch (error) {
      console.error('登入錯誤：', error)
      console.error('錯誤詳情:', error.message)
    }
  }

  // ========================================
  // 🧹 清除認證狀態函數
  // ========================================
  // 功能：將認證狀態重置為未登入狀態
  const clearAuthState = () => {
    setAuth({
      isAuth: false,        // 設置為未登入
      userData: initUserData, // 重置用戶數據為初始值
      isLoading: false      // 設置加載狀態為false
    })
  }

  // ========================================
  // 🚪 登出函數
  // ========================================
  // 功能：處理用戶登出
  const logout = async () => {
    try {
      console.log('🚪 開始登出流程...')
      
      // 先清除本地認證狀態
      clearAuthState()
      
      // 強制清除瀏覽器中的 accessToken cookie（多種方式確保清除）
      console.log('🧹 清除瀏覽器 cookie...')
      // 清除所有可能的 cookie 組合
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;'
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie = 'accessToken=; max-age=0; path=/; domain=localhost;'
      document.cookie = 'accessToken=; max-age=0; path=/;'
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost; secure;'
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;'
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost; httpOnly;'
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; httpOnly;'
      
      // 向後端發送登出請求
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 後端登出回應:', response.status)
      
      // 如果後端成功，顯示成功訊息
      if (response.ok) {
        const result = await response.json()
        if (result.status === 'success') {
          console.log('✅ 登出成功')
        }
      }

    } catch (error) {
      console.error('登出錯誤:', error)
    } finally {
      // 無論如何都跳轉到登入頁面（只跳轉一次）
      console.log('🔄 跳轉到登入頁面...')
      router.replace('/member/login')
    }
  }

  // ========================================
  // 🔍 檢查認證狀態函數
  // ========================================
  // 功能：檢查用戶是否仍然保持登入狀態
  // 每次重新訪問網站或刷新頁面時都會執行
  
  // ========================================
  // 📍 handleCheckAuth 使用情況分析
  // ========================================
  // 
  // 🎯 1. 在 use-auth.js 內部使用：
  //    - 第292行：在 AuthContext.Provider 中提供給子組件
  //    - 作為 Context 值的一部分，供外部組件調用
  // 
  // 🌐 2. 在外部檔案中的使用情況：
  //    - 目前沒有直接調用 handleCheckAuth 的組件
  //    - 大部分組件都是通過 useAuth() 獲取 auth 狀態
  // 
  // 🔗 3. 調用 auth 路由的組件：
  //    - 登入頁面：/pages/member/login.js (使用 login 函數)
  //    - 註冊頁面：/pages/member/signup.js (使用 auth 狀態)
  //    - 儀表板：/pages/dashboard/index.js (使用 auth 狀態)
  //    - 購物車：/pages/cart/index.js (使用 auth 狀態)
  //    - 部落格：/pages/blog/**/*.js (使用 auth 狀態)
  //    - 產品頁：/pages/product/[pid].js (使用 auth 狀態)
  //    - 群組管理：/components/group/GroupManagement.js (使用 auth 狀態)
  //    - 優惠券：/components/coupon/**/*.js (使用 auth 狀態)
  // 
  // 📊 4. 使用 useAuth() 的組件統計：
  //    - 總計約 30+ 個組件使用 useAuth()
  //    - 主要用於檢查用戶登入狀態 (auth.isAuth)
  //    - 獲取用戶數據 (auth.userData)
  //    - 執行登入/登出操作 (login/logout 函數)
  // 
  // ⚠️ 5. 注意事項：
  //    - handleCheckAuth 主要用於頁面刷新後的認證狀態檢查
  //    - 大部分組件不需要直接調用此函數
  //    - 組件只需要使用 useAuth() 獲取當前狀態即可
  // 
  const handleCheckAuth = async () => {
    try {
      // 避免重複調用
      if (auth.isLoading === false) {
        return
      }
      
      console.log('🔍 開始檢查認證狀態...')
      console.log('📍 當前路徑:', router.pathname)
      console.log('🍪 Cookie:', document.cookie)
      console.log('🔐 當前 isAuth:', auth.isAuth)
      
      // 檢查是否在受保護路由且沒有token
      if (protectedRoutes.includes(router.pathname) && !document.cookie.includes('accessToken')) {
        console.log('⚠️ 沒有 token 且在受保護路由，跳轉登入')
        router.push(loginRoute)
        return
      }
      
      // 如果沒有 accessToken，直接返回
      if (!document.cookie.includes('accessToken')) {
        console.log('❌ 沒有 accessToken')
        setAuth(prev => ({ ...prev, isLoading: false }))
        return
      }
    
      // 有 accessToken，設置為已登入狀態（不向後端驗證）
      console.log('✅ 發現 accessToken，設置為已登入狀態')
      setAuth(prev => ({ 
        ...prev, 
        isAuth: true,
        isLoading: false
      }))
      
    } catch (error) {
      console.error('檢查認證失敗:', error)
      setAuth(prev => ({ 
        ...prev, 
        isAuth: false,
        isLoading: false
      }))
    }
  }

  // ========================================
  // 🔄 狀態變化監聽器
  // ========================================
  // 監聽 auth 狀態的變化，用於調試（僅在開發環境）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth 狀態變化:', auth)
    }
  }, [auth])

  // ========================================
  // 📤 返回 Context Provider
  // ========================================
  // 將認證相關的狀態和函數提供給子組件使用
  return (
    <AuthContext.Provider
      value={{
        auth,              // 認證狀態和用戶數據
        login,             // 登入函數
        logout,            // 登出函數
        setAuth,           // 設置認證狀態的函數
        handleCheckAuth    // 檢查認證狀態的函數
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ========================================
// 🎣 自定義 Hook：useAuth
// ========================================
// 功能：讓組件能夠訪問認證相關的狀態和函數
// 使用方式：const { auth, login, logout } = useAuth()
export const useAuth = () => useContext(AuthContext)