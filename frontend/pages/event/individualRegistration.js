import React, { useState } from 'react'
import { useRouter } from 'next/router'
import EventButton from '@/components/event/EventButton'
import styles from '@/styles/individualRegistration.module.css'
import axios from 'axios'
import Swal from 'sweetalert2'
import PrivacyPolicy from '@/components/event/PrivacyPolicy'
import NextBreadCrumb from '@/components/common/next-breadcrumb'
import Head from 'next/head'

const IndividualRegistration = () => {
  const router = useRouter()
  const { eventId } = router.query

  // 表單狀態管理
  const [formData, setFormData] = useState({
    participant: {
      name: '',
      gameId: '',
      phone: '',
      email: '',
    },
    agreeToTerms: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // 表單驗證函式
  const validateForm = async () => {
    // 驗證個人資訊
    if (
      !formData.participant.name.trim() ||
      !formData.participant.gameId.trim() ||
      !formData.participant.phone.trim() ||
      !formData.participant.email.trim()
    ) {
      await Swal.fire({
        icon: 'warning',
        title: '提示',
        text: '請填寫所有必填欄位',
        showConfirmButton: false,
        timer: 1500,
      })
      return false
    }

    // 驗證電子郵件格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.participant.email)) {
      await Swal.fire({
        icon: 'warning',
        title: '提示',
        text: '請輸入有效的電子郵件地址',
        showConfirmButton: false,
        timer: 1500,
      })
      return false
    }

    // 驗證電話號碼格式（台灣手機號碼格式）
    const phoneRegex = /^09\d{8}$/
    if (!phoneRegex.test(formData.participant.phone)) {
      await Swal.fire({
        icon: 'warning',
        title: '提示',
        text: '請輸入有效的手機號碼（格式：09xxxxxxxx）',
        showConfirmButton: false,
        timer: 1500,
      })
      return false
    }

    // 驗證同意條款
    if (!formData.agreeToTerms) {
      await Swal.fire({
        icon: 'warning',
        title: '提示',
        text: '請同意活動相關規定及條款',
        showConfirmButton: false,
        timer: 1500,
      })
      return false
    }

    return true
  }

  // 處理輸入變更
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name.startsWith('participant.')) {
      const field = name.split('.')[1]
      setFormData((prev) => ({
        ...prev,
        participant: {
          ...prev.participant,
          [field]: value,
        },
      }))
    } else if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault()

    // 驗證表單
    if (!(await validateForm())) {
      return
    }

    // 確認提交
    const confirmResult = await Swal.fire({
      icon: 'question',
      title: '確認提交',
      text: '確定要提交報名嗎？',
      showCancelButton: true,
      confirmButtonText: '確定',
      cancelButtonText: '取消',
    })

    if (!confirmResult.isConfirmed) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await axios.post(
        `http://localhost:3005/api/events/${eventId}/register/individual`,
        {
          participantInfo: {
            name: formData.participant.name,
            gameId: formData.participant.gameId,
            phone: formData.participant.phone,
            email: formData.participant.email,
          },
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data.code === 200) {
        await Swal.fire({
          icon: 'success',
          title: '報名成功！',
          text: '即將返回活動詳情頁面...',
          showConfirmButton: false,
          timer: 1500,
        })
        setTimeout(() => {
          router.push(`/event/eventDetail/${eventId}`)
        }, 1500)
      }
    } catch (error) {
      let errorMessage = '報名失敗，請稍後再試'
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage
      } else if (error.request) {
        errorMessage = '網路連線異常，請檢查網路狀態'
      }

      await Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: errorMessage,
        showConfirmButton: false,
        timer: 2000,
      })
      console.error('Registration error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>個人報名表</title>
      </Head>
      <div className={styles['individualRegistration-wrapper']}>
        <div className="container">
          <NextBreadCrumb />
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <div className={styles['individualRegistration-card'] + ' p-4'}>
                <h2
                  className={
                    styles['individualRegistration-title'] + ' text-center mb-4'
                  }
                >
                  個人賽報名表單
                </h2>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <h3 className={styles['individualRegistration-subtitle']}>
                      參賽者資訊
                    </h3>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="participant.name"
                          className={styles['individualRegistration-label']}
                        >
                          參賽者姓名
                        </label>
                        <input
                          type="text"
                          name="participant.name"
                          value={formData.participant.name}
                          onChange={handleInputChange}
                          className={`form-control ${styles['individualRegistration-input']}`}
                          placeholder="請輸入姓名"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="participant.gameId"
                          className={styles['individualRegistration-label']}
                        >
                          遊戲ID
                        </label>
                        <input
                          type="text"
                          name="participant.gameId"
                          value={formData.participant.gameId}
                          onChange={handleInputChange}
                          className={`form-control ${styles['individualRegistration-input']}`}
                          placeholder="請輸入遊戲ID"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="participant.phone"
                          className={styles['individualRegistration-label']}
                        >
                          聯絡電話
                        </label>
                        <input
                          type="tel"
                          name="participant.phone"
                          value={formData.participant.phone}
                          onChange={handleInputChange}
                          className={`form-control ${styles['individualRegistration-input']}`}
                          placeholder="請輸入手機號碼（格式：09xxxxxxxx）"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="participant.email"
                          className={styles['individualRegistration-label']}
                        >
                          電子郵件
                        </label>
                        <input
                          type="email"
                          name="participant.email"
                          value={formData.participant.email}
                          onChange={handleInputChange}
                          className={`form-control ${styles['individualRegistration-input']}`}
                          placeholder="請輸入電子郵件"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="agreeToTerms"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        required
                      />
                      <label
                        className="form-check-label"
                        htmlFor="agreeToTerms"
                      >
                        我同意活動相關規定及
                        <PrivacyPolicy />
                      </label>
                    </div>
                  </div>

                  <div className="text-center">
                    <EventButton type="submit" disabled={isSubmitting}>
                      {isSubmitting ? '報名中...' : '提交報名'}
                    </EventButton>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default IndividualRegistration
