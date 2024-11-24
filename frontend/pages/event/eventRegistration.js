import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import EventButton from '@/components/event/EventButton'
import PlayerInfo from '@/components/event/PlayerInfo'
import axios from 'axios'
import Swal from 'sweetalert2'
import PrivacyPolicy from '@/components/event/PrivacyPolicy'
import NextBreadCrumb from '@/components/common/next-breadcrumb'
import Head from 'next/head'

const EventRegistration = () => {
  const router = useRouter()
  const { eventId } = router.query

  const [eventInfo, setEventInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    teamName: '',
    captain: {
      name: '',
      gameId: '',
      phone: '',
      email: '',
    },
    players: {
      1: { name: '', gameId: '' },
    },
    agreeToTerms: false,
  })

  const [visiblePlayers, setVisiblePlayers] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 獲取活動資訊
  useEffect(() => {
    const fetchEventInfo = async () => {
      if (!eventId) return

      try {
        const response = await axios.get(
          `http://localhost:3005/api/events/${eventId}`,
          { withCredentials: true }
        )
        const eventData = response.data.data
        setEventInfo(eventData)
        console.log('活動資料:', eventData)

        // 檢查活動類型
        if (eventData.teamType !== '團體') {
          await Swal.fire({
            icon: 'warning',
            title: '提示',
            text: '此活動不是團體賽',
            showConfirmButton: false,
            timer: 2000,
          })
          router.push(`/event/eventDetail/${eventId}`)
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: '錯誤',
          text: error.response?.data?.message || '無法載入活動資訊',
          showConfirmButton: false,
          timer: 2000,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEventInfo()
  }, [eventId, router])

  // 表單驗證函式
  const validateForm = async () => {
    if (!formData.teamName.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: '提示',
        text: '請輸入隊伍名稱',
        showConfirmButton: false,
        timer: 1500,
      })
      return false
    }

    if (
      !formData.captain.name.trim() ||
      !formData.captain.gameId.trim() ||
      !formData.captain.phone.trim() ||
      !formData.captain.email.trim()
    ) {
      await Swal.fire({
        icon: 'warning',
        title: '提示',
        text: '請填寫完整的隊長資訊',
        showConfirmButton: false,
        timer: 1500,
      })
      return false
    }

    const phoneRegex = /^09\d{8}$/
    if (!phoneRegex.test(formData.captain.phone)) {
      await Swal.fire({
        icon: 'warning',
        title: '提示',
        text: '請輸入有效的手機號碼（格式：09xxxxxxxx）',
        showConfirmButton: false,
        timer: 1500,
      })
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.captain.email)) {
      await Swal.fire({
        icon: 'warning',
        title: '提示',
        text: '請輸入有效的電子郵件地址',
        showConfirmButton: false,
        timer: 1500,
      })
      return false
    }

    for (let i = 1; i <= visiblePlayers; i++) {
      const player = formData.players[i]
      if (!player || !player.name.trim() || !player.gameId.trim()) {
        await Swal.fire({
          icon: 'warning',
          title: '提示',
          text: '請確認所有隊員資訊都已填寫完整',
          showConfirmButton: false,
          timer: 1500,
        })
        return false
      }
    }

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

  // 處理隊伍名稱和隊長資訊變更
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name.startsWith('captain.')) {
      const field = name.split('.')[1]
      setFormData((prev) => ({
        ...prev,
        captain: {
          ...prev.captain,
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

  // 處理隊員資訊變更
  const handlePlayerChange = (playerNumber, field, value) => {
    setFormData((prev) => ({
      ...prev,
      players: {
        ...prev.players,
        [playerNumber]: {
          ...prev.players[playerNumber],
          [field]: value,
        },
      },
    }))
  }

  // 處理新增隊員
  const handleAddPlayer = async () => {
    const maxTeamSize = eventInfo?.maxPeople || 6
    if (visiblePlayers >= maxTeamSize) {
      await Swal.fire({
        icon: 'warning',
        title: '提示',
        text: '已達人數上限 (6 人)',
        showConfirmButton: false,
        timer: 1500,
      })
      return
    }

    const nextPlayerNumber = visiblePlayers + 1
    setVisiblePlayers(nextPlayerNumber)
    setFormData((prev) => ({
      ...prev,
      players: {
        ...prev.players,
        [nextPlayerNumber]: { name: '', gameId: '' },
      },
    }))
  }

  // 處理移除隊員
  const handleRemovePlayer = async (playerNumber) => {
    if (visiblePlayers <= 1) {
      await Swal.fire({
        icon: 'warning',
        title: '提示',
        text: '至少需要一名隊員',
        showConfirmButton: false,
        timer: 1500,
      })
      return
    }

    const result = await Swal.fire({
      icon: 'question',
      title: '確認移除',
      text: '確定要移除此隊員嗎？',
      showCancelButton: true,
      confirmButtonText: '確定',
      cancelButtonText: '取消',
    })

    if (result.isConfirmed) {
      setVisiblePlayers((prev) => prev - 1)
      setFormData((prev) => {
        const newPlayers = { ...prev.players }
        delete newPlayers[playerNumber]
        const sortedPlayers = {}
        let index = 1
        Object.values(newPlayers).forEach((player) => {
          sortedPlayers[index] = player
          index++
        })
        return {
          ...prev,
          players: sortedPlayers,
        }
      })
    }
  }

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!(await validateForm())) {
      return
    }

    const teamMembers = Object.values(formData.players)
    for (let i = 0; i < teamMembers.length; i++) {
      const player = teamMembers[i]
      if (!player.name.trim() || !player.gameId.trim()) {
        await Swal.fire({
          icon: 'warning',
          title: '提示',
          text: '請確認所有隊員資訊都已填寫完整',
          showConfirmButton: false,
          timer: 1500,
        })
        return
      }
    }

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
        `http://localhost:3005/api/events/${eventId}/register/team`,
        {
          teamName: formData.teamName,
          captainInfo: formData.captain,
          teamMembers: Object.values(formData.players),
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
        router.push(`/event/eventDetail/${eventId}`)
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

  // 載入中顯示
  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  // 如果不是團體賽，顯示錯誤訊息
  if (eventInfo && eventInfo.teamType !== '團體') {
    return (
      <div className="container">
        <div className="alert alert-warning text-center mt-5" role="alert">
          此活動不是團體賽
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>團體報名表</title>
      </Head>
      <div className="eventRegistration-wrapper">
        <div className="container">
          <NextBreadCrumb />
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <div className="eventRegistration-card p-4">
                <h2 className="eventRegistration-title text-center mb-4">
                  團體賽報名表單
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <h3 className="eventRegistration-subtitle">隊伍資訊</h3>
                    <div className="mb-3">
                      <label
                        htmlFor="teamName"
                        className="eventRegistration-label"
                      >
                        隊伍名稱
                      </label>
                      <input
                        type="text"
                        id="teamName"
                        name="teamName"
                        value={formData.teamName}
                        onChange={handleInputChange}
                        className="form-control eventRegistration-input"
                        placeholder="請輸入隊伍名稱"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="eventRegistration-subtitle">隊長資訊</h3>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="captain.name"
                          className="eventRegistration-label"
                        >
                          隊長姓名
                        </label>
                        <input
                          type="text"
                          name="captain.name"
                          value={formData.captain.name}
                          onChange={handleInputChange}
                          className="form-control eventRegistration-input"
                          placeholder="請輸入隊長姓名"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="captain.gameId"
                          className="eventRegistration-label"
                        >
                          遊戲ID
                        </label>
                        <input
                          type="text"
                          name="captain.gameId"
                          value={formData.captain.gameId}
                          onChange={handleInputChange}
                          className="form-control eventRegistration-input"
                          placeholder="請輸入遊戲ID"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="captain.phone"
                          className="eventRegistration-label"
                        >
                          聯絡電話
                        </label>
                        <input
                          type="tel"
                          name="captain.phone"
                          value={formData.captain.phone}
                          onChange={handleInputChange}
                          className="form-control eventRegistration-input"
                          placeholder="請輸入手機號碼（格式：09xxxxxxxx）"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label
                          htmlFor="captain.email"
                          className="eventRegistration-label"
                        >
                          電子郵件
                        </label>
                        <input
                          type="email"
                          name="captain.email"
                          value={formData.captain.email}
                          onChange={handleInputChange}
                          className="form-control eventRegistration-input"
                          placeholder="請輸入電子郵件"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h3 className="eventRegistration-subtitle mb-0">
                        隊員資訊
                      </h3>
                      <EventButton
                        type="button"
                        onClick={handleAddPlayer}
                        className="btn-sm"
                        disabled={visiblePlayers >= 6}
                      >
                        新增隊員 ({visiblePlayers}/6)
                      </EventButton>
                    </div>

                    {Array.from({ length: visiblePlayers }).map((_, index) => (
                      <div key={index + 1} className="position-relative mb-3">
                        <PlayerInfo
                          number={index + 1}
                          playerData={formData.players[index + 1]}
                          onChange={(field, value) =>
                            handlePlayerChange(index + 1, field, value)
                          }
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm position-absolute"
                            style={{ top: '10px', right: '10px' }}
                            onClick={() => handleRemovePlayer(index + 1)}
                          >
                            移除
                          </button>
                        )}
                      </div>
                    ))}
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

export default EventRegistration
