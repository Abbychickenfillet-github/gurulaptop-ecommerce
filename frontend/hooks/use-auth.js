import React, { useState, useContext, createContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { checkAuth, getFavs } from '@/services/user'
import Swal from 'sweetalert2'

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
}
// 可以視為webtoken要押的資料
// 承接登入以後用的
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuth: false,
    userData: initUserData,
  })

  // 我的最愛清單使用
  // 變數 函式後面的函式 更改前面變數的內容
  const [favorites, setFavorites] = useState([])

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
      const response = await fetch('api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        // JSON.stringify是物件變JSON字串方式傳輸
      })
      const result = await response.json()
      if (result.status === 'success') {
        setAuth({
          isAuth: true,
          user_id: result.data.user_id,
          name: result.data.name,
          phone: result.data.phone,
          created_at: result.data.created_at,
          gender: result.data.gender,
          country: result.data.country,
          city: result.data.city,
          district: result.data.district,
          road_name: result.data.road_name,
          detailed_address: result.data.detailed_address,
          birthdate: result.data.birthdate,
          remarks: result.data.remarks,
          level: result.data.level,
        })
      }
      console.log(response.json())
    } catch (error) {
      console.error('登入失敗：', error)
    }
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
          // 立即導航到登入頁
          router.push('/member/login'),
          // 清除狀態
          new Promise((resolve) => {
            setAuth({
              isAuth: false,
              userData: initUserData, // 使用完整的 initUserData
            })
            resolve()
          }),
        ])
       
      }
    } catch (error) {
      console.error('登出錯誤:', error)
      // 處理錯誤
    }
  }
  // 檢查會員認証用
  // 每次重新到網站中，或重新整理，都會執行這個函式，用於向伺服器查詢取回原本登入會員的資料
  const handleCheckAuth = async () => {
    const res = await checkAuth()

    // 伺服器api成功的回應為 { status:'success', data:{ user } }
    if (res.data.status === 'success') {
      // 只需要initUserData的定義屬性值
      const dbUser = res.data.data.user
      const userData = { ...initUserData }

      for (const key in userData) {
        if (Object.hasOwn(dbUser, key)) {
          userData[key] = dbUser[key] || ''
        }
      }
      // 設到全域狀態中
      setAuth({ isAuth: true, userData })
    } else {
      console.warn(res.data)

      // 在這裡實作隱私頁面路由的跳轉
      if (protectedRoutes.includes(router.pathname)) {
        router.push(loginRoute)
      }
    }
  }

  // didMount(初次渲染)後，向伺服器要求檢查會員是否登入中
  useEffect(() => {
    if (router.isReady && !auth.isAuth) {
      handleCheckAuth()
    }

    // 下面加入router.pathname，是為了要在向伺服器檢查後，
    // 如果有比對到是隱私路由，就執行跳轉到登入頁面工作
    // 注意有可能會造成向伺服器要求多次，此為簡單的實作範例
    // eslint-disable-next-line
  }, [router.isReady, router.pathname])

  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        setAuth,
        favorites,
        setFavorites,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
