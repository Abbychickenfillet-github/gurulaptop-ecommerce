import React, { useState, useRef, useEffect } from 'react'

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = '搜尋...',
  disabled = false,
  groupedOptions = null,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const wrapperRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filterOptions = (options) => {
    if (!searchTerm) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const renderOptions = () => {
    if (groupedOptions) {
      return Object.entries(groupedOptions).map(([group, items]) => {
        const filteredItems = items.filter((item) =>
          item.CityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.CityEngName.toLowerCase().includes(searchTerm.toLowerCase()),
        )

        if (filteredItems.length === 0) return null

        return (
          <div key={group} className="px-2">
            <div className="text-muted small fw-semibold py-1">{group}</div>
            {filteredItems.map((item) => (
              <button
                type="button"
                key={item.CityName}
                className="dropdown-item"
                onClick={() => {
                  onChange({ target: { name: 'city', value: item.CityName } })
                  setIsOpen(false)
                  setSearchTerm('')
                }}
              >
                {item.CityName} ({item.CityEngName})
              </button>
            ))}
          </div>
        )
      })
    }

    return filterOptions(options).map((option) => (
      <button
        type="button"
        key={option.value}
        className="dropdown-item"
        onClick={() => {
          onChange({ target: { value: option.value, name: option.name } })
          setIsOpen(false)
          setSearchTerm('')
        }}
      >
        {option.label}
      </button>
    ))
  }

  return (
    <div className="position-relative" ref={wrapperRef}>
      <button
        type="button"
        className={`form-control ${disabled ? 'bg-light' : 'cursor-pointer'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {value || placeholder}
      </button>

      {isOpen && !disabled && (
        <div
          className="position-absolute w-100 mt-1 dropdown-menu show"
          style={{ maxHeight: '300px', overflow: 'auto' }}
        >
          <div className="sticky-top bg-white border-bottom p-2">
            <input
              type="text"
              className="form-control"
              placeholder="輸入關鍵字搜尋..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="py-1">{renderOptions()}</div>
        </div>
      )}
    </div>
  )
}

export default SearchableSelect