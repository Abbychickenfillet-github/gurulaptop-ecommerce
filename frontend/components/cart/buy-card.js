'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { RxCross1 } from 'react-icons/rx'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)
import Link from 'next/link'

export default function BuyCard({ item, onDataChange }) {
  const [price, setPrice] = useState(0)
  useEffect(() => {
    setPrice(item.list_price * item.quantity)
  }, [item.list_price, item.quantity])

  const handleUpdate = async () => {
    const response = await fetch('http://localhost:3005/api/cart/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: item.user_id,
        product_id: item.product_id,
        quantity: item.quantity,
      }),
    })

    const data = await response.json()
    const message = data.message
    if (data.status == 'success') {
      MySwal.fire({
        icon: 'success',
        title: message,
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const handleDelete = async () => {
    const response = await fetch('http://localhost:3005/api/cart/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: item.user_id,
        product_id: item.product_id,
      }),
    })

    const data = await response.json()
    const message = data.message
    if (data.status == 'success') {
      MySwal.fire({
        icon: 'success',
        title: message,
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  return (
    <>
      <div className="card p-3 border-primary mb-2">
        <div className="row align-items-center mb-2">
          <div className="col-5 text-primary">
            <img src="diamond.svg" alt />
            購買資訊
          </div>
          <div className="col-2 d-none d-md-block">單價</div>
          <div className="col-2  d-none d-md-block">數量</div>
          <div className="col-2  d-none d-md-block">小計</div>
          <div className="col-1 mb-2"></div>
        </div>
        <div className="row align-items-center mb-2">
          <div className="col-lg-2 col-12">
            <Link className="cart-photo" href={`/product/${item.product_id}`}>
              <Image
                src={`/product/${item.product_img_path}`}
                alt={item.model}
                width={500}
                height={500}
              />
            </Link>
          </div>
          <Link
            className="col-lg-3 col-3 text-decoration-none text-black"
            href={`/product/${item.product_id}`}
          >
            {item.product_name}
          </Link>
          <div className="col-lg-2 col-3">
            NT {item.list_price.toLocaleString()}元
          </div>
          <div className="col-lg-2 col-3">
            <input
              type="number"
              defaultValue={item.quantity}
              className="w-50"
              onBlur={(e) => {
                if (e.target.value == item.quantity) return
                item.quantity = Number(e.target.value)
                handleUpdate()
                let productCount = item.list_price * e.target.value
                setPrice(productCount)
                onDataChange(item.quantity)
                // if (onDataChange) onDataChange(item.quantity)
              }}
            />
          </div>
          <div className="col-lg-2 col-3">NT {price.toLocaleString()}元</div>
          <div className="col-1  d-none d-lg-block">
            <button
              className={`btn btn-light`}
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
                onDataChange(0)
              }}
            >
              <RxCross1 />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
