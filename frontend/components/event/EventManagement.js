import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './EventManagement.module.css'
import axios from 'axios'
import Swal from 'sweetalert2'

const EventManagement = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUserEvents = async () => {
    try {
      const response = await axios.get(
        'http://localhost:3005/api/events/user/registered',
        {
          withCredentials: true,
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        }
      )

      if (response.data.code === 200) {
        const events = response.data.data.events || []
        setEvents(events)
      } else {
        throw new Error(response.data.message || '獲取活動列表失敗')
      }
    } catch (error) {
      console.error('獲取活動失敗:', error)
      let errorMessage = '獲取活動列表失敗'
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage
      } else if (error.request) {
        errorMessage = '網路連線異常，請檢查網路狀態'
      }
      setError(errorMessage)
      await Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: errorMessage,
        timer: 1500,
        showConfirmButton: false,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserEvents()
  }, [])

  const handleCancelRegistration = async (eventId) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: '確認取消報名',
      text: '您確定要取消報名此活動嗎？',
      showCancelButton: true,
      confirmButtonText: '確定',
      cancelButtonText: '取消',
    })

    if (!result.isConfirmed) return

    try {
      const response = await axios.delete(
        `http://localhost:3005/api/events/${eventId}/registration`,
        { withCredentials: true }
      )

      if (response.data.code === 200) {
        await Swal.fire({
          icon: 'success',
          title: '取消成功',
          text: '已成功取消報名！',
          timer: 1500,
          showConfirmButton: false,
        })
        fetchUserEvents()
      }
    } catch (error) {
      console.error('取消報名失敗:', error)
      await Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: error.response?.data?.message || '取消報名失敗',
        timer: 1500,
        showConfirmButton: false,
      })
    }
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath.trim() === '') {
      return '/images/event-default.png'
    }
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    return `http://localhost:3005${imagePath}`
  }

  // 格式化時間
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }
    return new Date(dateString).toLocaleString('zh-TW', options)
  }

  if (loading)
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">載入中...</span>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="alert alert-danger m-3" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    )

  if (events.length === 0)
    return (
      <div className="alert alert-info m-3" role="alert">
        <i className="bi bi-info-circle me-2"></i>
        目前沒有報名的活動
      </div>
    )

  return (
    <div className={`py-2`}>
      <div className={styles.groupList}>
        <div className={styles.listHeader}>
          <div className={styles.listTitle}>
            <i className="bi bi-calendar-check"></i>
            我的活動
          </div>
        </div>

        <div
          className={`${styles.listRow} ${styles.desktopHeader} d-none d-md-block`}
        >
          <div className="row align-items-center">
            <div className="col-2"></div>
            <div className="col-3">活動名稱</div>
            <div className="col-2">活動時間</div>
            <div className="col-2">人數</div>
            <div className="col-2">狀態</div>
            <div className="col-1">操作</div>
          </div>
        </div>

        {events.map((event) => (
          <div key={event.id} className={styles.listRow}>
            {/* 桌面版視圖 */}
            <div className="row align-items-center d-none d-md-flex">
              <div className="col-2">
                <Link href={`/event/eventDetail/${event.id}`}>
                  <img
                    src={getImageUrl(event.picture)}
                    alt={event.name}
                    className={styles.groupImg}
                    onError={(e) => {
                      e.target.src = '/images/event-default.png'
                    }}
                  />
                </Link>
              </div>
              <div className="col-3">
                <Link
                  href={`/event/eventDetail/${event.id}`}
                  className={styles.eventLink}
                >
                  {event.name}
                </Link>
              </div>
              <div className="col-2">{formatDate(event.eventStartTime)}</div>
              <div className="col-2">
                {event.currentParticipants}/{event.maxPeople}
              </div>
              <div className="col-2">{event.status}</div>
              <div className="col-1">
                {event.status !== '已結束' && (
                  <button
                    className={styles.actionBtn}
                    onClick={() => handleCancelRegistration(event.id)}
                    title="取消報名"
                  >
                    <i className="bi bi-x-circle"></i>
                  </button>
                )}
              </div>
            </div>

            {/* 手機版視圖 */}
            <div className={`${styles.mobileLayout} d-block d-md-none`}>
              <div className={styles.mobileImgWrapper}>
                <Link href={`/event/eventDetail/${event.id}`}>
                  <img
                    src={getImageUrl(event.picture)}
                    alt={event.name}
                    className={styles.groupImg}
                    onError={(e) => {
                      e.target.src = '/images/event-default.png'
                    }}
                  />
                </Link>
              </div>
              <div className={styles.mobileInfo}>
                <div className={styles.mobileTitle}>
                  <Link
                    href={`/event/eventDetail/${event.id}`}
                    className={styles.eventLink}
                  >
                    {event.name}
                  </Link>
                </div>
                <div className={styles.mobileDetails}>
                  <div className={styles.mobileStats}>
                    <span>
                      <i className="bi bi-clock"></i>
                      {formatDate(event.eventStartTime)}
                    </span>
                    <span>
                      <i className="bi bi-people"></i>
                      {event.currentParticipants}/{event.maxPeople}
                    </span>
                    <span>
                      <i className="bi bi-flag"></i>
                      {event.status}
                    </span>
                  </div>
                  {event.status !== '已結束' && (
                    <div className={styles.mobileActions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleCancelRegistration(event.id)}
                        title="取消報名"
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EventManagement
