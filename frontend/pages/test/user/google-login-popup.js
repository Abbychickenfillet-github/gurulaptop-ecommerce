import axios from 'axios'  // 加在檔案最上方
import useFirebase from '@/hooks/use-firebase'
import { initUserData, useAuth } from '@/hooks/use-auth'
import {
  checkAuth,
  // logout,
  parseJwt,
  getUserById,
} from '@/services/user'
import toast, { Toaster } from 'react-hot-toast'
import GoogleLogo from '@/components/icons/google-logo'

// 因瀏覽器安全限制，改用signInWithPopup，詳見以下討論
// https://github.com/orgs/mfee-react/discussions/129
export default function GoogleLoginPopup() {
  const { loginGoogle, logoutFirebase } = useFirebase()
  const { auth, setAuth } = useAuth()

  // 處理google登入後，要向伺服器進行登入動作
  const callbackGoogleLoginPopup = async (providerData) => {
    try{
      console.log('1. Google 登入資料:', providerData)
      // 向伺服器進行登入動作
      const res = await axios.post(`http://localhost:3005/api/google-login/first`, {
        uid: providerData.uid,
        displayName: providerData.displayName,
        email: providerData.email,
        photoURL: providerData.photoURL
      })      
      if(!res){
        console.error("沒有後端回應")
      }
      // let res
      console.log('2. 後端登入回應:', res.data)
    // 如果目前react(next)已經登入中，不需要再作登入動作
      // if (auth.isAuth) return
      console.log(res.data)
      if (res.data.status === 'success') {
        // 從JWT存取令牌中解析出會員資料
        // 注意JWT存取令牌中只有id, username, google_uid, line_uid在登入時可以得到
        const jwtUser = parseJwt(res.data.data.accessToken)
        console.log(jwtUser)

        const res1 = await getUserById(jwtUser.id)
        console.log(res1.data)

        if (res.data.status === 'success') {
          // 只需要initUserData中的定義屬性值，詳見use-auth勾子
          // 先複製一份完整的初始結構
          const dbUser = res.data.data.user
          // 檢查每個 initUserData 的欄位
          const userData = { ...initUserData }
        // 這個迴圈的目的是：

  // 如果後端傳回的資料有這個欄位

          for (const key in userData) {
            if (Object.hasOwn(dbUser, key)) {
                  // 就用後端的值，如果後端的值是 null 或 undefined，則用空字串
              userData[key] = dbUser[key] || ''
            }
          }
  // 如果後端沒有這個欄位，就保持 initUserData 的初始值

          // 設定到全域狀態中
          setAuth({
            isAuth: true,
            userData: {
              ...initUserData,
              user_id: res.data.data.user.user_id,
              name: res.data.data.user.name,
              email: res.data.data.user.email,
              photo_url: res.data.data.user.photo_url,
              google_uid: providerData.uid  // 確保保存 google_uid
            }          
          })

          toast.success('已成功登入')
        } else {
          toast.error('登入後無法得到會員資料')
          // 這裡可以讓會員登出，因為這也算登入失敗，有可能會造成資料不統一
        }
      } else {
        toast.error(`登入失敗`)
      }
      }catch (error) {
        console.error('錯誤:', error)
        toast.error('登入過程發生錯誤')
      }

    }

  // 處理檢查登入狀態
  const handleCheckAuth = async () => {
    try {
      console.log('開始檢查登入狀態')
      const res = await checkAuth()
      console.log('檢查結果:', res.data)
  
      if (res.data.status === 'success') {
        toast.success('已登入會員')
      } else {
        toast.error(`非會員身份`)
      }
    } catch (error) {
      console.error('檢查失敗:', error)
      toast.error('檢查過程發生錯誤')
    }
  }

  // 處理登出
  const handleLogout = async () => {
    // firebase logout(注意，這並不會登出google帳號，是登出firebase的帳號)
    logoutFirebase()
    //這個logout是什麼
    const res = await logout()

    // 成功登出後，回復初始會員狀態
    if (res.data.status === 'success') {
      toast.success('已成功登出')

      setAuth({
        isAuth: false,
        userData: initUserData,
      })
    } else {
      toast.error(`登出失敗`)
    }
  }

  return (
    <>
      <h1>Google Login跳出視窗(popup)測試頁</h1>
      <p>會員狀態:{auth.isAuth ? '已登入' : '未登入'}</p>
      <button onClick={() => loginGoogle(callbackGoogleLoginPopup)}>
        <GoogleLogo /> Google登入
      </button>
      <br />
      <button onClick={handleLogout}>登出</button>
      <br />
      <button onClick={handleCheckAuth}>向伺服器檢查登入狀態</button>
      <hr />
      {/* 土司訊息視窗用 */}
      <Toaster />
    </>
  )
}
