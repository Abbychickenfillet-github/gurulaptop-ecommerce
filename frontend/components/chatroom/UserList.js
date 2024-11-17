import { useState, useEffect } from 'react'
import styles from '@/styles/Chat.module.css'
import { Nav, ListGroup } from 'react-bootstrap'
import Image from 'next/image'
import websocketService from '@/services/websocketService'
import { getGroupImage } from '@/utils/imageUtils'

export default function UserList({
  users,
  rooms,
  currentUser,
  currentRoom,
  onPrivateChat,
  onRoomSelect,
}) {
  const [showTab, setShowTab] = useState('private')
  const [myPrivateChats, setMyPrivateChats] = useState([])
  const [myGroups, setMyGroups] = useState([])
  const [requests, setRequests] = useState([])
  const [requestHistory, setRequestHistory] = useState([])

  useEffect(() => {
    if (currentUser) {
      fetchInitialData()
      setupWebSocket()
    }
  }, [currentUser])

  const fetchInitialData = async () => {
    try {
      // 獲取待處理申請
      const pendingResponse = await fetch(
        'http://localhost:3005/api/chat/requests/pending',
        {
          credentials: 'include',
        }
      )
      const pendingData = await pendingResponse.json()
      if (pendingData.status === 'success') {
        setRequests(pendingData.data)
      }

      // 獲取申請歷史
      const historyResponse = await fetch(
        'http://localhost:3005/api/chat/requests/history',
        {
          credentials: 'include',
        }
      )
      const historyData = await historyResponse.json()
      if (historyData.status === 'success') {
        setRequestHistory(historyData.data)
      }

      // 獲取私人聊天記錄
      const chatsResponse = await fetch(
        'http://localhost:3005/api/chat/messages/private',
        {
          credentials: 'include',
        }
      )
      if (chatsResponse.ok) {
        const chatsData = await chatsResponse.json()
        if (chatsData.status === 'success') {
          const chatUsers = new Set()
          chatsData.data.forEach((msg) => {
            if (msg.sender_id === currentUser) {
              chatUsers.add(msg.recipient_id)
            } else if (msg.recipient_id === currentUser) {
              chatUsers.add(msg.sender_id)
            }
          })

          const activeUsers = users.filter((user) =>
            chatUsers.has(user.user_id)
          )
          setMyPrivateChats(activeUsers)
        }
      }

      // 獲取群組
      const groupsResponse = await fetch(
        'http://localhost:3005/api/chat/user/groups',
        {
          credentials: 'include',
        }
      )
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json()
        if (groupsData.status === 'success') {
          setMyGroups(groupsData.data)
        }
      }
    } catch (error) {
      console.error('獲取資料失敗:', error)
    }
  }

  const setupWebSocket = () => {
    // 監聽新的群組申請
    websocketService.on('newGroupRequest', (data) => {
      console.log('收到新群組申請:', data)
      setRequests((prev) => [
        ...prev,
        {
          id: data.requestId,
          sender_id: data.fromUser,
          game_id: data.gameId,
          description: data.description,
          status: 'pending',
        },
      ])
      websocketService.on('groupMemberUpdate', (data) => {
        console.log('群組成員更新:', data)
        // 重新獲取群組資料
        fetchInitialData()
      })
    })

    // 監聽申請結果
    websocketService.on('groupRequestResult', (data) => {
      console.log('收到申請結果:', data)
      setRequests((prev) =>
        prev.map((req) =>
          req.id === data.requestId ? { ...req, status: data.status } : req
        )
      )
    })
  }

  const handleRequest = async (requestId, status) => {
    try {
      const response = await fetch(
        `http://localhost:3005/api/chat/requests/${requestId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ status }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '處理申請失敗')
      }

      const data = await response.json()

      if (data.status === 'success') {
        setRequests((prev) =>
          prev.map((req) => (req.id === requestId ? { ...req, status } : req))
        )

        websocketService.send({
          type: 'groupRequestResponse',
          requestId,
          status,
          fromID: currentUser,
        })

        // 重新獲取申請列表
        fetchInitialData()
      }
    } catch (error) {
      console.error('處理申請失敗:', error)
      alert(error.message || '處理申請失敗，請稍後再試')
    }
  }

  return (
    <div className={styles.userList}>
      <div className={styles.userListHeader}>
        <h4>聊天列表</h4>
      </div>

      <Nav variant="tabs" className={styles.chatTabs}>
        <Nav.Item>
          <Nav.Link
            className={styles.chatTab}
            active={showTab === 'private'}
            onClick={() => setShowTab('private')}
          >
            私人訊息
            {requests.filter((r) => r.status === 'pending').length > 0 && (
              <span className={styles.badge}>
                {requests.filter((r) => r.status === 'pending').length}
              </span>
            )}
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            className={styles.chatTab}
            active={showTab === 'group'}
            onClick={() => setShowTab('group')}
          >
            群組訊息
          </Nav.Link>
        </Nav.Item>
      </Nav>
      <div
        className={styles.userListContent}
        style={{
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto',
        }}
      >
        {showTab === 'private' && (
          <>
            {requests.filter((r) => r.status === 'pending').length > 0 && (
              <div className={styles.requestsList}>
                <h5 className={styles.requestsTitle}>待處理申請</h5>
                {requests
                  .filter((request) => request.status === 'pending')
                  .map((request) => (
                    <div
                      key={`request-${request.id}`}
                      className={styles.requestItem}
                    >
                      <p>申請者：{request.sender_name || '未知用戶'}</p>
                      <p>遊戲ID：{request.game_id}</p>
                      <p>自我介紹：{request.description}</p>
                      <div className={styles.requestActions}>
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
                    </div>
                  ))}
              </div>
            )}

            <div className={styles.listSection}>
              {myPrivateChats.length > 0 ? (
                <ListGroup>
                  {myPrivateChats.map((user) => (
                    <ListGroup.Item
                      key={`private-${user.user_id}`}
                      action
                      onClick={() => onPrivateChat(user.user_id)}
                      className={styles.userItem}
                    >
                      <div className={styles.userAvatar}>
                        {user.image_path ? (
                          <Image
                            src={user.image_path}
                            alt={user.name}
                            width={24}
                            height={24}
                            className={styles.userImage}
                            onError={(e) => {
                              console.log('圖片載入失敗:', user.image_path)
                              e.target.onerror = null
                              e.target.src =
                                'http://localhost:3005/uploads/groups/group-default.png'
                            }}
                          />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            {user.name?.[0] || '?'}
                          </div>
                        )}
                      </div>
                      <div className={styles.userInfo}>
                        <div className={styles.userName}>
                          {user.name || '未命名用戶'}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className={styles.emptyList}>目前沒有進行中的對話</div>
              )}
            </div>
          </>
        )}

        {showTab === 'group' && (
          <div className={styles.listSection}>
            {myGroups.length > 0 ? (
              <ListGroup>
                {myGroups.map((group) => (
                  <ListGroup.Item
                    key={`group-${group.chatRoomId || group.id}`}
                    action
                    active={currentRoom === group.chatRoomId}
                    onClick={() => onRoomSelect(group.chatRoomId)}
                    className={styles.roomItem}
                  >
                    <div className={styles.roomAvatar}>
                      {group.group_img ? (
                        <Image
                          src={getGroupImage(group.group_img)}
                          alt={group.name}
                          width={24}
                          height={24}
                          className={styles.roomImage}
                          onError={(e) => {
                            console.log('圖片載入失敗:', group.group_img)
                            e.target.onerror = null
                            e.target.src =
                              'http://localhost:3005/uploads/groups/group-default.png'
                          }}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {group.name?.[0] || 'G'}
                        </div>
                      )}
                    </div>
                    <div className={styles.roomInfo}>
                      <div className={styles.roomName}>{group.name}</div>
                      <div className={styles.roomMembers}>
                        {group.memberCount}/{group.maxMembers} 位成員
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <div className={styles.emptyList}>您目前沒有參與任何群組</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
