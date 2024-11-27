import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import styles from './Carousel.module.css'

const Carousel = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [upcomingEvents, setUpcomingEvents] = useState([])

  // 獲取即將開始報名的活動
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await axios.get('http://localhost:3005/api/events', {
          params: {
            status: '即將開始報名',
            sort: 'nearest', 
          },
        })

        if (response.data.code === 200) {
          // 取前三個最接近的活動
          setUpcomingEvents(response.data.data.events.slice(0, 3))
        }
      } catch (error) {
        console.error('Error fetching upcoming events:', error)
      }
    }

    fetchUpcomingEvents()
  }, [])

  const nextSlide = () => {
    setActiveIndex((current) => (current + 1) % upcomingEvents.length)
  }

  const prevSlide = () => {
    setActiveIndex(
      (current) => (current - 1 + upcomingEvents.length) % upcomingEvents.length
    )
  }

  const goToSlide = (index) => {
    setActiveIndex(index)
  }

  // 自動輪播
  useEffect(() => {
    if (upcomingEvents.length <= 1) return // 只有一張或沒有時不輪播

    const timer = setInterval(nextSlide, 5000) // 每5秒切換一次
    return () => clearInterval(timer)
  }, [upcomingEvents.length])

  // 格式化時間顯示
  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    } catch (error) {
      console.error('Date formatting error:', error)
      return dateString
    }
  }

  // 計算距離報名開始還有多久
  const getTimeUntilStart = (startTime) => {
    const now = new Date()
    const start = new Date(startTime)
    const diffTime = start - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))

    if (diffDays > 1) {
      return `還有 ${diffDays} 天`
    } else if (diffHours > 0) {
      return `還有 ${diffHours} 小時`
    } else {
      return '即將開始'
    }
  }

  if (upcomingEvents.length === 0) {
    return null
  }

  return (
    <div className={styles.eventCarouselContainer}>
      <div className={styles.eventCarousel}>
        <div className={styles.carouselIndicators}>
          {upcomingEvents.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`${styles.indicatorButton} ${
                activeIndex === index ? styles.active : ''
              }`}
            />
          ))}
        </div>

        <div className={styles.carouselInner}>
          {upcomingEvents.map((event, index) => (
            <Link
              key={event.id}
              href={`/event/eventDetail/${event.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                className={`${styles.carouselItem} ${
                  activeIndex === index ? styles.active : ''
                }`}
                style={{ display: activeIndex === index ? 'block' : 'none' }}
                role="button"
                tabIndex={0}
              >
                <img
                  src={event.picture || '/images/event/default-event.jpg'}
                  alt={event.name}
                  onError={(e) => {
                    e.target.src = '/images/event/default-event.jpg'
                  }}
                />
                <div className={styles.carouselCaption}>
                  <h3>{event.name}</h3>
                  <p>
                    {event.type} · {event.platform} ·{' '}
                    {event.teamType === '個人' ? '個人賽' : '團體賽'}
                  </p>
                  <div className={styles.eventTime}>
                    報名開始時間：{formatDateTime(event.applyStartTime)}
                    <br />
                    <span className={styles.countdown}>
                      {getTimeUntilStart(event.applyStartTime)}
                    </span>
                  </div>
                  <div className={styles.eventStatus}>
                    <span className={styles['status-即將開始報名']}>
                      即將開始報名
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {upcomingEvents.length > 1 && (
          <>
            <button
              className={`${styles.carouselControl} ${styles.carouselControlPrev}`}
              onClick={(e) => {
                e.stopPropagation()
                prevSlide()
              }}
            >
              <span className={styles.carouselControlPrevIcon} />
              <span className={styles.visuallyHidden}>Previous</span>
            </button>
            <button
              className={`${styles.carouselControl} ${styles.carouselControlNext}`}
              onClick={(e) => {
                e.stopPropagation()
                nextSlide()
              }}
            >
              <span className={styles.carouselControlNextIcon} />
              <span className={styles.visuallyHidden}>Next</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default Carousel
