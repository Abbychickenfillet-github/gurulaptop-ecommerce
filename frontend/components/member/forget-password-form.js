import styles from './member.module.css'
import Link from 'next/link'
import { useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import Image from 'next/image'


export default function ForgetPasswordForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState({
    email: '',
  })
  const [status, setStatus] = useState({
    message: '',
    type: ''
  })

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    setError(prev => ({
      ...prev,
      email: !e.target.value ? '請輸入電子郵件地址' : 
             !validateEmail(e.target.value) ? '請輸入有效的電子郵件地址' : ''
    }))
  }

  const getConfirmMail = async () => {
    try {
      if (!email || !validateEmail(email)) {
        setError(prev => ({
          ...prev,
          email: '請輸入有效的電子郵件地址'
        }))
        return
      }

      const response = await axios.post(
        'http://localhost:3005/api/forgot-password/send',
        { email }
      )

      if (response.data.status === 'success') {
        setMessage('已發送重設密碼信件到您的信箱')
        Swal.fire({
          title: '密碼重設信件已寄出',
          text: '請查看您的信箱',
          icon: 'success',
          timer: 4000
        })
        setError({...error, email: ''})
      } else {
        setError(prev => ({
          ...prev,
          email: response.data.message || '發送失敗'
        }))
      }
    } catch (err) {
      setError(prev => ({
        ...prev,
        email: err.response?.data?.message || '發送失敗'
      }))
    }
  }

  return (
    <div className={styles['gradient-bg']}>
    <Image
      src="/bgi/signup_bgi.png"
      alt="background"
      layout="fill"
      quality={100}
    />
    <div className="container position-relative"> {/* 新增 container 和 position-relative */}
      <main className={`form-member text-white w-100 m-auto text-center`}>
        <h2 className="text-center mb-5 text-white">忘記密碼</h2>
        
        {/* 訊息顯示區域 */}
        <div className="mb-4">
          {message && <div className="alert alert-success">{message}</div>}
          {error.email && <div className="alert alert-danger">{error.email}</div>}
          <p className={`text-white ${styles['text-note']}`}>
            輸入你的會員電子郵件地址，按下"取得新密碼"按鈕後，我們會將密碼重設指示寄送給你。
          </p>
        </div>

        <form>
          <div className="row mb-3">
            <div className="col-sm-12">
              <input
                type="email"
                name="email"
                value={email}
                className={`form-control w-100 ${styles['form-control']} ${error.email ? styles['invalid'] : ''}`}
                placeholder="電子郵件地址"
                onChange={handleEmailChange}
              />
              {error.email && (
                <div className={`${styles['error']} my-2 text-start`}>{error.email}</div>
              )}
            </div>
          </div>
          
          <div className="row mb-3">
            <div className="col-sm-12">
              <button
                className="btn btn-outline-light" // 改用 light 讓按鈕在深色背景更明顯
                type="button"
                onClick={getConfirmMail}
              >
                取得新密碼
              </button>
            </div>
          </div>

          <div className="row mt-2">
            <div className="col-sm-12">
              <p className={`${styles['notice']} text-white`}>
                還不是會員？
                <Link href="/member/signup" className="text-white ms-2">加入我們</Link>。
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  </div>
  )
}