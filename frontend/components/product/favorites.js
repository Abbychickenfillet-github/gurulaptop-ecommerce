import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import ProductCardWhite from '@/components/product/product-card-white'
import styles from '@/styles/favorities.module.scss'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)

// 撈取所有收藏清單
export default function Favorites() {
  const { auth } = useAuth() // 獲取 auth 對象
  const { userData } = auth // 獲取 userdata

  const [data, setData] = useState([]) // 存儲收藏的產品數據
  const [loading, setLoading] = useState(true) // 設置加載狀態

  useEffect(() => {
    // 只有當 userData 存在時才進行數據請求
    if (userData) {
      const fetchFavorites = async () => {
        try {
          const response = await fetch(
            `http://localhost:3005/api/favorites/${userData.user_id}`
          )
          const result = await response.json()
          if (result.status === 'success') {
            setData(result.data)
          }
        } catch (error) {
          console.error('Failed to fetch favorites:', error)
        } finally {
          setLoading(false) // 停止加載
        }
      }
      fetchFavorites()
    }
  }, [userData])

  function onSendMessage(message, type) {
    if (type === 'success') {
      MySwal.fire({
        icon: 'success',
        title: message,
        showConfirmButton: false,
        timer: 1000,
      })
    } else {
      MySwal.fire({
        icon: 'error',
        title: message,
        showConfirmButton: false,
        timer: 1000,
      })
    }
  }

  if (loading) return <div>Loading...</div> // 加載狀態
  if (!data || data.length === 0)
    return <h3 className="text-center mt-5">尚未收藏任何商品</h3> // 無收藏項目

  return (
    <main className={`${styles.product_list}`}>
      {data?.favorite?.map((item) => (
        <ProductCardWhite
          key={item.product_id}
          product_id={item.product_id}
          onSendMessage={onSendMessage}
        />
      ))}
    </main>
  )
}
