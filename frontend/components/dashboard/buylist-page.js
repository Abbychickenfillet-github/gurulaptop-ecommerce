import React, { useState, useEffect } from 'react'
import BuyList from '@/components/dashboard/buy-list'
import { useAuth } from '@/hooks/use-auth'

export default function BuylistPage(props) {
  const { orderStatus } = props
  const [order, setOrder] = useState([])
  const { auth } = useAuth()
  const { userData } = auth
  const [user_id, setUser_id] = useState(null)

  // 當 userData 改變時，更新 user_id
  useEffect(() => {
    if (userData) {
      setUser_id(userData.user_id)
    }
  }, [userData])

  // 當 user_id 改變時，獲取訂單
  useEffect(() => {
    const getOrder = async () => {
      if (!user_id) return
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/buy-list/${user_id}`,
          {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        const data = await res.json()

        if (data.status === 'success' && !data.data) {
          return setOrder([])
        }
        setOrder(data.data)
      } catch (error) {
        console.error('Error fetching orders:', error)
        setOrder([])
      }
    }

    getOrder()
  }, [user_id])

  return (
    <>
      {order.length === 0 && (
        <div className="text-center mt-5">
          <h2>目前沒有訂單</h2>
        </div>
      )}
      {order.map((item, index) => {
        return <BuyList key={index} order={item} />
      })}
    </>
  )
}
