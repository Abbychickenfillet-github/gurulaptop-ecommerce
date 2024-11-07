import React from 'react'
import { Nav, Tab } from 'react-bootstrap'
import MembershipLevels from '@/pages/dashboard/membership-levels'
import LeftAside from '@/components/dashboard/leftAside'
import CardExample from '@/components/bootstrap/cards'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/router'
import EventManegement from '@/components/event/EventManagement'
import GroupManagement from '@/components/group/GroupManagement'

// 優惠卷
import Coupon from '@/components/coupon'
import UserProfile from '@/components/dashboard/userInfoEdit'

export default function Dashboard() {
  return (
    <div className="container">
      <div className="row d-flex justify-content-center">
        <LeftAside />
        <div className="col-md-9">
          <Tab.Container id="dashboard-tabs" defaultActiveKey="home">
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
                <Nav.Link eventKey="shopping-record">購買清單</Nav.Link>
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

            <Tab.Content>
              <Tab.Pane eventKey="home">
                <div className='row justify-content-end'>
                  <UserProfile />
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="shopping-record">
                <div>
                  <h4>購買清單components\bootstrap\cards.js</h4>
                  <CardExample />
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="lease-record">
                <div className="col-6">
                  <h4>租賃清單</h4>
                  <p>這裡是租賃清單的內容。</p>
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="coupon-record">
                <div>
                  <h4>優惠券</h4>
                  <p>這裡是優惠券的內容。</p>
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="blog-record">
                <div>
                  <h4>文章列表</h4>
                  <p>這裡是文章列表的內容。</p>
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="activity-record">
                <div>
                  <h4>活動列表</h4>
                  <p>這裡是活動的內容。</p>
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="group-record">
                <div>
                  <h4>揪團列表</h4>
                  <p>這裡是揪團的內容。</p>
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
      </div>
    </div>
  )
}