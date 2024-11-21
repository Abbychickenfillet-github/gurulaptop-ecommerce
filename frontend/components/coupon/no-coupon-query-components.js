import React, { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'

const CouponQuery = ({ onSearch }) => {
  // 設置搜尋條件的狀態
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    status: 'all',
    startDate: '',
    endDate: '',
  })

  // 處理輸入變化
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // 處理搜尋提交
  const handleSubmit = (e) => {
    e.preventDefault()
    // 呼叫父組件傳來的搜尋函數
    onSearch(searchParams)
  }

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      <div className="row g-3">
        <div className="col-md-3">
          <Form.Group>
            <Form.Label>關鍵字搜尋</Form.Label>
            <Form.Control
              type="text"
              name="keyword"
              value={searchParams.keyword}
              onChange={handleInputChange}
              placeholder="請輸入優惠券關鍵字"
            />
          </Form.Group>
        </div>

        {/* <div className="col-md-3">
          <Form.Group>
            <Form.Label>起始日期</Form.Label>
            <Form.Control
              type="date"
              name="startDate"
              value={searchParams.startDate}
              onChange={handleInputChange}
            />
          </Form.Group>
        </div> */}

        <div className="col-md-3 d-flex align-items-end">
          <Button
            variant="primary"
            type="submit"
            style={{ backgroundColor: '#805AF5', borderColor: '#805AF5' }}
          >
            搜尋
          </Button>
        </div>
      </div>
    </Form>
  )
}

export default CouponQuery
