import { useState, useCallback, useRef, useEffect } from 'react'
import styles from './Dropdown.module.css'

const Dropdown = ({ title, items, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // 處理點擊選項
  const handleSelect = useCallback(
    (item) => {
      if (onSelect) {
        onSelect(item)
      }
      setIsOpen(false)
    },
    [onSelect]
  )

  // 處理點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <button
        className={styles.dropdownButton}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {title}
        <span className={styles.dropdownArrow} />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.dropdownScroll}>
            {items.map((item, index) => (
              <div
                key={index}
                className={styles.dropdownItem}
                onClick={() => handleSelect(item)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSelect(item)
                  }
                }}
              >
                <button type="button" className={styles.dropdownLink}>
                  {item}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dropdown
