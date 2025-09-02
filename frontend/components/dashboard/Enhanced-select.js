import React, { useState, useRef, useEffect } from 'react'

export default function EnhancedSelect({
  id,
  name,
  className,
  disabled,
  value,
  onChange,
  placeholder = '請選擇',
  children, // 這邊的children是什麼
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getFilteredOptions = () => {
    if (!children) return []

    const options = React.Children.toArray(children)
    return options
      .map((child) => {
        if (child.type === 'optgroup') {
          const filteredChildren = React.Children.toArray(
            child.props.children,
          ).filter((option) => {
            const optionText = option.props.children.toString().toLowerCase()
            return optionText.includes(searchTerm.toLowerCase())
          })

          return filteredChildren.length > 0
            ? React.cloneElement(child, {}, filteredChildren)
            : null
        }

        if (child.type === 'option') {
          const optionText = child.props.children.toString().toLowerCase()
          return optionText.includes(searchTerm.toLowerCase()) ? child : null
        }

        return null
      })
      .filter(Boolean)
  }

  const handleSelect = (optionValue) => {
    if (typeof onChange === 'function') {
      onChange({ target: { name, value: optionValue } })
    }
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="position-relative" ref={wrapperRef}>
      {/* 美化的選擇框 */}
      <button
        type="button"
        className={`form-control d-flex align-items-center justify-content-between ${
          disabled ? 'bg-light' : 'cursor-pointer'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          minHeight: '38px',
          background: disabled ? '#e9ecef' : 'white',
          transition: 'all 0.2s',
        }}
      >
        <span className={!value ? 'text-muted' : ''}>
          {value || placeholder}
        </span>
        <i
          className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`}
          style={{ color: '#6c757d' }}
        ></i>
      </button>

      {/* 美化的下拉選單 */}
      {isOpen && !disabled && (
        <div
          className="position-absolute start-0 w-100 mt-1 bg-white border rounded shadow"
          style={{
            zIndex: 1000,
            maxHeight: '300px',
            overflow: 'auto',
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          {/* 搜尋框 */}
          <div className="sticky-top bg-white p-2 border-bottom">
            <div className="position-relative">
              <input
                type="text"
                className="form-control form-control-sm ps-4"
                placeholder="輸入關鍵字搜尋..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <i
                className="bi bi-search position-absolute start-0 top-50 translate-middle-y ms-2"
                style={{ color: '#6c757d' }}
              ></i>
            </div>
          </div>

          {/* 選項列表 */}
          <div className="py-1">
            {getFilteredOptions().map((child) => {
              if (child.type === 'optgroup') {
                return (
                  <div key={child.props.label} className="px-2">
                    <div className="dropdown-header text-primary fw-bold py-2">
                      {child.props.label}
                    </div>
                    {React.Children.map(child.props.children, (option) => (
                      <button
                        type="button"
                        className="dropdown-item d-flex align-items-center"
                        onClick={() =>
                          handleSelect(
                            option.props.value,
                            option.props.children,
                          )
                        }
                        style={{
                          transition: 'all 0.2s',
                          padding: '0.5rem 1rem',
                        }}
                      >
                        <span style={{ flex: 1 }}>{option.props.children}</span>
                        {value === option.props.value && (
                          <i className="bi bi-check2 text-primary"></i>
                        )}
                      </button>
                    ))}
                  </div>
                )
              }

              if (child.type === 'option' && child.props.value) {
                return (
                  <button
                    type="button"
                    key={child.props.value}
                    className="dropdown-item d-flex align-items-center"
                    onClick={() =>
                      handleSelect(child.props.value, child.props.children)
                    }
                    style={{
                      transition: 'all 0.2s',
                      padding: '0.5rem 1rem',
                    }}
                  >
                    <span style={{ flex: 1 }}>{child.props.children}</span>
                    {value === child.props.value && (
                      <i className="bi bi-check2 text-primary"></i>
                    )}
                  </button>
                )
              }

              return null
            })}
          </div>
        </div>
      )}

      <select
        id={id}
        name={name}
        className={className}
        disabled={disabled}
        value={value}
        onChange={() => {}}
        style={{ display: 'none' }}
      >
        {children}
      </select>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-item:hover {
          background-color: #f8f9fa;
          color: #805af5;
        }

        .dropdown-item:active {
          background-color: #805af5;
          color: white;
        }

        /* 美化滾動條 */
        div::-webkit-scrollbar {
          width: 8px;
        }

        div::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        div::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  )
}
