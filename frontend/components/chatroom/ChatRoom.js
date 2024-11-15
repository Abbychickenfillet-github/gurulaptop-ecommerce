import { useState } from 'react'
import styles from '@/styles/Chat.module.css'
import websocketService from '@/services/websocketService'

export default function ChatRoom({ messages, currentUser, currentRoom }) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!message.trim()) return

    websocketService.send({
      type: 'message',
      fromID: currentUser,
      message: message,
      roomID: currentRoom,
    })

    setMessage('')
  }

  const renderMessage = (msg) => {
    // 判斷是否為群組申請相關訊息
    if (msg.type === 'group_request') {
      return (
        <div className={styles.systemMessage}>
          <span>
            {msg.fromID === currentUser ? '您' : msg.senderName} 發送了入團申請
          </span>
          <div className={styles.requestContent}>
            <p>遊戲ID: {msg.gameId}</p>
            <p>{msg.description}</p>
          </div>
        </div>
      )
    }

    if (msg.type === 'group_request_response') {
      return (
        <div className={styles.systemMessage}>
          <span>
            您的入團申請已{msg.status === 'accepted' ? '被接受' : '被拒絕'}
          </span>
        </div>
      )
    }

    // 一般聊天訊息
    return (
      <div
        className={`${styles.messageItem} ${
          msg.fromID === currentUser ? styles.own : ''
        }`}
      >
        <div className={styles.messageContent}>
          <div className={styles.messageHeader}>
            {msg.fromID === currentUser ? '你' : msg.senderName || msg.fromID}
          </div>
          <div className={styles.messageText}>{msg.content}</div>
          <div className={styles.messageTime}>
            {new Date(msg.timestamp).toLocaleString()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messagesContainer}>
        {messages
          .filter((msg) => msg.roomID === currentRoom)
          .map((msg, index) => (
            <div key={msg.id || index}>{renderMessage(msg)}</div>
          ))}
      </div>
    </div>
  )
}
