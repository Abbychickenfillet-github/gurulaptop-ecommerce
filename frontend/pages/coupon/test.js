import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import CouponBtn from '@/components/coupon/coupon-btn'
// import { useRouter } from 'next/router'
import Coupon2 from '@/components/coupon/index2'
import CouponList from '@/components/coupon/coupon-list-components'
import LoadingAnimation from '@/components/LoadingAnimation/LoadingAnimation'

const MySwal = withReactContent(Swal)

export default function Checkout() {
  // const router = useRouter()
  // const { product_id } = router.query

  // 商品狀態
  const [selectedProduct, setSelectedProduct] = useState({
    // 修改
    product_id: 1,
    list_price: 0,
    product_name: ''
  })
  
  const [coupon, setCoupon] = useState(null)
  
  // 當元件載入時取得商品資料
  useEffect(() => {
    fetchProductData()
  }, [])

  // 取得商品資料的函式
  const fetchProductData = async () => {

    // if(!product_id) return

    try {
      const response = await fetch('http://localhost:3005/api/products/1')
      // const response = await fetch(`http://localhost:3005/api/products/${product_id}`)


      const result = await response.json()
      
      if(result.status === 'success') {
        setSelectedProduct({
          product_id: result.data.product.product_id,
          list_price: result.data.product.list_price,
          product_name: result.data.product.product_name
        })
      } else {
        MySwal.fire({
          icon: 'error',
          title: '載入失敗',
          text: result.message
        })
      }
    } catch (error) {
      console.error('取得商品資料失敗:', error)
      MySwal.fire({
        icon: 'error',
        title: '載入失敗',
        text: '無法連接伺服器'
      })
    }
  }

  return (
    <div className="container my-4">
      <h1>結帳</h1>
      
      <div className="card mb-3">
        <div className="card-body">
          <h5>商品名稱: {selectedProduct.product_name}</h5>
          <h5>商品金額: ${selectedProduct.list_price}</h5>
          {coupon && (
            <>
              <h5 className="text-success">
                折扣金額: -${coupon.discountAmount}
              </h5>
              <h4>應付金額: ${coupon.finalPrice}</h4>
            </>
          )}
        </div>
      </div>
      <CouponBtn 
        price={selectedProduct.list_price}
        setCouponValue={setCoupon}
      />
    </div>
  )
}