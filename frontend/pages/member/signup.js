import React, { useState } from 'react'
import Image from 'next/image'
import axios from 'axios'
import Link from 'next/link'
import Header from '@/components/layout/default-layout/header'
import MyFooter from '@/components/layout/default-layout/my-footer'
import styles from '@/styles/signUpForm.module.scss'
import { useRouter } from 'next/router'
import Swal from 'sweetalert2'
import { useJumpingLetters } from '@/hooks/jumping-letters-hook'
import Head from 'next/head'
import 'animate.css';
import GlowingText from '@/components/dashboard/glowing-text/glowing-text';
export default function Signup() {
  // 處理失焦
  // const { renderJumpingText } = useJumpingLetters()

  const validatePassword = (password) => {
    //函式內宣告2個變數
    const rules = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password), //2
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
    }

    const messages = {
      minLength: '密碼至少需要8個字元',
      hasUpperCase: '需要包含大寫字母', //2
      hasLowerCase: '需要包含小寫字母',
      hasNumber: '需要包含數字',
    }

    // 函式的返回值
    //  Object.entries() 是產生新的陣列，不會影響到原物件
    return (
      Object.entries(rules)
        .filter(([rule, valid]) => !valid)
        // !valid 意思是找出值是 false 的規則
        .map(([rule]) => messages[rule])
    )
    // 用 rule 當作 key 去 messages 物件找對應的訊息
  }

  const router = useRouter()
  const [user, setUser] = useState({
    email: '',
    password: '',
    confirmpassword: '',
    phone: '',
    birthdate: '',
    gender: '',
    agree: false,
  })

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmpassword: '',
    gender: '',
    agree: '',
  })

  const [showpassword, setShowpassword] = useState(false)
  const [showConfirmpassword, setShowConfirmpassword] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target
    setUser((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!user.email) {
      newErrors.email = 'Email為必填'
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      newErrors.email = '請輸入有效的Email格式'
    }

    if (!user.password) {
      newErrors.password = '密碼為必填'
    } else if (user.password.length < 8) {
      newErrors.password = '密碼長度至少8個字元'
    }

    if (!user.confirmpassword) {
      newErrors.confirmpassword = '確認密碼為必填'
    } else if (user.password !== user.confirmpassword) {
      newErrors.confirmpassword = '密碼與確認密碼不相符'
    }

    if (!user.agree) {
      newErrors.agree = '請先同意會員註冊條款'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSubmitError('')

      if (!validateForm()) {
        return
      }
      const passwordErrors = validatePassword(user.password)
      if (passwordErrors.length > 0) {
        setErrors((prev) => ({
          ...prev,
          password: passwordErrors[0],
        }))
        return
      }

      const response = await axios.post(
        `http://localhost:3005/api/signup`,
        user
      )

      if (response.data.status === 'success') {
        setUser({
          email: '',
          password: '',
          phone: '',
          birthdate: '',
          gender: '',
          agree: false,
        })

        setErrors({})
        setSubmitError('')

        await Swal.fire({
          title: '註冊成功！',
          text: '歡迎加入我們！',
          icon: 'success',
          confirmButtonText: '前往登入',
          confirmButtonColor: '#3085d6',
        })

        router.push('/member/login')
      } else {
        await Swal.fire({
          title: '註冊失敗',
          text: response.data.message,
          icon: 'error',
          confirmButtonText: '確定',
          confirmButtonColor: '#3085d6',
        })
        setSubmitError(response.data.message)
      }
    } catch (error) {
      console.error('註冊請求失敗:', error)
      const errorMessage = error.response?.data?.message || '註冊過程中發生錯誤'

      await Swal.fire({
        title: '註冊失敗',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: '確定',
        confirmButtonColor: '#3085d6',
      })

      setSubmitError(errorMessage)
    }
  }

  return (
    <>
      <Head>
        <title>註冊</title>
      </Head>

      <Header />
      <div className={styles['gradient-bg']}>
        <Image
          src="/bgi/signup_bgi.png"
          alt="background"
          layout="fill"
          // style={{objectFit:'cover'}}
          // objectFit="cover"
          quality={100}
        />
        <div className="container">
          <div className="row align-items-center">
            <div className={`${styles.left} col-sm-12  col-md-6 col-lg-6 col d-flex flex-column justify-content-start`}>
              {/* <i>
              <h4 className={`text-white  animate__animated animate__zoomIn animate__infinite animate__rubberBand animate__slower	3s ${styles.signup}`}>Sign Up</h4> */}
                {/* </i> */}
              {/* <h3 className={`text-white ${styles['guru-laptop']}`}>
                GURU Laptop </h3>  */}
              {/* </h3> */}
              {/* <h4 className={`text-white text-start`}>
                {/* {renderJumpingText('Welcome to', 'welcome-text')} */}
                {/* {renderJumpingText('Sign Up to', 'welcome-text')} */}
              {/* </h4>  */}
            
              {/* <h3 className={`text-white ${styles['guru-laptop']}`}> */}
                {/* {renderJumpingText('LaptopGuru', 'company-name')} */}
              {/* </h3> */}
              <i><GlowingText text="Sign Up to"className={`text-white text-md-start`} /></i>
              <i><GlowingText text="LaptopGuru" className={`text-white text-md-start`}/></i>
            </div>
            <div
              className={`${styles.right} align-item-center col ${styles['signup-right']} text-white col-sm-12  col-md-11 col-lg-5`}
            >
              <div className={`${styles.tabs} d-flex justify-content-between`}>
                <Link
                  className={`${styles.hover} text-decoration-none text-white`}
                  href="/member/login"
                >
                  登入
                </Link>
                <span className="text-white">| </span>
                <Link
                  className={`${styles.hover} text-decoration-none text-white`}
                  href="/member/signup"
                >
                  註冊
                </Link>
              </div>
              {submitError && (
                <div className="alert alert-danger" role="alert">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-3">
                <div className={styles['inputs-group']}>
                  <div className="mb-3">
                    <label htmlFor="email" className={styles.white}>
                      帳號(信箱)
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`form-control ${styles.inputs}`}
                      value={user.email}
                      onChange={handleFieldChange}
                    />
                    {errors.email && (
                      <div className="error">{errors.email}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className={styles.white}>
                      密碼
                    </label>
                    <input
                      type={showpassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      className={`form-control ${styles.inputs}`}
                      value={user.password}
                      onChange={handleFieldChange}
                      maxLength={62}
                    />
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="showpassword"
                        checked={showpassword}
                        onChange={() => setShowpassword(!showpassword)}
                        className="form-check-input"
                      />
                      <label
                        htmlFor="showpassword"
                        className="text-white form-check-label"
                      >
                        顯示密碼
                      </label>
                    </div>
                    {errors.password && (
                      <div className="error">{errors.password}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmpassword" className={styles.white}>
                      確認密碼
                    </label>
                    <input
                      type={showConfirmpassword ? 'text' : 'password'}
                      id="confirmpassword"
                      name="confirmpassword"
                      className={`form-control ${styles.inputs}`}
                      value={user.confirmpassword}
                      onChange={handleFieldChange}
                    />
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="showConfirmpassword"
                        checked={showConfirmpassword}
                        onChange={() =>
                          setShowConfirmpassword(!showConfirmpassword)
                        }
                        className="form-check-input"
                      />
                      <label
                        htmlFor="showConfirmpassword"
                        className="text-white form-check-label"
                      >
                        顯示密碼
                      </label>
                    </div>
                    {errors.confirmpassword && (
                      <div className="error">{errors.confirmpassword}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="phone" className={styles.white}>
                      手機
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className={`form-control ${styles.inputs}`}
                      value={user.phone}
                      onChange={handleFieldChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="birthdate" className={styles.white}>
                      生日
                    </label>
                    <div className="">
                      <input
                        type="date"
                        id="birthdate"
                        name="birthdate"
                        className={`form-control ${styles.inputs}`}
                        value={user.birthdate}
                        onChange={handleFieldChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="gender" className={styles.white}>
                      性別
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      className={`form-select ${styles.inputs}`}
                      value={user.gender}
                      onChange={handleFieldChange}
                    >
                      <option value="">請選擇</option>
                      <option value="female">女</option>
                      <option value="male">男</option>
                      <option value="undisclosed">不透漏</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="agree"
                        name="agree"
                        checked={user.agree}
                        onChange={handleFieldChange}
                        className="form-check-input"
                      />
                      <label
                        htmlFor="agree"
                        className="text-white form-check-label"
                      >
                        我同意網站會員註冊條款
                      </label>
                    </div>
                    {errors.agree && (
                      <div className="error">{errors.agree}</div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 text-white"
                  >
                    送出
                  </button>
                </div>
              </form>
            </div>
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
Signup.getLayout = (page) => page
