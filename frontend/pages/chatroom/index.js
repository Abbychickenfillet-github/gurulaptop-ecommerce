import { useState, useEffect, useCallback } from 'react'
import { Container } from 'react-bootstrap'
import { useRouter } from 'next/router'
import ChatRoom from '@/components/chatroom/ChatRoom'
import CreateRoomForm from '@/components/chatroom/CreateRoomForm'
import UserList from '@/components/chatroom/UserList'
import EventButton from '@/components/event/EventButton'
import websocketService from '@/services/websocketService'
import styles from '@/styles/Chat.module.css'
import { Send, Menu } from 'lucide-react'
import Swal from 'sweetalert2'
import Head from 'next/head'

export default function Chat() {
  const [users, setUsers] = useState([])
  const [rooms, setRooms] = useState([])
  const [currentRoom, setCurrentRoom] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:3005/api/auth/check', {
        credentials: 'include',
      })

      if (!response.ok) {
        router.push('/login')
        return
      }

      const userData = await response.json()
      if (userData.status === 'success' && userData.data.user) {
        const userId = userData.data.user.user_id
        setCurrentUser(userId)
        websocketService.connect(userId)
        await fetchInitialData(userId)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchInitialData = async (userId) => {
    try {
      const [groupsResponse, usersResponse] = await Promise.all([
        fetch('http://localhost:3005/api/chat/user/groups', {
          credentials: 'include',
        }),
        fetch('http://localhost:3005/api/chat/users', {
          credentials: 'include',
        }),
      ])

      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json()
        setRooms(groupsData.data || [])
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error)
    }
  }

  const handleRoomSelect = async (roomId) => {
    setCurrentRoom(roomId)
    setIsSidebarOpen(false)
    websocketService.send({
      type: 'joinRoom',
      roomID: roomId,
      fromID: currentUser,
    })
  }

  const handleLeaveRoom = useCallback(async () => {
    setCurrentRoom(null)
    await fetchInitialData(currentUser)
  }, [currentUser])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!message.trim() || !currentRoom) return

    websocketService.send({
      type: 'message',
      roomID: currentRoom,
      fromID: currentUser,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    })

    setMessage('')
  }

  const handlePrivateChat = (userId) => {
    console.log('Private chat with user:', userId)
    setIsSidebarOpen(false)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  if (isLoading) {
    return <div className={styles.loadingContainer}>載入中...</div>
  }

  return (
    <>
      <Head>
        <title>聊天室</title>
      </Head>
      <Container fluid className={styles.container}>
        <button onClick={toggleSidebar} className={styles.sidebarToggle}>
          <Menu size={24} />
        </button>

        <h3 className={styles.chatTitle}>
          聊天室
          {currentRoom &&
            rooms.find((r) => r.chatRoomId === currentRoom) &&
            ` - ${rooms.find((r) => r.chatRoomId === currentRoom).name}`}
        </h3>

        <div className={styles.chatLayout}>
          <div
            className={`${styles.userListOverlay} ${
              isSidebarOpen ? styles.open : ''
            }`}
            role="button"
            tabIndex={0}
            onClick={() => setIsSidebarOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setIsSidebarOpen(false)
              }
            }}
          />

          <div
            className={`${styles.userList} ${isSidebarOpen ? styles.open : ''}`}
          >
            <UserList
              users={users}
              rooms={rooms}
              currentUser={currentUser}
              currentRoom={currentRoom}
              onPrivateChat={handlePrivateChat}
              onRoomSelect={handleRoomSelect}
            />
          </div>

          <div className={styles.chatContent}>
            <ChatRoom
              currentUser={currentUser}
              currentRoom={currentRoom}
              onLeaveRoom={handleLeaveRoom}
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
              disabled={!currentRoom}
            />
            <EventButton
              type="submit"
              className={styles.sendButton}
              disabled={!currentRoom || !message.trim()}
            >
              <Send size={18} />
              <span>發送</span>
            </EventButton>
          </form>
        </div>

        <CreateRoomForm
          show={showCreateRoom}
          onHide={() => setShowCreateRoom(false)}
          currentUser={currentUser}
        />
      </Container>
    </>
  )
}
