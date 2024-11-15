import { createContext, useContext } from 'react'
import { useAuth } from '@/hooks/use-auth'

const GroupAuthContext = createContext(null)

export const GroupAuthProvider = ({ children }) => {
  const { auth } = useAuth()

  const sendGroupRequest = async (groupId, gameId, description) => {
    try {
      // 從 cookie 中獲取 token
      const response = await fetch('http://localhost:3005/api/group/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 添加這行，讓瀏覽器發送 cookie
        body: JSON.stringify({
          groupId,
          gameId,
          description,
          senderId: auth.user_id,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || '申請發送失敗')
      }

      return { success: true, data }
    } catch (error) {
      console.error('Send group request error:', error)
      return { success: false, message: error.message }
    }
  }

  return (
    <GroupAuthContext.Provider
      value={{
        sendGroupRequest,
      }}
    >
      {children}
    </GroupAuthContext.Provider>
  )
}

export const useGroupAuth = () => {
  const context = useContext(GroupAuthContext)
  if (!context) {
    throw new Error('useGroupAuth must be used within a GroupAuthProvider')
  }
  return context
}
