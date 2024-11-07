import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import EventButton from '@/components/event/EventButton'
import axios from 'axios'

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
          `http://localhost:3005/api/events/${id}`
        )

        if (response.data.code === 200) {
          setEvent(response.data.data)
        } else {
          setError('獲取活動詳情失敗')
        }
      } catch (err) {
        setError('獲取活動詳情失敗，請稍後再試')
        console.error('Error fetching event details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEventDetail()
  }, [id])

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

  return (
    <div className="eventDetail-wrapper">
      <div className="container">
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
                  <dt>隊伍上限</dt>
                  <dd>{event.maxPeople} 隊</dd>
                  <dt>獎勵</dt>
                  <dd>{event.award}</dd>
                </dl>
                <div className="d-grid gap-2">
                  <EventButton>報名參加</EventButton>
                  <EventButton>開團找人</EventButton>
                  <EventButton>揪團列表</EventButton>
                </div>
              </div>
            </div>

            {/* 右側內容 */}
            <div className="col-12 col-md-8 order-md-2 order-1">
              <img
                src={event.picture}
                alt="活動圖片"
                className="eventDetail-image mb-4"
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
                    __html: event.rule.replace(/\n/g, '<br>'),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetail
