import React, { useState } from 'react'
import Image from 'next/image'
import axios from 'axios'
import Link from 'next/link'
import styles from '@/styles/signUpForm.module.scss'
import { useRouter } from 'next/router'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)

export default function Signup() {
  const validatePassword = (password) => {
    // 密碼驗證規則
    const rules = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      // hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    // 檢查所有規則
    const messages = {
      minLength: '密碼至少需要8個字元',
      hasUpperCase: '需要包含大寫字母',
      hasLowerCase: '需要包含小寫字母',
      hasNumber: '需要包含數字',
      // hasSpecialChar: '需要包含特殊符號',
    }

    // 回傳未通過的規則訊息
    return Object.entries(rules)
      .filter(([rule, valid]) => !valid)
      .map(([rule]) => messages[rule])
  }

  const router = useRouter()
  const [user, setUser] = useState({
    email: '',
    password: '',
    confirmpassword: '',
    // phone: '',
    // birthdate: '',
    gender: '',
    agree: false,
  })

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmpassword: '',
    // phone: '',
    // birthdate: '',
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
    // Clear error when user starts typing
    // // 這是一個使用state更新函數的例子
    // prev 是前一個state的值（當前errors物件的所有內容）
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }
  // 表單驗證
  const validateForm = () => {
    const newErrors = {}

    // Email validation
    if (!user.email) {
      newErrors.email = 'Email為必填'
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      newErrors.email = '請輸入有效的Email格式'
    }

    // Password validation
    if (!user.password) {
      newErrors.password = '密碼為必填'
    } else if (user.password.length < 8) {
      newErrors.password = '密碼長度至少8個字元'
    }

    // Confirm password validation
    if (!user.confirmpassword) {
      newErrors.confirmpassword = '確認密碼為必填'
    } else if (user.password !== user.confirmpassword) {
      newErrors.confirmpassword = '密碼與確認密碼不相符'
    }

    // Phone validation
    // if (!user.phone) {
    //   newErrors.phone = '手機號碼為必填'
    // } else if (!/^\d{10}$/.test(user.phone)) {
    //   newErrors.phone = '請輸入有效的手機號碼'
    // }

    // Gender validation
    // if (!user.gender) {
    //   newErrors.gender = '請選擇性別';
    // }

    // Agreement validation
    if (!user.agree) {
      newErrors.agree = '請先同意會員註冊條款'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ...prev 是展開運算符，把前一個state的所有屬性複製過來
  // password: passwordErrors[0] 是要更新的新屬性
  // 整體來說就是「保留原本errors物件的所有內容，但更新password屬性的值」
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSubmitError('')

      // 驗證密碼
      const passwordErrors = validatePassword(user.password)
      if (passwordErrors.length > 0) {
        setErrors((prev) => ({
          ...prev,
          password: passwordErrors[0],
        }))
        return
      }

      // 驗證表單
      if (!validateForm()) {
        return
      }

      // 發送註冊請求
      const response = await axios.post(
        'http://localhost:3005/api/signup',
        user
      )

      // 檢查回應狀態
      if (response.data.status === 'success') {
        // 清空表單
        setUser({
          email: '',
          password: '',
          phone: '',
          birthdate: '',
          gender: '',
          agree: false,
        })

        // 清空錯誤訊息
        setErrors({})
        setSubmitError('')

        // 成功訊息
        await Swal.fire({
          title: '註冊成功！',
          text: '歡迎加入我們！',
          icon: 'success',
          confirmButtonText: '前往登入',
          confirmButtonColor: '#3085d6',
        })

        router.push('/member/login')
      } else {
        // 處理錯誤狀態
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

      // 根據錯誤狀態顯示不同訊息
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
    <div className={styles['gradient-bg']}>
      <Image
        src="/bgi/signup_bgi.png"
        alt="background"
        layout="fill"
        objectFit="cover"
        quality={100}
      />
      <div className="row d-flex justify-content-center align-items-center gx-5">
        <div className={`${styles.left} col-4`}>
          <h4 className={`text-white ${styles.welcome}`}>Welcome to</h4>
          <h3 className={`text-white ${styles['guru-laptop']}`}>GURU Laptop</h3>
          {/* 密碼請至少輸入8個字元、最多20字元，需要包含大寫字母、需要包含小寫字母、需要包含數字、需要包含特殊符號。 */}
        </div>
        <div className={`${styles.right} col-sm-12 col-md-4`}>
          <div className={`${styles.tabs} d-flex justify-content-between`}>
            <span className={`${styles.white} ${styles.hover}`}>
              <Link className="text-decoration-none" href="/member/login">
                登入Log in
              </Link>
            </span>
            <span className={styles.white}>|</span>
            <span className={`${styles.white} ${styles.hover}`}>
              <Link className="text-decoration-none" href="/member/signup">
                註冊Sign Up
              </Link>
            </span>
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
                {errors.email && <div className="error">{errors.email}</div>}
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
                    className={`${styles.white} form-check-label`}
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
                    className={`${styles.white} form-check-label`}
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
                {/* {errors.phone && <div className="error">{errors.phone}</div>} */}
              </div>

              <div className="mb-3">
                <label htmlFor="birthdate" className={styles.white}>
                  生日
                </label>
                <input
                  type="date"
                  id="birthdate"
                  name="birthdate"
                  className={`form-control ${styles.inputs}`}
                  value={user.birthdate}
                  onChange={handleFieldChange}
                />
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
                  <option value="女">女</option>
                  <option value="男">男</option>
                  <option value="不透漏">不透漏</option>
                </select>
                {/* {errors.gender && <div className="error">{errors.gender}</div>} */}
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
                    className={`${styles.white} form-check-label`}
                  >
                    我同意網站會員註冊條款
                  </label>
                </div>
                {errors.agree && <div className="error">{errors.agree}</div>}
              </div>

              <button type="submit" className="btn btn-primary w-100">
                送出
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .error {
          color: red;
          font-size: 16px;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  )
}
