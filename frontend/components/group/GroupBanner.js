import { useState, useEffect } from 'react'
import styles from './GroupBanner.module.css'
import EventButton from '../event/EventButton'

export default function GroupBanner({ groupData, onOpenDetail, onOpenJoin }) {
  const [timeAgo, setTimeAgo] = useState('')

  useEffect(() => {
    calculateTimeAgo()
  }, [groupData])

  const calculateTimeAgo = () => {
    const createDate = new Date(groupData.createTime)
    const now = new Date()
    const diffMs = now - createDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      setTimeAgo(`${diffDays}天前發起揪團`)
    } else if (diffHours > 0) {
      setTimeAgo(`${diffHours}小時前發起揪團`)
    } else if (diffMins > 0) {
      setTimeAgo(`${diffMins}分鐘前發起揪團`)
    } else {
      setTimeAgo('剛剛發起揪團')
    }
  }

  // 處理圖片路徑
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'http://localhost:3005/uploads/groups/group-default.png' // 改成 .png
    }
    return `http://localhost:3005${imagePath}`
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.banner}>
        <div className={styles.content}>
          <img
            src={getImageUrl(groupData.image)}
            alt="遊戲圖片"
            className={styles.image}
            onError={(e) => {
              e.target.src =
                'http://localhost:3005/uploads/groups/group-default.png' // 改成 .png
            }}
          />
          <div className={styles.text}>
            <div className={styles.title}>{groupData.title}</div>
            <div className={styles.subtitle}>
              <span>{groupData.creatorName}</span>
              <span className="mx-2">|</span>
              <span>{timeAgo}</span>
            </div>
          </div>
          <div className={styles.actions}>
            <EventButton onClick={onOpenDetail}>詳情</EventButton>
            <EventButton onClick={onOpenJoin}>申請</EventButton>
          </div>
        </div>
      </div>
    </div>
  )
}
