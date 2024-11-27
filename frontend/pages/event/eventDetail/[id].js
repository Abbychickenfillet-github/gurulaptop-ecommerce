import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import EventButton from '@/components/event/EventButton'
import axios from 'axios'
import NextBreadCrumb from '@/components/common/next-breadcrumb'
import Head from 'next/head'

const EventDetail = () => {
  const router = useRouter()
  const { id } = router.query
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 格式化日期時間
  const formatDateTime = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (error) {
      console.error('Date formatting error:', error)
      return dateString
    }
  }

  // 獲取活動詳情
  useEffect(() => {
    const fetchEventDetail = async () => {
      if (!id) return

      try {
        setLoading(true)
        const response = await axios.get(
          `http://localhost:3005/api/events/${id}`,
          { withCredentials: true }
        )

        if (response.data.code === 200) {
          setEvent(response.data.data)
        } else {
          setError('獲取活動詳情失敗')
        }
      } catch (err) {
        console.error('Error fetching event details:', err)
        setError(err.response?.data?.message || '獲取活動詳情失敗，請稍後再試')
      } finally {
        setLoading(false)
      }
    }

    fetchEventDetail()
  }, [id])

  // 獲取參賽方式顯示文字
  const getTeamTypeDisplay = (teamType) => {
    return teamType === '個人' ? '個人賽' : '團體賽'
  }

  // 處理報名按鈕點擊
  const handleRegistration = () => {
    // 檢查報名時間
    const now = new Date()
    const applyStart = new Date(event.applyStartTime)
    const applyEnd = new Date(event.applyEndTime)

    if (now < applyStart) {
      alert('報名尚未開始')
      return
    }

    if (now > applyEnd) {
      alert('報名已結束')
      return
    }

    // 檢查人數是否已滿
    if (event.currentParticipants >= event.maxPeople) {
      alert('報名人數已達上限')
      return
    }

    // 根據 teamType 決定跳轉位置
    const isIndividual = event.teamType === '個人'

    router.push({
      pathname: isIndividual
        ? '/event/individualRegistration'
        : '/event/eventRegistration',
      query: {
        eventId: id,
        eventName: event.name,
      },
    })
  }

  // 修改後的 handleGroupAction 函數
  const handleGroupAction = (actionType) => {
    if (actionType === 'create') {
      // 跳轉到開團找人頁面，並傳遞活動資訊
      router.push({
        pathname: '/group/groupCreat',
        query: {
          eventId: id,
          eventName: event.name,
          eventStartTime: event.eventStartTime,
          eventEndTime: event.eventEndTime,
        },
      })
    } else {
      // 跳轉到揪團列表頁面
      router.push('/group')
    }
  }

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">載入中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center" role="alert">
        {error}
      </div>
    )
  }

  if (!event) {
    return (
      <div className="alert alert-warning text-center" role="alert">
        找不到活動資訊
      </div>
    )
  }

  // 安全的處理換行符號轉換
  const formatRule = (rule) => {
    if (!rule) return ''
    return rule.replace(/\n/g, '<br>')
  }

  return (
    <>
      <Head>
        <title>{event?.name}</title>
      </Head>
      <div className="eventDetail-wrapper">
        <div className="container">
          <NextBreadCrumb />
          <nav className="navbar navbar-dark eventDetail-navbar mb-4">
            <div className="container-fluid">
              <span className="navbar-brand h1">{event.name}</span>
              <EventButton>{event.status}</EventButton>
            </div>
          </nav>

          <div className="container container-lg mb-4 eventDetail-content">
            <div className="row gy-4">
              {/* 左側資訊 */}
              <div className="col-12 col-md-4 order-md-1 order-2">
                <div className="eventDetail-infoBox">
                  <dl className="eventDetail-infoList mb-0">
                    <dt>活動日期</dt>
                    <dd>{formatDateTime(event.eventStartTime)}</dd>
                    <dt>報名期間</dt>
                    <dd>
                      開始：{formatDateTime(event.applyStartTime)}
                      <br />
                      結束：{formatDateTime(event.applyEndTime)}
                    </dd>
                    <dt>平台</dt>
                    <dd>{event.platform}</dd>
                    <dt>參賽方式</dt>
                    <dd>{getTeamTypeDisplay(event.teamType)}</dd>
                    <dt>{event.teamType === '個人' ? '參賽人數' : '隊伍數'}</dt>
                    <dd>
                      目前 {event.currentParticipants}/{event.maxPeople}{' '}
                      {event.teamType === '個人' ? '人' : '隊'}
                    </dd>
                    <dt>獎勵</dt>
                    <dd>{event.award}</dd>
                  </dl>
                  <div className="d-grid gap-2">
                    <EventButton onClick={handleRegistration}>
                      {event.teamType === '個人' ? '個人報名' : '團體報名'}
                    </EventButton>
                    <EventButton onClick={() => handleGroupAction('create')}>
                      開團找人
                    </EventButton>
                    <EventButton onClick={() => handleGroupAction('list')}>
                      揪團列表
                    </EventButton>
                  </div>
                </div>
              </div>

              {/* 右側內容 */}
              <div className="col-12 col-md-8 order-md-2 order-1">
                <img
                  src={event.picture}
                  alt="活動圖片"
                  className="eventDetail-image mb-4"
                  onError={(e) => {
                    e.target.src = '/images/event-default.png'
                  }}
                />
                <div className="eventDetail-infoBox">
                  <h2 className="h5 mb-3">活動介紹</h2>
                  <p>{event.content}</p>
                </div>
                <div className="eventDetail-infoBox">
                  <h2 className="h5 mb-3">規則</h2>
                  <div
                    className="eventDetail-rulesList"
                    dangerouslySetInnerHTML={{
                      __html: formatRule(event.rule),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default EventDetail
