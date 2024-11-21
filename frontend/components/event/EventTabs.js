import styles from './EventTabs.module.css'

const EventTabs = ({ activeTab, setActiveTab, onTabChange }) => {
  const tabs = ['所有活動', '進行中', '即將開始報名', '報名中', '已結束']

  return (
    <div className={`${styles.eventNavContainer} event-nav-container`}>
      <ul
        className={`nav nav-underline justify-content-center gap-5 ${styles.navCustom}`}
      >
        {tabs.map((tab) => (
          <li key={tab} className="nav-item">
            <a
              className={`nav-link event-nav-link ${styles.navLink} ${
                activeTab === tab ? styles.active : ''
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
      <div className={`${styles.eventNavLine} event-nav-line`} />
    </div>
  )
}

export default EventTabs
