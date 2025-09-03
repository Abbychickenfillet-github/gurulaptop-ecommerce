import React from 'react'
import { Nav, Tab } from 'react-bootstrap'
import CouponUser from '@/components/coupon/coupon-user-components'
import UserProfile from '@/components/dashboard/userInfoEdit'
import Link from 'next/link'
import { FaPenFancy } from 'react-icons/fa'
import Image from 'next/image'
export default function CouponPage() {

  return (
    <div className="container">
      <div className="row d-flex justify-content-center">
        <div className="card col-2 border-0">
          <div className=" text-center ">
            <Image
              src="https://via.placeholder.com/70x70"
              alt="Profile"
              className="rounded-circle img-fluid mb-3"
              width={70}
              height={70}
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
              href={`/coupon/coupon-user`}
              className="list-group-item list-group-item-action text-center"
            >
              優惠卷
            </Link>
            <Link
              href="coupon-jquery"
              className="list-group-item list-group-item-action text-center"
            >
              領取優惠卷
            </Link>
          </div>
        </div>
        <div className="col-md-9">
          <Tab.Container
            id="left-tabs-example"
            defaultActiveKey="coupon-record"
          >
            <Nav
              variant="tabs"
              className="mb-3"
              fill
              style={{ '--bs-nav-link-color': '#805AF5' }}
            >
              <Nav.Item>
                <Nav.Link eventKey="home">會員中心</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="shopping">購買清單</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="lease-record">租賃清單</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="coupon-record">優惠券</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="blog-record">文章</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="activity-record">活動</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="group-record">揪團</Nav.Link>
              </Nav.Item>
            </Nav>

            {/* 會員中心 */}
            <Tab.Content>
              <Tab.Pane eventKey="home">
                <div>
                  <UserProfile />
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="shopping">
                <div>
                  <h4>購買清單</h4>
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="lease-record">
                <div>
                  <h4>租賃清單</h4>
                  {/* 添加租賃清單內容 */}
                </div>
              </Tab.Pane>
              {/* 優惠卷 */}
              <Tab.Pane eventKey="coupon-record">
                <div className="container">
                  <CouponUser />


                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="blog-record">
                <div>
                  <h4>文章列表</h4>
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="activity-record">
                <div>
                  <h4>活動列表</h4>
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="group-record">
                <div>
                  <h4>揪團列表</h4>
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
      </div>
    </div>
  )
}
