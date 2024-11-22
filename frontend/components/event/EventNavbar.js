import React, { useState, useEffect, useCallback } from 'react'
import { IoSearch } from 'react-icons/io5'
import { useRouter } from 'next/router'
import Dropdown from './Dropdown'
import styles from './EventNavbar.module.css'
import axios from 'axios'

const EventNavbar = ({ onFilterChange }) => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [gameTypes, setGameTypes] = useState([])
  const [platforms, setPlatforms] = useState([])
  const [selectedType, setSelectedType] = useState('全部遊戲')
  const [selectedPlatform, setSelectedPlatform] = useState('平台')
  const [selectedTeamType, setSelectedTeamType] = useState('個人/團隊')
  const [isInitialized, setIsInitialized] = useState(false)

  // 從 URL 初始化篩選狀態
  useEffect(() => {
    if (!isInitialized && router.isReady) {
      const { type, platform, teamType, search } = router.query

      if (type) setSelectedType(decodeURIComponent(type))
      if (platform) setSelectedPlatform(decodeURIComponent(platform))
      if (teamType) setSelectedTeamType(decodeURIComponent(teamType))
      if (search) setSearchTerm(decodeURIComponent(search))

      setIsInitialized(true)
    }
  }, [router.isReady, router.query])

  // 獲取篩選選項
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [typesResponse, platformsResponse] = await Promise.all([
          axios.get('http://localhost:3005/api/events/filters/types'),
          axios.get('http://localhost:3005/api/events/filters/platforms'),
        ])

        if (typesResponse.data.code === 200) {
          setGameTypes(typesResponse.data.data)
        }
        if (platformsResponse.data.code === 200) {
          setPlatforms(platformsResponse.data.data)
        }
      } catch (error) {
        console.error('Error fetching filters:', error)
      }
    }

    fetchFilters()
  }, [])

  // 更新 URL 和觸發篩選
  const updateFilters = useCallback(
    (searchValue) => {
      if (!isInitialized) return

      const filters = {
        type: selectedType === '全部遊戲' ? null : selectedType,
        platform: selectedPlatform === '平台' ? null : selectedPlatform,
        teamType: selectedTeamType === '個人/團隊' ? null : selectedTeamType,
        search: searchValue.trim() || null,
      }

      // 更新 URL 查詢參數
      const query = {}
      Object.entries(filters).forEach(([key, value]) => {
        if (value) query[key] = value
      })

      router.push(
        {
          pathname: router.pathname,
          query,
        },
        undefined,
        { shallow: true, scroll: false }
      )

      onFilterChange(filters)
    },
    [selectedType, selectedPlatform, selectedTeamType, isInitialized, router]
  )

  const handleTypeChange = useCallback((type) => {
    setSelectedType(type)
  }, [])

  const handlePlatformChange = useCallback((platform) => {
    setSelectedPlatform(platform)
  }, [])

  const handleTeamTypeChange = useCallback((teamType) => {
    setSelectedTeamType(teamType)
  }, [])

  const handleSearchInputChange = useCallback((e) => {
    setSearchTerm(e.target.value)
  }, [])

  const handleSearch = useCallback((e) => {
    e.preventDefault()
  }, [])

  // 監聽篩選條件變化
  useEffect(() => {
    if (isInitialized) {
      updateFilters(searchTerm)
    }
  }, [
    selectedType,
    selectedPlatform,
    selectedTeamType,
    searchTerm,
    isInitialized,
  ])

  return (
    <nav className={`navbar ${styles.eventNavbar} navbar-dark`}>
      <div className={styles.containerFluid}>
        <div className={styles.dropdownWrapper}>
          <Dropdown
            title={selectedType}
            items={['全部遊戲', ...gameTypes]}
            onSelect={handleTypeChange}
            currentValue={selectedType}
          />
          <Dropdown
            title={selectedPlatform}
            items={['平台', ...platforms]}
            onSelect={handlePlatformChange}
            currentValue={selectedPlatform}
          />
          <Dropdown
            title={selectedTeamType}
            items={['個人/團隊', '個人', '團隊']}
            onSelect={handleTeamTypeChange}
            currentValue={selectedTeamType}
          />
        </div>

        <form className={styles.searchForm} onSubmit={handleSearch}>
          <div className={styles.inputGroup}>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="搜尋活動"
              value={searchTerm}
              onChange={handleSearchInputChange}
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

export default EventNavbar
