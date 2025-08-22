import React, { useState, useContext, createContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { checkAuth, getFavs } from '@/services/user'

const AuthContext = createContext(null)

// 註: 如果使用google登入會多幾個欄位(iat, exp是由jwt token來的)
// 上面資料由express來(除了password之外)
//   {
//     "id": 1,
//     "name": "哈利",
//     "username": "herry",
//     "email": "herry@test.com",
//     "birth_date": "1980-07-13",
//     "sex": "男",
//     "phone": "0906102808",
//     "postcode": "330",
//     "address": "桃園市桃園區劉南路377號18樓",
//     "google_uid": null,
//     "line_uid": null,
//     "photo_url": null,
//     "line_access_token": null,
//     "created_at": "2023-11-01T14:12:59.000Z",
//     "updated_at": "2023-11-01T14:12:59.000Z",
//     "iat": 1698852277,
//     "exp": 1698938677
// }

// 初始化會員狀態(登出時也要用)
// 只需要必要的資料即可，沒有要多個頁面或元件用的資料不需要加在這裡
// !!注意JWT存取令牌中只有id, username, google_uid, line_uid在登入時可以得到
export const initUserData = {
  user_id: 0,
  name: '',
  password: '',
  gender: '',
  birthdate: '',
  phone: '',
  email: '',
  country: '',
  city: '',
  district: '',
  road_name: '',
  detailed_address: '',
  image_path: '',
  remarks: '',
  level: 0,
  google_uid: null,
  line_uid: null,
  photo_url: '',
  iat: '',
  exp: '',
}

// 可以視為webtoken要押的資料
// 承接登入以後用的
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuth: false,
    userData: initUserData,
    // isLoading: true,
  })
  // 只在應用啟動時檢查一次認證狀態
  useEffect(() => {
    // handleCheckAuth()
  }, []) // 空依賴陣列，只執行一次

  // 我的最愛清單使用
  // 變數 函式後面的函式 更改前面變數的內容
  // const [favorites, setFavorites] = useState([])
  
  // 得到我的最愛
  // const handleGetFavorites = async () => {
  //   const res = await getFavs()
  //   //console.log(res.data)
  //   if (res.data.status === 'success') {
  //     setFavorites(res.data.data.favorites)
  //   }
  // }
      
  // useEffect(() => {
  //   if (auth.isAuth) {
  //     // 成功登入後要執行一次向伺服器取得我的最愛清單
  //     handleGetFavorites()
  //   } else {
  //     // 登出時要設回空陣列
  //     setFavorites([])
  //   }
  // }, [auth])

  const router = useRouter()

  // 登入頁路由
  const loginRoute = '/member/login'
  // 隱私頁面路由，未登入時會，檢查後跳轉至登入頁
  const protectedRoutes = ['/dashboard', '/coupon/coupon-user']

  const login = async (email, password) => {
    try {
      console.log('開始登入請求...')
      
      const response = await fetch('/api/login', {  // 改為絕對路徑
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',  // 加入必要 header
        },
        credentials: 'include',  // 處理 cookie
        body: JSON.stringify({ email, password }),
      })
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('API 回應結果:', result)
      
      if (result.status === 'success') {
        console.log('登入成功，設定狀態...')
        
        const newAuthState = {
          isAuth: true,
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
        
        console.log('要設定的新狀態:', newAuthState)
        setAuth(newAuthState)
        
        // 使用 setTimeout 來檢查狀態是否更新
        setTimeout(() => {
          console.log('狀態更新後的 auth:', auth)
        }, 1000)
        
        // 登入成功後跳轉
        router.replace('/dashboard')
        
      } else {
        console.error('登入失敗:', result.message || result)
      }
    } catch (error) {
      console.error('登入錯誤：', error)
      console.error('錯誤詳情:', error.message)
    }
  }

  const clearAuthState = () => {
    setAuth({
      isAuth: false,
      userData: {
        user_id: 0,
        name: '',
        password: '',
        gender: '',
        birthdate: '',
        phone: '',
        email: '',
        country: '',
        city: '',
        district: '',
        road_name: '',
        detailed_address: '',
        image_path: '',
        remarks: '',
        level: 0,
        google_uid: null,
        line_uid: null,
        photo_url: '',
        iat: '',
        exp: ''
      }
    })
  }

  const logout = async () => {
    try {
      const response = await fetch('http://localhost:3005/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('登出失敗')
      }
      const result = await response.json()
      
      if (result.status === 'success') {
        // 清除本地的 auth 狀態
        await Promise.all([
          // 清除狀態
          new Promise((resolve) => {
            clearAuthState()
            resolve()
          }),
          // 立即導航到登入頁
          router.replace('/'),
        ])
        document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      }

    } catch (error) {
      console.error('登出錯誤:', error)
      // 處理錯誤
    }
  }

  // 檢查會員認証用
  // 每次重新到網站中，或重新整理，都會執行這個函式，用於向伺服器查詢取回原本登入會員的資料
  // 這個頁面載入時，useAuth hook 會自動執行 handleCheckAuth
  const handleCheckAuth = async () => {
    try {
      console.log('檢查認證狀態...')
      console.log('當前路徑:', router.pathname)
      console.log('Cookie:', document.cookie)
      console.log('當前 isAuth:', auth.isAuth)
      
      // 如果沒有 token 且在受保護路由，跳轉登入
      if (protectedRoutes.includes(router.pathname) && !document.cookie.includes('accessToken')) {
        console.log('沒有 token 且在受保護路由，跳轉登入')
        router.push(loginRoute)
        return
      }
      
      if (!document.cookie.includes('accessToken')) {
      console.log('沒有 accessToken')
      setAuth(prev => ({ ...prev, isLoading: false }))
      return
    }
    
    const res = await checkAuth()
    console.log('伺服器驗證結果:', res)
    
    if (res.data.status === 'success') {
      const dbUser = res.data.data.user
      const userData = { ...initUserData }
      
      for (const key in userData) {
        if (Object.hasOwn(dbUser, key)) {
          userData[key] = dbUser[key] || ''
        }
      }
      
      setAuth({ 
        isAuth: true, 
        userData,
        isLoading: false
      })
    } else {
      setAuth(prev => ({ 
        ...prev, 
        isAuth: false,
        isLoading: false
      }))
    }
  } catch (error) {
    console.error('檢查認證失敗:', error)
    setAuth(prev => ({ 
      ...prev, 
      isAuth: false,
      isLoading: false
    }))
  }
}
  // 已經登入的使用者不得再進入註冊和登入頁面
  const publicOnlyRoutes = ['/member/login', '/member/signup']
  
  useEffect(() => {
   
      if (auth?.isAuth && publicOnlyRoutes.includes(router.pathname)) {
        router.replace('/dashboard')
      }
    
  }, [ router?.pathname, auth?.isAuth])

  // 已經登入的使用者不得再進入註冊和登入頁面

  
  useEffect(() => {
    if (router.isReady) {
      // router.pathname 是目前頁面的完整路徑
      if (auth?.isAuth && publicOnlyRoutes.includes(router.pathname)) {
        router.replace('/dashboard')
      }
    }
  }, [router?.isReady, router?.pathname, auth?.isAuth])

  // didMount(初次渲染)後，向伺服器要求檢查會員是否登入中
  // useEffect(() => {
  //   if (router.isReady) {
  //     handleCheckAuth()
  //   }
  // }, [router.isReady, router.pathname])

  // 加入狀態變化的 debug log
  useEffect(() => {
    console.log('Auth 狀態變化:', auth)
  }, [auth])

  // 加入狀態變化的 debug log
  useEffect(() => {
    console.log('Auth 狀態變化:', auth)
  }, [auth])

  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        setAuth,
        // favorites,
        // setFavorites,
        handleCheckAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)