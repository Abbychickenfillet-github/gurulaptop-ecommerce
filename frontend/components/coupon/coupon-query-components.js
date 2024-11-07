// import React, { useState, useEffect } from 'react'

// export default function CouponQuery(props) {
//   return (
//     <>
//       <div className="discount-code-section mb-4">
//         <div className="d-flex align-items-center">
//           <div className="input-group" style={{ maxWidth: '400px' }}>
//             <span
//               className="input-group-text"
//               style={{ backgroundColor: '#805AF5', color: 'white' }}
//             >
//               折扣碼
//             </span>
//             <input
//               type="text"
//               className="form-control"
//               placeholder="請輸入折扣碼"
//               aria-label="Discount code"
//             />
//             <button
//               className="btn btn-primary"
//               type="button"
//               style={{
//                 backgroundColor: '#805AF5',
//                 borderColor: '#805AF5',
//               }}
//             >
//               使用
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   )
// }




import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';

const CouponQuery = ({ onSearch }) => {
  // 設置搜尋條件的狀態
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    status: 'all',
    startDate: '',
    endDate: ''
  });

  // 處理輸入變化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 處理搜尋提交
  const handleSubmit = (e) => {
    e.preventDefault();
    // 呼叫父組件傳來的搜尋函數
    onSearch(searchParams);
  };

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
        
        <div className="col-md-3">
          <Form.Group>
            <Form.Label>優惠券狀態</Form.Label>
            <Form.Select
              name="status"
              value={searchParams.status}
              onChange={handleInputChange}
            >
              <option value="all">全部</option>
              <option value="valid">可使用</option>
              <option value="used">已使用</option>
              <option value="expired">已過期</option>
            </Form.Select>
          </Form.Group>
        </div>
        
        <div className="col-md-3">
          <Form.Group>
            <Form.Label>起始日期</Form.Label>
            <Form.Control
              type="date"
              name="startDate"
              value={searchParams.startDate}
              onChange={handleInputChange}
            />
          </Form.Group>
        </div>
        
        <div className="col-md-3">
          <Form.Group>
            <Form.Label>結束日期</Form.Label>
            <Form.Control
              type="date"
              name="endDate"
              value={searchParams.endDate}
              onChange={handleInputChange}
            />
          </Form.Group>
        </div>
      </div>

      <div className="d-flex justify-content-end mt-3">
        <Button 
          variant="primary" 
          type="submit"
          style={{ backgroundColor: '#805AF5', borderColor: '#805AF5' }}
        >
          搜尋
        </Button>
      </div>
    </Form>
  );
};

export default CouponQuery;