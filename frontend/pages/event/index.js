import { useState, useEffect } from 'react'
import EventCard from '@/components/event/EventCard'
import Carousel from '@/components/event/Carousel'
import EventNavbar from '@/components/event/EventNavbar'
import axios from 'axios'
import EventManagement from '@/components/event/EventManagement'
import GroupManagement from '@/components/group/GroupManagement'

// 分頁標籤組件
const EventTabs = ({ activeTab, setActiveTab, onTabChange }) => {
  const tabs = ['所有活動', '進行中', '即將開始報名', '報名中', '已結束']

  return (
    <div className="event-nav-container">
      <ul className="nav nav-underline justify-content-center gap-5">
        {tabs.map((tab) => (
          <li key={tab} className="nav-item">
            <a
              className={`nav-link event-nav-link ${
                activeTab === tab ? 'active' : ''
              }`}
              href="#"
              onClick={(e) => {
                e.preventDefault()
                setActiveTab(tab)
                onTabChange(tab)
              }}
            >
              {tab}
            </a>
          </li>
        ))}
      </ul>
      <div className="event-nav-line" />
    </div>
  )
}

// 分頁導航組件
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const generatePaginationItems = () => {
    let items = []
    items.push(1)

    let start = Math.max(2, currentPage - 1)
    let end = Math.min(totalPages - 1, currentPage + 1)

    if (start > 2) items.push('...')

    for (let i = start; i <= end; i++) {
      items.push(i)
    }

    if (end < totalPages - 1) items.push('...')

    if (totalPages > 1) items.push(totalPages)

    return items
  }

  return (
    <div className="event-pagination-container">
      <ul className="event-pagination-list">
        <li
          className={`event-pagination-item ${
            currentPage === 1 ? 'disabled' : ''
          }`}
        >
          <button
            className="event-pagination-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ⟨
          </button>
        </li>

        {generatePaginationItems().map((item, index) => (
          <li
            key={`page-${index}`}
            className={`event-pagination-item ${
              item === currentPage ? 'active' : ''
            } ${item === '...' ? 'disabled' : ''}`}
          >
            <button
              className="event-pagination-link"
              onClick={() => item !== '...' && onPageChange(item)}
              disabled={item === '...'}
            >
              {item}
            </button>
          </li>
        ))}

        <li
          className={`event-pagination-item ${
            currentPage === totalPages ? 'disabled' : ''
          }`}
        >
          <button
            className="event-pagination-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            ⟩
          </button>
        </li>
      </ul>
    </div>
  )
}

// 主要組件
export default function Event() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('所有活動')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // 獲取活動資料
  const fetchEvents = async (page = currentPage, status = activeTab) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get('http://localhost:3005/api/events', {
        params: {
          page,
          pageSize: 12,
          status: status === '所有活動' ? '' : status,
        },
      })

      if (response.data.code === 200) {
        setEvents(response.data.data.events)
        setTotalPages(Math.ceil(response.data.data.total / 12))
      } else {
        setError('獲取資料失敗')
      }
    } catch (err) {
      setError('獲取資料失敗，請稍後再試')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  // 初始載入
  useEffect(() => {
    fetchEvents()
  }, [])

  // 處理分頁變更
  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchEvents(page)
  }

  // 處理分類變更
  const handleTabChange = (tab) => {
    setCurrentPage(1)
    fetchEvents(1, tab)
  }

  return (
    <>
      <Carousel />
      <div className="event-wrapper">
        <EventNavbar />
        <EventTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onTabChange={handleTabChange}
        />

        <main>
          <div className="event-container" style={{ maxWidth: 1440 }}>
            {error && (
              <div className="alert alert-danger text-center" role="alert">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center p-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">載入中...</span>
                </div>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-sm-1 row-cols-md-2 row-cols-lg-3 g-4 justify-content-center mx-auto">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    name={event.name}
                    type={event.type}
                    platform={event.platform}
                    content={event.content}
                    picture={event.picture}
                    applyStartTime={event.applyStartTime}
                    applyEndTime={event.applyEndTime}
                    eventStartTime={event.eventStartTime}
                    maxPeople={event.maxPeople}
                    status={event.status}
                    teamType={event.teamType}
                  />
                ))}
              </div>
            )}

            {!loading && !error && events.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
            <EventManagement />
            <GroupManagement />
          </div>
        </main>
      </div>
    </>
  )
}
