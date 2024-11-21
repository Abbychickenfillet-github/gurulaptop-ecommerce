import React, { useState, useEffect } from 'react'
import BuyList from '@/components/dashboard/buy-list'
import { useAuth } from '@/hooks/use-auth'

export default function BuylistPage(props) {
  const { orderStatus } = props
  const [order, setOrder] = useState([])
  const [whereClause, setWhereClause] = useState(orderStatus)
  const [user_id, setUser_id] = useState('0')
  const { auth } = useAuth()
  const { userData } = auth
  // const user_id = userData.user_id

  useEffect(() => {
    if (userData) {
      setUser_id(userData.user_id)
    }
  }, [userData])

  const getOrder = async () => {
    const res = await fetch(`http://localhost:3005/api/buy-list/${user_id}`)
    const data = await res.json()

    if ((data.status == 'success') & !data.data) {
      return setOrder([])
    }
    setOrder(data.data)
  }

  useEffect(() => {
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
