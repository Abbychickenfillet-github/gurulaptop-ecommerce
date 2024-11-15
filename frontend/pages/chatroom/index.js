import { useState, useEffect } from 'react'
import { Container } from 'react-bootstrap'
import { useRouter } from 'next/router'
import ChatRoom from '@/components/chatroom/ChatRoom'
import CreateRoomForm from '@/components/chatroom/CreateRoomForm'
import UserList from '@/components/chatroom/UserList'
import EventButton from '@/components/event/EventButton'
import websocketService from '@/services/websocketService'
import styles from '@/styles/Chat.module.css'

export default function Chat() {
  const [users, setUsers] = useState([])
  const [rooms, setRooms] = useState([])
  const [messages, setMessages] = useState([])
  const [currentRoom, setCurrentRoom] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  // 身份驗證檢查
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3005/api/auth/check', {
          credentials: 'include',
        })

        if (!response.ok) {
          console.error('User not authenticated')
          router.push('/login')
          return
        }

        const userData = await response.json()
        console.log('User authentication:', userData)

        // 設置用戶ID並觸發數據加載
        if (userData.status === 'success' && userData.data.user) {
          const userId = userData.data.user.user_id
          setCurrentUser(userId)
          localStorage.setItem('userId', userId)
          // 初始化 WebSocket 連接
          initializeWebSocket(userId)
          // 加載初始數據
          fetchInitialData(userId)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  // 初始化 WebSocket 連接
  const initializeWebSocket = (userId) => {
    console.log('Initializing WebSocket with userId:', userId)
    if (!userId) {
      console.error('No user ID for WebSocket initialization')
      return
    }

    try {
      websocketService.connect(userId)

      // 註冊監聽器
      websocketService.on('registered', handleRegistered)
      websocketService.on('message', handleNewMessage)
      websocketService.on('roomCreated', handleRoomCreated)
      websocketService.on('userJoined', handleUserJoined)
      websocketService.on('userLeft', handleUserLeft)
    } catch (error) {
      console.error('WebSocket connection failed:', error)
    }
  }

  // 獲取初始數據
  const fetchInitialData = async (userId) => {
    if (!userId) {
      console.error('No user ID for fetching data')
      return
    }

    try {
      // 只獲取用戶群組，不需要獲取所有聊天室
      const groupsResponse = await fetch(
        'http://localhost:3005/api/chat/user/groups',
        {
          credentials: 'include',
        }
      )

      const groupsData = await groupsResponse.json()

      if (groupsData.status === 'success') {
        // 設置房間數據
        setRooms(
          groupsData.data.map((group) => ({
            id: group.chatRoomId,
            name: group.name,
            memberCount: group.memberCount,
            maxMembers: group.maxMembers,
            image: group.image,
            isGroup: true,
          }))
        )
      }
    } catch (error) {
      console.error('獲取初始數據失敗:', error)
    }
  }

  // WebSocket 事件處理函數
  const handleRegistered = (data) => {
    console.log('Registered event received:', data)
    if (data.rooms) {
      setRooms(data.rooms)
    }
  }

  const handleNewMessage = (data) => {
    console.log('New message received:', data)
    setMessages((prev) => [
      ...prev,
      {
        fromID: data.fromID,
        content: data.message,
        roomID: data.roomID,
        timestamp: new Date(),
        isPrivate: data.private,
      },
    ])
  }

  const handleRoomCreated = (data) => {
    console.log('Room created:', data)
    if (data.room) {
      setRooms((prev) => [...prev, data.room])
    }
  }

  const handleUserJoined = (data) => {
    console.log('User joined:', data)
    if (data.user) {
      setUsers((prev) => [...prev, data.user])
    }
  }

  const handleUserLeft = (data) => {
    console.log('User left:', data)
    if (data.userId) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === data.userId ? { ...user, online: false } : user
        )
      )
    }
  }

  // 用戶交互處理函數
  const handlePrivateChat = (userId) => {
    console.log('Opening private chat with user:', userId)
    setCurrentRoom(null)
    websocketService.send({
      type: 'openPrivateChat',
      targetUserId: userId,
      fromID: currentUser,
    })
  }

  const handleRoomSelect = async (roomId) => {
    console.log('Selecting room:', roomId)
    setCurrentRoom(roomId)

    if (roomId) {
      const selectedRoom = rooms.find((r) => r.id === roomId)
      console.log('Selected room:', selectedRoom)

      if (!selectedRoom) {
        console.error('Room not found:', roomId)
        return
      }

      // 加入聊天室
      websocketService.send({
        type: 'joinRoom',
        roomID: roomId,
        fromID: currentUser,
        isGroup: selectedRoom.isGroup,
        groupId: selectedRoom.groupId,
      })

      try {
        // 獲取訊息
        const endpoint = selectedRoom.isGroup
          ? `http://localhost:3005/api/chat/groups/${selectedRoom.groupId}/messages`
          : `http://localhost:3005/api/chat/rooms/${roomId}/messages`

        const response = await fetch(endpoint, {
          credentials: 'include',
        })
        const data = await response.json()

        if (data.status === 'success') {
          console.log('Messages loaded:', data.data)
          // 格式化訊息
          const formattedMessages = data.data.map((msg) => ({
            id: msg.id,
            fromID: msg.senderId || msg.sender_id,
            content: msg.content || msg.message,
            roomID: roomId,
            senderName: msg.senderName || msg.sender_name,
            timestamp: msg.createdAt || msg.created_at,
          }))
          setMessages(formattedMessages)
        }
      } catch (error) {
        console.error('載入訊息失敗:', error)
      }
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!message.trim()) return

    const selectedRoom = rooms.find((r) => r.id === currentRoom)
    console.log('Sending message:', { message, selectedRoom })

    websocketService.send({
      type: 'message',
      fromID: currentUser,
      message: message,
      roomID: currentRoom,
      isGroup: selectedRoom?.isGroup,
      groupId: selectedRoom?.groupId,
    })

    // 立即更新本地訊息
    setMessages((prev) => [
      ...prev,
      {
        fromID: currentUser,
        content: message,
        roomID: currentRoom,
        timestamp: new Date(),
        isGroup: selectedRoom?.isGroup,
      },
    ])

    setMessage('')
  }

  // 檢查當前用戶是否已設置
  if (!currentUser) {
    return <div>Loading...</div>
  }

  return (
    <Container fluid className={styles.container}>
      <h3 className={styles.chatTitle}>
        聊天室
        {currentRoom &&
          rooms.find((r) => r.id === currentRoom) &&
          ` - ${rooms.find((r) => r.id === currentRoom).name}`}
      </h3>

      <div className={styles.chatLayout}>
        <UserList
          users={users}
          rooms={rooms}
          currentUser={currentUser}
          currentRoom={currentRoom}
          onPrivateChat={handlePrivateChat}
          onRoomSelect={handleRoomSelect}
        />

        <div className={styles.chatContent}>
          <ChatRoom
            messages={messages}
            currentUser={currentUser}
            currentRoom={currentRoom}
          />
        </div>
      </div>

      <div className={styles.inputArea}>
        <form onSubmit={handleSendMessage} className={styles.inputForm}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="輸入訊息..."
            className={styles.messageInput}
          />
          <EventButton type="submit" className={styles.sendButton}>
            發送
          </EventButton>
        </form>
      </div>

      <CreateRoomForm
        show={showCreateRoom}
        onHide={() => setShowCreateRoom(false)}
        currentUser={currentUser}
      />
    </Container>
  )
}
