import Coupon from '@/components/coupon'
import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)

export default function Test(props) {
  const handleAdd = async (user_id, coupon_id) => {
    const response = await fetch(
      `http://localhost:3005/api/test/add/${user_id}/${coupon_id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
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
      <button
        className={`btn btn-primary`}
        onClick={(e) => {
          e.preventDefault()
          handleAdd(1, 1)
        }}
      >
        12345
      </button>
    </>
  )
}
