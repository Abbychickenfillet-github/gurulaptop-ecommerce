import { useState, useEffect } from 'react'
import EventCard from '@/components/event/EventCard'
import Carousel from '@/components/event/Carousel'
import EventNavbar from '@/components/event/EventNavbar'
import axios from 'axios'
import EventTabs from '@/components/event/EventTabs'
import Head from 'next/head'

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
  const [filters, setFilters] = useState({
    type: null,
    platform: null,
    teamType: null,
    search: null,
  })

  // 節流函數
  const throttle = (func, limit) => {
    let inThrottle
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  }

  // 獲取活動資料
  const fetchEvents = async (
    page = currentPage,
    status = activeTab,
    showLoading = true
  ) => {
    try {
      if (showLoading) setLoading(true)
      setError(null)

      const response = await axios.get('http://localhost:3005/api/events', {
        params: {
          page,
          pageSize: 12,
          status: status === '所有活動' ? '' : status,
          type: filters.type,
          platform: filters.platform,
          teamType: filters.teamType,
          keyword: filters.search,
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
      if (showLoading) setLoading(false)
    }
  }

  // 初始載入
  useEffect(() => {
    fetchEvents()

    // 使用節流的自動更新
    const throttledFetch = throttle(() => {
      fetchEvents(currentPage, activeTab, false)
    }, 30000)

    const interval = setInterval(throttledFetch, 30000)
    return () => clearInterval(interval)
  }, [])

  // 當篩選器改變時重新獲取數據
  useEffect(() => {
    if (filters.type !== undefined) {
      fetchEvents(1, activeTab)
    }
  }, [filters])

  // 處理分頁變更
  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchEvents(page, activeTab)
    // 滾動到頁面頂部，但保持在卡片區域
    document
      .querySelector('.event-container')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  // 處理分類變更
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
    fetchEvents(1, tab)
  }

  // 處理篩選變更
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      type: newFilters.type,
      platform: newFilters.platform,
      teamType: newFilters.teamType,
      search: newFilters.search,
    }))
    setCurrentPage(1)
  }

  return (
    <>
      <Head>
        <title>活動</title>
      </Head>
      <div className="event-wrapper">
        <Carousel />
        <EventNavbar
          onFilterChange={handleFilterChange}
          setIsLoading={setLoading}
        />
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
              <div className="row g-4 justify-content-start">
                {' '}
                {/* 修改這裡 */}
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="col-12 col-sm-6 col-lg-4 col-xl-3"
                  >
                    {' '}
                    {/* 修改這裡 */}
                    <EventCard
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
                      currentParticipants={event.currentParticipants}
                      status={event.status}
                      teamType={event.teamType}
                    />
                  </div>
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
          </div>
        </main>
      </div>
    </>
  )
}
// Event.getLayout = (page) => page
