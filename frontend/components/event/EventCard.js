import { MdDateRange } from 'react-icons/md'
import { IoAccessibility } from 'react-icons/io5'
import { FaFire } from 'react-icons/fa'
import EventButton from './EventButton'
import Link from 'next/link'
import styles from './EventCard.module.css'

export default function EventCard({
  id,
  name,
  type,
  picture,
  eventStartTime,
  teamType,
  maxPeople,
  currentParticipants = 0,
  status,
}) {
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = dateString.split('T')[0]
      const [year, month, day] = date.split('-')
      return `${year}/${month}/${day}`
    } catch (error) {
      console.error('Date formatting error:', error)
      return dateString
    }
  }

  // 取得活動狀態標籤的樣式
  const getStatusStyle = (status) => {
    switch (status) {
      case '報名中':
        return 'bg-success'
      case '進行中':
        return 'bg-primary'
      case '即將開始報名':
        return 'bg-info'
      case '已結束':
        return 'bg-secondary'
      default:
        return 'bg-info'
    }
  }

  // 格式化參與人數顯示
  const formatParticipants = (currentParticipants, maxPeople, teamType) => {
    if (!maxPeople) return '未設定'
    const currentNum = Number(currentParticipants) || 0
    const maxNum = Number(maxPeople) || 0
    const unit = teamType === '個人' ? '人' : '隊'
    return `${currentNum}/${maxNum}${unit}`
  }

  // 格式化參賽方式顯示
  const getTeamTypeDisplay = (teamType) => {
    return teamType === '個人' ? '個人賽' : '團體賽'
  }

  return (
    <div className={styles.cardWrapper}>
      <div className={styles.card}>
        <div className={styles.cardImgWrapper}>
          <img
            src={picture || '/images/event-default.png'}
            className={styles.cardImg}
            alt={name || '活動圖片'}
            onError={(e) => {
              e.target.src = '/images/event-default.png'
            }}
          />
          <span
            className={`position-absolute top-0 end-0 m-2 badge ${getStatusStyle(
              status
            )}`}
            style={{ zIndex: 3 }}
          >
            {status || '未定義'}
          </span>
        </div>
        <div className={styles.cardBody}>
          <h5 className={styles.cardTitle}>{name || '活動名稱未設定'}</h5>
          <div className={styles.infoGroup}>
            <div className={styles.infoItem}>
              <MdDateRange className={styles.smallIcon} />
              <small>{formatDate(eventStartTime) || '日期未設定'}</small>
            </div>
            <div className={styles.infoItem}>
              <IoAccessibility className={styles.smallIcon} />
              <small>{getTeamTypeDisplay(teamType)}</small>
            </div>
            <div className={styles.infoItem}>
              <FaFire className={styles.smallIcon} />
              <small>
                {formatParticipants(currentParticipants, maxPeople, teamType)}
              </small>
            </div>
          </div>
          <div className={styles.buttonContainer}>
            <Link
              href={`/event/eventDetail/${id}`}
              style={{ textDecoration: 'none' }}
            >
              <EventButton>活動詳情</EventButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
