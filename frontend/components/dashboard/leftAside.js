import React from 'react'
import Link from 'next/link'
import { FaPenFancy } from 'react-icons/fa'

const LeftAside = () => {
  return (
    <div className="card col-2 border-0">
      <div className=" text-center ">
        {' '}
        {/*把card-body拿掉*/}
        <img
          src="https://via.placeholder.com/70x70"
          alt="Profile"
          className="rounded-circle img-fluid mb-3"
          style={{ width: '70px', height: '70px' }}
        />
        <h5 className="mb-2">萊歐斯·托登</h5>
        <button
          className="btn btn-outline-primary btn-sm mb-3"
          style={{ color: '#805AF5', borderColor: '#805AF5' }}
        >
          <FaPenFancy />
          編輯個人簡介
        </button>
      </div>
      <div className="list-group list-group-flush">
        <Link
          href="#"
          className="list-group-item list-group-item-action text-center"
        >
          收藏清單
        </Link>
        <Link
          href="dashboard/membership-levels"
          className="list-group-item list-group-item-action text-center"
        >
          會員等級
        </Link>
      </div>
    </div>
  )
}

export default LeftAside
