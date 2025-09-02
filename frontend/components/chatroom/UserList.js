import { useState, useEffect } from 'react'
import styles from '@/styles/Chat.module.css'
import requestStyles from '@/components/group/GroupRequestList.module.css'
import { ListGroup } from 'react-bootstrap'
import Image from 'next/image'
import websocketService from '@/services/websocketService'
import { getGroupImage } from '@/utils/imageUtils'
import Swal from 'sweetalert2'

export default function UserList({
  users,
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
  }, [currentUser, fetchInitialData, setupWebSocket])

  const fetchInitialData = async () => {
    try {
      const [pendingResponse, historyResponse, chatsResponse, groupsResponse] =
        await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/requests/pending`,
            {
              credentials: 'include',
            },
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/requests/history`,
            {
              credentials: 'include',
            },
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/messages/private`,
            {
              credentials: 'include',
            },
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/user/groups`,
            {
              credentials: 'include',
            },
          ),
        ])

      const [pendingData, historyData, chatsData, groupsData] =
        await Promise.all([
          pendingResponse.json(),
          historyResponse.json(),
          chatsResponse.json(),
          groupsResponse.json(),
        ])

      if (pendingData.status === 'success') {
        setRequests(pendingData.data)
      }

      if (historyData.status === 'success') {
        setRequestHistory(historyData.data)
      }

      if (chatsData.status === 'success') {
        const chatUsers = new Set()
        chatsData.data.forEach((msg) => {
          if (msg.sender_id === currentUser) {
            chatUsers.add(msg.recipient_id)
          } else if (msg.recipient_id === currentUser) {
            chatUsers.add(msg.sender_id)
          }
        })

        const activeUsers = users.filter((user) => chatUsers.has(user.user_id))
        setMyPrivateChats(activeUsers)
      }

      if (groupsData.status === 'success') {
        setMyGroups(groupsData.data)
      }
    } catch (error) {
      console.error('獲取資料失敗:', error)
      await Swal.fire({
        icon: 'error',
        title: '載入失敗',
        text: '無法取得聊天資料，請重新整理頁面',
        showConfirmButton: false,
        timer: 2000,
      })
    }
  }

  const setupWebSocket = () => {
    websocketService.on('newGroupRequest', (data) => {
      console.log('收到新群組申請:', data)
      setRequests((prev) => [
        ...prev,
        {
          id: data.requestId,
          sender_id: data.fromUser,
          sender_name: data.senderName,
          game_id: data.gameId,
          description: data.description,
          group_name: data.groupName,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
    })

    websocketService.on('groupRequestResult', (data) => {
      console.log('收到申請結果:', data)
      setRequests((prev) =>
        prev.map((req) =>
          req.id === data.requestId ? { ...req, status: data.status } : req,
        ),
      )
      fetchInitialData()
    })

    websocketService.on('groupMemberUpdate', () => {
      console.log('群組成員更新')
      fetchInitialData()
    })
  }

  const handleRequest = async (requestId, status) => {
    // 顯示確認對話框
    const confirmResult = await Swal.fire({
      icon: 'question',
      title: '確認操作',
      text:
        status === 'accepted' ? '確定要接受此申請嗎？' : '確定要拒絕此申請嗎？',
      showCancelButton: true,
      confirmButtonText: '確定',
      cancelButtonText: '取消',
    })

    if (!confirmResult.isConfirmed) {
      return
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/requests/${requestId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ status }),
        },
      )

      /*
       * 🔧 修復說明：
       *
       * ❌ 原本錯誤的地方：
       * - 第 155 行：`process.env.NEXT_PUBLIC_API_BASE_URL/api/chat/requests/${requestId}`
       * - 缺少 ${} 語法來正確引用環境變數
       *
       * ✅ 修復後的寫法：
       * - 第 155 行：`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/requests/${requestId}`
       * - 使用 ${} 語法正確引用環境變數
       *
       * 💡 為什麼會錯：
       * - 沒有 ${} 的話，JavaScript 會將 process.env.NEXT_PUBLIC_API_BASE_URL 當作字串字面量
       * - 最終 URL 會變成：process.env.NEXT_PUBLIC_API_BASE_URL/api/chat/requests/123
       * - 這會導致 404 錯誤，因為沒有這樣的 URL
       */

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '處理申請失敗')
      }

      const data = await response.json()

      if (data.status === 'success') {
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId
              ? { ...req, status, updated_at: new Date() }
              : req,
          ),
        )

        websocketService.send({
          type: 'groupRequestResponse',
          requestId,
          status,
          fromID: currentUser,
          timestamp: new Date().toISOString(),
        })

        fetchInitialData()

        // 顯示成功提示
        await Swal.fire({
          icon: 'success',
          title: '處理完成',
          text: status === 'accepted' ? '已接受申請' : '已拒絕申請',
          showConfirmButton: false,
          timer: 1500,
        })
      }
    } catch (error) {
      console.error('處理申請失敗:', error)
      await Swal.fire({
        icon: 'error',
        title: '處理失敗',
        text: error.message || '處理申請失敗，請稍後再試',
        showConfirmButton: false,
        timer: 2000,
      })
    }
  }

  return (
    <div className={styles.userList}>
      <div className={styles.userListHeader}>
        <h4>聊天列表</h4>
      </div>

      <div className={styles.chatTabs}>
        <button
          className={`${styles.chatTab} ${
            showTab === 'private' ? styles.active : ''
          }`}
          onClick={() => setShowTab('private')}
        >
          私人訊息
          {requests.filter((r) => r.status === 'pending').length > 0 && (
            <span className={styles.badge}>
              {requests.filter((r) => r.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          className={`${styles.chatTab} ${
            showTab === 'group' ? styles.active : ''
          }`}
          onClick={() => setShowTab('group')}
        >
          群組訊息
        </button>
      </div>

      <div className={styles.userListContent}>
        {showTab === 'private' && (
          <>
            {requests.filter((r) => r.status === 'pending').length > 0 && (
              <div className={requestStyles.requestsList}>
                <h5 className={requestStyles.requestsTitle}>待處理申請</h5>
                {requests
                  .filter((request) => request.status === 'pending')
                  .map((request) => (
                    <div
                      key={`request-${request.id}`}
                      className={requestStyles.requestItem}
                    >
                      <div className={requestStyles.userInfo}>
                        <div className={requestStyles.avatar}>
                          {request.sender_image ? (
                            <Image
                              src={request.sender_image}
                              alt={request.sender_name}
                              width={48}
                              height={48}
                              className={requestStyles.avatarImage}
                            />
                          ) : (
                            <div className={requestStyles.avatarPlaceholder}>
                              {request.sender_name?.[0] || '?'}
                            </div>
                          )}
                        </div>
                        <div className={requestStyles.details}>
                          <h4>{request.sender_name || '未知用戶'}</h4>
                          <p className={requestStyles.gameId}>
                            遊戲ID: {request.game_id}
                          </p>
                          <p className={requestStyles.description}>
                            {request.description}
                          </p>
                        </div>
                      </div>
                      <div className={requestStyles.actions}>
                        <button
                          onClick={() => handleRequest(request.id, 'accepted')}
                          className={requestStyles.acceptButton}
                        >
                          接受
                        </button>
                        <button
                          onClick={() => handleRequest(request.id, 'rejected')}
                          className={requestStyles.rejectButton}
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
                              e.target.onerror = null
                              e.target.src = `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/default-avatar.png`
                            }}

                            /*
                             * 🔧 修復說明：
                             *
                             * ❌ 原本錯誤的地方：
                             * - 第 322 行：'process.env.NEXT_PUBLIC_API_BASE_URL/uploads/default-avatar.png'
                             * - 缺少 ${} 語法來正確引用環境變數
                             *
                             * ✅ 修復後的寫法：
                             * - 第 322 行：`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/default-avatar.png`
                             * - 使用 ${} 語法正確引用環境變數
                             *
                             * 💡 為什麼會錯：
                             * - 沒有 ${} 的話，JavaScript 會將 process.env.NEXT_PUBLIC_API_BASE_URL 當作字串字面量
                             * - 最終圖片 URL 會變成：process.env.NEXT_PUBLIC_API_BASE_URL/uploads/default-avatar.png
                             * - 這會導致圖片載入失敗，顯示破圖
                             */
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
                            e.target.onerror = null
                            e.target.src = `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/groups/group-default.png`
                          }}

                          /*
                           * 🔧 修復說明：
                           *
                           * ❌ 原本錯誤的地方：
                           * - 第 369 行：'process.env.NEXT_PUBLIC_API_BASE_URL/uploads/groups/group-default.png'
                           * - 缺少 ${} 語法來正確引用環境變數
                           *
                           * ✅ 修復後的寫法：
                           * - 第 369 行：`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/groups/group-default.png`
                           * - 使用 ${} 語法正確引用環境變數
                           *
                           * 💡 為什麼會錯：
                           * - 沒有 ${} 的話，JavaScript 會將 process.env.NEXT_PUBLIC_API_BASE_URL 當作字串字面量
                           * - 最終圖片 URL 會變成：process.env.NEXT_PUBLIC_API_BASE_URL/uploads/groups/group-default.png
                           * - 這會導致圖片載入失敗，顯示破圖
                           */
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
              <div className={styles.emptyList}>目前沒有參與任何群組</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
