import React from 'react'
import styles from './GroupNavbar.module.css'
import Dropdown from '../event/Dropdown'
import { IoSearch } from 'react-icons/io5'

const GroupNavbar = ({
  events,
  onEventFilter,
  onSearch,
  onSort,
  initialEventId,
}) => {
  const eventOptions = ['全部活動']
  if (events?.length > 0) {
    events.forEach((event) => {
      if (event.event_name) {
        eventOptions.push(event.event_name)
      }
    })
  }

  const sortOptions = ['時間較近', '時間較遠']

  return (
    <nav className={`navbar ${styles.eventNavbar} navbar-dark`}>
      <div className={styles.containerFluid}>
        <div className={styles.dropdownWrapper}>
          <Dropdown
            title="活動篩選"
            items={eventOptions}
            onSelect={(value) => {
              if (value === '全部活動') {
                onEventFilter('all')
              } else {
                const selectedEvent = events.find((e) => e.event_name === value)
                onEventFilter(selectedEvent?.event_id || 'all')
              }
            }}
            defaultValue={
              initialEventId
                ? events.find((e) => e.event_id === parseInt(initialEventId))
                    ?.event_name
                : '全部活動'
            }
          />
          <Dropdown
            title="排序方式"
            items={sortOptions}
            onSelect={(value) =>
              onSort(value === '最新揪團' ? 'newest' : 'oldest')
            }
          />
        </div>

        <form
          className={styles.searchForm}
          onSubmit={(e) => e.preventDefault()}
        >
          <div className={styles.inputGroup}>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="搜尋揪團..."
              onChange={(e) => onSearch(e.target.value)}
            />
            <button className={styles.searchButton} type="submit">
              <IoSearch className={styles.searchIcon} />
            </button>
          </div>
        </form>
      </div>
    </nav>
  )
}

export default GroupNavbar
