import React, { useState, useEffect } from 'react'
import styles from './GroupJoin.module.css'
import { X, User, MessageSquare } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import websocketService from '../../services/websocketService'
import Swal from 'sweetalert2'

const GroupJoin = ({ onClose, groupData }) => {
  const { auth } = useAuth()
  const [formData, setFormData] = useState({
    gameId: '',
    description: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!auth.isAuth) {
      await Swal.fire({
        icon: 'warning',
        title: '無法申請',
        text: '請先登入',
        showConfirmButton: false,
        timer: 1500,
      })
      return
    }

    // 確認提交
    const confirmResult = await Swal.fire({
      icon: 'question',
      title: '確認送出',
      text: '確定要送出申請嗎？',
      showCancelButton: true,
      confirmButtonText: '確定',
      cancelButtonText: '取消',
    })

    if (!confirmResult.isConfirmed) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('http://localhost:3005/api/group/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          groupId: groupData.group_id,
          gameId: formData.gameId,
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
        gameId: formData.gameId,
        description: formData.description,
      })

      await Swal.fire({
        icon: 'success',
        title: '申請已送出！',
        text: '等待群組管理員審核',
        showConfirmButton: false,
        timer: 1500,
      })

      onClose()
    } catch (err) {
      console.error('Error:', err)
      await Swal.fire({
        icon: 'error',
        title: '送出失敗',
        text: err.message || '申請發送失敗，請稍後再試',
        showConfirmButton: false,
        timer: 2000,
      })
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
