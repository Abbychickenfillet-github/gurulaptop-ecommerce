import React, { useState, useEffect } from 'react'
import styles from './GroupRequestList.module.css'
import { useGroupAuth } from '@/context/GroupAuthContext'
import websocketService from '../../services/websocketService'

const GroupRequestList = ({ groupId }) => {
  const { user } = useGroupAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadRequests()
    setupWebSocket()
  }, [groupId])

  const loadRequests = async () => {
    try {
      const response = await fetch(
        `http://localhost:3005/api/group/requests/${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('載入申請列表失敗')
      }

      const data = await response.json()
      setRequests(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const setupWebSocket = () => {
    // 監聽新的群組申請
    websocketService.on('groupRequestReceived', (data) => {
      if (data.groupId === groupId) {
        setRequests((prev) => [data, ...prev])
      }
    })
  }

  const handleRequest = async (requestId, status) => {
    try {
      const response = await fetch(
        `http://localhost:3005/api/group/requests/${requestId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ status }),
        }
      )

      if (!response.ok) {
        throw new Error('處理申請失敗')
      }

      // 發送 WebSocket 通知
      websocketService.send({
        type: 'groupRequestResponse',
        requestId,
        status,
        fromID: user.user_id,
      })

      // 更新本地狀態
      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, status } : req))
      )
    } catch (err) {
      console.error('Error:', err)
      alert(err.message)
    }
  }

  if (loading) return <div>載入中...</div>
  if (error) return <div className={styles.error}>{error}</div>

  return (
    <div className={styles.requestList}>
      <h3>入團申請列表</h3>
      {requests.length === 0 ? (
        <p>目前沒有待處理的申請</p>
      ) : (
        requests.map((request) => (
          <div key={request.id} className={styles.requestItem}>
            <div className={styles.userInfo}>
              <img
                src={request.sender_image || '/default-avatar.png'}
                alt={request.sender_name}
                className={styles.avatar}
              />
              <div className={styles.details}>
                <h4>{request.sender_name}</h4>
                <p className={styles.gameId}>遊戲ID: {request.game_id}</p>
                <p className={styles.description}>{request.description}</p>
              </div>
            </div>

            {request.status === 'pending' && (
              <div className={styles.actions}>
                <button
                  onClick={() => handleRequest(request.id, 'accepted')}
                  className={styles.acceptButton}
                >
                  接受
                </button>
                <button
                  onClick={() => handleRequest(request.id, 'rejected')}
                  className={styles.rejectButton}
                >
                  拒絕
                </button>
              </div>
            )}

            {request.status !== 'pending' && (
              <div className={`${styles.status} ${styles[request.status]}`}>
                {request.status === 'accepted' ? '已接受' : '已拒絕'}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default GroupRequestList
