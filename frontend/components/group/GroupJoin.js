import React, { useState, useEffect } from 'react'
import styles from './GroupJoin.module.css'
import { X, User, MessageSquare } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import websocketService from '../../services/websocketService'

const GroupJoin = ({ onClose, groupData }) => {
  const { auth } = useAuth()
  const [formData, setFormData] = useState({
    gameId: '',
    description: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (auth.isAuth) {
      websocketService.connect(auth.user_id)
    }
  }, [auth.isAuth])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!auth.isAuth) {
      setError('請先登入')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('http://localhost:3005/api/group/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          groupId: groupData.group_id,
          gameId: formData.gameId, // 這將被用於系統訊息
          description: formData.description,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '申請發送失敗')
      }

      websocketService.send({
        type: 'groupRequest',
        fromID: auth.user_id,
        groupId: groupData.group_id,
        gameId: formData.gameId, // 確保傳送 gameId
        description: formData.description,
      })

      onClose()
      alert('申請已成功送出！')
    } catch (err) {
      console.error('Error:', err)
      setError(err.message || '申請發送失敗，請稍後再試')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className={styles.modalBackdrop}
      role="button"
      tabIndex={0}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClose()}
    >
      <div className={styles.customModal}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="關閉視窗"
        >
          <X size={24} />
        </button>

        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>申請加入揪團</h2>
          <h3 className={styles.eventTitle}>{groupData.group_name}</h3>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.formSection}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <User size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  name="gameId"
                  value={formData.gameId}
                  onChange={handleChange}
                  placeholder="遊戲ID"
                  className={styles.input}
                  required
                  disabled={isSubmitting}
                />
              </label>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <MessageSquare size={16} className={styles.inputIcon} />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="自我介紹"
                  className={styles.textarea}
                  rows={4}
                  required
                  disabled={isSubmitting}
                />
              </label>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? '處理中...' : '送出申請'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default GroupJoin
