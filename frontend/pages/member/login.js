import React, { useState, useEffect } from 'react'
import styles from '@/styles/signUpForm.module.scss'
import Swal from 'sweetalert2'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/use-auth'
import { MdOutlineEmail } from 'react-icons/md'
import Header from '@/components/layout/default-layout/header'
import MyFooter from '@/components/layout/default-layout/my-footer'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { useLoader } from '@/hooks/use-loader'
import Head from 'next/head'
import GlowingText from '@/components/dashboard/glowing-text/glowing-text'

export default function LogIn() {
  const [showpassword, setShowpassword] = useState(false)
  const router = useRouter()
  const { login, auth } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ error: ' ' })
  const { showLoader, hideLoader } = useLoader()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    showLoader() // 開始載入時顯示

    try {
      // 直接調用 useAuth 的 login 函數，它會處理所有的登入邏輯
      await login(formData.get('email'), formData.get('password'))
      console.log('登入成功，auth 狀態:', auth) // 加入 debug
      
      // 等待認證狀態更新後再跳轉，增加延遲時間確保狀態更新
      setTimeout(() => {
        // 檢查認證狀態是否已更新
        if (auth.isAuth) {
          router.replace('/dashboard') // 使用 replace 避免歷史記錄問題
        } else {
          console.warn('登入成功但認證狀態未更新，等待更長時間...')
          // 如果狀態還沒更新，再等待一下
          setTimeout(() => {
            router.replace('/dashboard')
          }, 500)
        }
      }, 500) // 增加延遲時間
    } catch (error) {
      console.error('登入失敗:', error)
      setErrors({
        message: '登入失敗，請檢查帳號密碼',
      })
      Swal.fire({
        title: '登入失敗',
        text: '連接伺服器有問題',
        icon: 'error',
        confirmButtonText: '確定',
        confirmButtonColor: '#3085d6',
      })
    } finally {
      hideLoader() // 不管成功失敗都要關閉 loader
    }
  }

  useEffect(() => {
    // 如果認證檢查還沒完成，不執行跳轉
    if (!auth.hasChecked) {
      console.log('Login 頁面: 認證檢查中...', auth)
      return
    }
    
    // 如果用戶已登入，重定向到儀表板
    console.log('Login 頁面 auth 狀態:', auth) // 加入 debug
    if (auth?.isAuth) {
      // 使用 replace 而不是 push，避免歷史記錄問題
      router.replace('/dashboard')
      console.log('用戶已登入，跳轉到 dashboard')
      return
    }
  }, [auth?.isAuth, auth?.hasChecked, router])
  return (
    <>
      <Head>
        <title>登入</title>
      </Head>
      <Header />
      <div className={`${styles['gradient-bg']} ${styles['login-bg']}`}>
        <Image
          src="/bgi/signup_bgi.png"
          alt="background"
          fill
          style={{ objectFit: 'cover' }}
          quality={100}
        />
        <div className="container">
          <div
            className={`row ${styles['content-row']} d-flex justify-content-center align-items-center `}
          >
            <div
              className={`${styles.left} col d-flex flex-column justify-content-start col-sm-12 col-md-11 col-lg-6  `}
            >
              {/* <h4 className={`text-white text-md-start`}>
                {renderJumpingText('Welcome to', 'welcome-text')}
                {renderJumpingText('Log in', 'welcome-text')}
              </h4> */}

              {/* <h3 className={`text-white ${styles['guru-laptop']} text-start! text-md-start`}> */}
              {/* {renderJumpingText('to LaptopGuru', 'company-name')} */}
              {/* </h3> */}
              {/* <GlitchText>Log in</GlitchText> */}
              <i>
                <GlowingText
                  text="Log in to"
                  className={`text-white text-md-start text-lg-start`}
                />
              </i>
              <i>
                <GlowingText
                  text="GuruLaptop"
                  className={`text-white text-center text-lg-start text-md-start ${styles.glowingText}`}
                />
              </i>
            </div>
            {/* 右側登入表單 */}
            <div className={`col-lg-5 col-md-8 col-sm-12 bg-white bg-opacity-10 backdrop-blur-sm rounded-4 p-4 p-md-5 border border-white border-opacity-25 m-3 `}>
              {/* 覺得沒有這一塊透明的東西好像比較好看 */}
                {/* <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-4 p-4 p-md-5 border border-white border-opacity-25"> */}
                  {/* 頁籤切換 */}
                  <div className="d-flex justify-content-center mb-4">
                   
                  <div className="btn-group" role="group">
                    <Link
                      href="/member/login"
                      className="btn btn-outline-light active px-4 py-2"
                    >
                      登入
                    </Link>
                    <Link
                      href="/member/signup"
                      className="btn btn-outline-light px-4 py-2"
                    >
                      註冊
                    </Link>
                  </div>
                  </div>
              <form className="position-relative" onSubmit={handleSubmit}>
                <div className="inputs-group">
                  <div className="inputs position-relative">
                    <div className="position-relative mt-5">
                      <label
                        htmlFor="email"
                        className={`form-label text-white ${styles.hover} fw-semibold`}
                        >
                        <svg className={styles['label-icon']} viewBox="0 0 24 24" fill="none">
                          <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        帳號(信箱)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                        }}
                        className={`form-control form-control-lg ${styles.inputs}`}
                        name="email"
                        required // 添加必填
                        />
                      <MdOutlineEmail
                        className={`${styles['input-icon']}`}
                        size={22}
                        style={{ color: '#E0B0FF' }} // 使用淺粉紫色
                        />
                    </div>

                    <div className="position-relative mt-5">
                      <label
                        htmlFor="password"
                        className={`form-label text-white fw-semibold ${styles.hover}`}
                        >
                        <svg className={styles['label-icon']} viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="16" r="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        密碼
                      </label>
                      <input
                        type={showpassword ? 'text' : 'password'}
                        value={password}
                        autoComplete="new-password"
                        onChange={(e) => {
                          setPassword(e.target.value)
                        }}
                        id="password"
                        name="password" // 添加 name
                        className={`form-control form-control-lg ${styles.inputs}`}
                        required // 添加必填
                        />
                      {/* 這個button是 眼睛*/}
                      <button
                        type="button"
                        className="btn btn-primary position-absolute end-0 top-50  border-0 ${styles[eye-icon]}"
                        onClick={() => setShowpassword(!showpassword)}
                        style={{
                          background: 'none',
                          // 使用 !important 強制覆蓋
                          transform: 'translateY(calc(50% - 20px))',
                          right: '10px',
                        }}
                        >
                        {showpassword ? (
                          <AiOutlineEyeInvisible size={20} color="#E0B0FF" />
                        ) : (
                          <AiOutlineEye size={20} color="#E0B0FF" />
                        )}
                      </button>

                      {/* <MdLockOutline
                      className={`${styles['input-icon']}`}
                      size={22}
                      style={{ color: '#E0B0FF', cursor: 'pointer' }}
                      /> */}
                    </div>


                    <div
                      id="Error_message"
                      className={`form-text text-white p-5`}
                      >
                      {errors.message && (
                        <div className="error">{errors.message}</div>
                      )}
                    </div>

                    <div className="center-of-bottom-group d-flex flex-wrap justify-content-between align-items-center mt-4">
                      <Link
                        className={`text-white text-decoration-none ${styles['forgot-password-link']}`}
                        href="./forget-password"
                        >
                        <svg className={styles['link-icon']} viewBox="0 0 24 24" fill="none">
                          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>忘記密碼？</span>
                        <svg className={styles['arrow-icon']} viewBox="0 0 24 24" fill="none">
                          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>

                      <button
                        className={`btn btn-primary btn-lg fw-semibold py-3 ${styles['submit-button']}`}
                        type="submit"
                        style={{
                          background: 'linear-gradient(45deg, #805AF5, #E0B0FF)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 15px rgba(128, 90, 245, 0.3)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <span>登入</span>
                        <svg className={styles['button-icon']} viewBox="0 0 24 24" fill="none">
                          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
              .
            </div>
                          {/* </div> */}
          </div>
        </div>
      </div>

      <MyFooter />

      <style jsx>{`
          .error {
            color: red;
            font-size: 16px;
            margin-top: 0.25rem;
          }
        `}</style>
    </>
  )
}
LogIn.getLayout = (page) => page
