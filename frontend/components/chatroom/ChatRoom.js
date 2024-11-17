import { useRef, useEffect, useState, useCallback } from 'react'
import styles from '@/styles/Chat.module.css'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import Image from 'next/image'
import { MoveDown } from 'lucide-react'
import websocketService from '@/services/websocketService'

export default function ChatRoom({ currentUser, currentRoom }) {
  const [messages, setMessages] = useState([])
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const messagesEndRef = useRef(null)
  const messageListRef = useRef(null)
  const defaultAvatar = 'http://localhost:3005/uploads/default-avatar.png'

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      const behavior = shouldAutoScroll ? 'smooth' : 'auto'
      const options = {
        top: messagesEndRef.current.offsetTop,
        behavior,
      }
      messageListRef.current?.scrollTo(options)
    }
  }, [shouldAutoScroll])

  const handleScroll = useCallback((e) => {
    const element = e.target
    const { scrollTop, scrollHeight, clientHeight } = element
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
    setShouldAutoScroll(isAtBottom)
    setShowScrollButton(!isAtBottom)
  }, [])

  const handleNewMessage = useCallback(
    (data) => {
      console.log('New message received:', data)
      if (data.room_id === currentRoom || data.roomId === currentRoom) {
        setMessages((prev) => {
          const messageExists = prev.some(
            (msg) =>
              msg.id === data.id ||
              (msg.created_at === data.created_at &&
                msg.sender_id === data.sender_id)
          )

          if (messageExists) return prev

          const newMessages = [...prev, data].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          )

          return newMessages.filter(
            (msg, index, self) =>
              index ===
              self.findIndex(
                (m) =>
                  m.id === msg.id ||
                  (m.created_at === msg.created_at &&
                    m.sender_id === msg.sender_id)
              )
          )
        })
        if (shouldAutoScroll) {
          scrollToBottom()
        }
      }
    },
    [currentRoom, shouldAutoScroll, scrollToBottom]
  )

  const handleSystemMessage = useCallback(
    (data) => {
      console.log('System message received:', data)
      if (data.room_id === currentRoom || data.roomId === currentRoom) {
        setMessages((prev) => {
          const exists = prev.some(
            (msg) =>
              msg.id === data.id ||
              (msg.content === data.content &&
                msg.created_at === data.created_at)
          )

          if (exists) return prev

          return [
            ...prev,
            {
              ...data,
              id: data.id || `system-${Date.now()}`,
              isSystem: true,
              created_at: data.created_at || new Date().toISOString(),
            },
          ]
        })
        scrollToBottom()
      }
    },
    [currentRoom, scrollToBottom]
  )

  const handleRoomJoined = useCallback(
    (data) => {
      console.log('Room joined:', data)
      if (data.roomId === currentRoom && Array.isArray(data.messages)) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((msg) => msg.id))
          const newMessages = data.messages
            .filter((msg) => !existingIds.has(msg.id))
            .map((msg) => ({
              ...msg,
              isSystem: msg.is_system,
              content: msg.content || msg.message,
            }))

          return [...prev, ...newMessages].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          )
        })
        scrollToBottom()
      }
    },
    [currentRoom, scrollToBottom]
  )

  const handleMemberUpdate = useCallback(
    (data) => {
      console.log('Member update:', data)
      if (data.roomId === currentRoom) {
        setMessages((prev) => [
          ...prev,
          {
            id: `system-${Date.now()}`,
            type: 'system',
            content: data.content || data.message,
            created_at: data.timestamp,
            isSystem: true,
          },
        ])
        scrollToBottom()
      }
    },
    [currentRoom, scrollToBottom]
  )

  useEffect(() => {
    const messageList = messageListRef.current
    if (messageList) {
      messageList.addEventListener('scroll', handleScroll)
      return () => messageList.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  useEffect(() => {
    if (currentUser) {
      websocketService.connect(currentUser)
    }

    if (currentRoom) {
      console.log('Joining room:', currentRoom)
      // 清空舊消息
      setMessages([])

      websocketService.send({
        type: 'joinRoom',
        roomID: currentRoom,
        fromID: currentUser,
      })
    }

    // 註冊所有事件監聽器
    websocketService.on('message', handleNewMessage)
    websocketService.on('system', handleSystemMessage)
    websocketService.on('roomJoined', handleRoomJoined)
    websocketService.on('memberJoined', handleMemberUpdate)
    websocketService.on('memberLeft', handleMemberUpdate)

    return () => {
      if (currentRoom) {
        websocketService.send({
          type: 'leaveRoom',
          roomID: currentRoom,
          fromID: currentUser,
        })
      }

      // 移除所有事件監聽器
      websocketService.off('message', handleNewMessage)
      websocketService.off('system', handleSystemMessage)
      websocketService.off('roomJoined', handleRoomJoined)
      websocketService.off('memberJoined', handleMemberUpdate)
      websocketService.off('memberLeft', handleMemberUpdate)
    }
  }, [
    currentUser,
    currentRoom,
    handleNewMessage,
    handleSystemMessage,
    handleRoomJoined,
    handleMemberUpdate,
  ])

  const renderMessage = (msg) => {
    const isOwnMessage = msg.sender_id === currentUser

    if (msg.isSystem || msg.type === 'system') {
      return (
        <div className={styles.systemMessage}>{msg.content || msg.message}</div>
      )
    }

    return (
      <div
        className={`${styles.messageContainer} ${
          isOwnMessage ? styles.ownMessage : ''
        }`}
      >
        {!isOwnMessage && (
          <div className={styles.senderInfo}>
            <div className={styles.avatarWrapper}>
              <Image
                src={msg.sender_image || defaultAvatar}
                alt={msg.sender_name || '未知用戶'}
                width={32}
                height={32}
                className={styles.avatarImage}
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = defaultAvatar
                }}
              />
            </div>
            <span className={styles.senderName}>
              {msg.sender_name || '未知用戶'}
            </span>
          </div>
        )}
        <div className={styles.messageContent}>
          <div className={styles.messageText}>{msg.message}</div>
          <div className={styles.messageTime}>
            {format(new Date(msg.created_at), 'HH:mm', {
              locale: zhTW,
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.chatContainer}>
      <div
        className={styles.messagesContainer}
        ref={messageListRef}
        onScroll={handleScroll}
      >
        {messages.map((msg) => {
          const messageKey = msg.id
            ? `msg-${msg.id}`
            : `${msg.isSystem ? 'system' : 'msg'}-${msg.created_at}-${
                msg.sender_id || 'system'
              }`

          return (
            <div key={messageKey} className={styles.messageWrapper}>
              {renderMessage(msg)}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <button
          className={styles.scrollToBottomButton}
          onClick={() => {
            setShouldAutoScroll(true)
            scrollToBottom()
          }}
          aria-label="滾動到底部"
        >
          <MoveDown size={20} />
        </button>
      )}
    </div>
  )
}
