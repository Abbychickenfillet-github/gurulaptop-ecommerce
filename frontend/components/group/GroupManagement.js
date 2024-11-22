import React, { useState, useEffect } from 'react'
import styles from './GroupManagement.module.css'
import EditGroupModal from './EditGroupModal'
import Swal from 'sweetalert2'

const GroupManagement = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)

  const fetchUserGroups = async () => {
    try {
      const [memberResponse, creatorResponse] = await Promise.all([
        fetch('http://localhost:3005/api/group/user', {
          credentials: 'include',
        }),
        fetch('http://localhost:3005/api/group/creator', {
          credentials: 'include',
        }),
      ])

      const [memberData, creatorData] = await Promise.all([
        memberResponse.json(),
        creatorResponse.json(),
      ])

      if (memberData.status === 'success' && creatorData.status === 'success') {
        const combinedGroups = [
          ...memberData.data.groups.map((group) => ({
            ...group,
            role: 'member',
          })),
          ...creatorData.data.groups.map((group) => ({
            ...group,
            role: 'creator',
          })),
        ]

        const uniqueGroups = combinedGroups.reduce((acc, current) => {
          const x = acc.find((item) => item.group_id === current.group_id)
          if (!x) return acc.concat([current])
          if (current.role === 'creator') {
            return acc.map((item) =>
              item.group_id === current.group_id ? current : item
            )
          }
          return acc
        }, [])

        setGroups(uniqueGroups)
      } else {
        throw new Error(memberData.message || creatorData.message)
      }
    } catch (error) {
      console.error('獲取群組失敗:', error)
      setError('獲取群組資料失敗')
      await Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '獲取群組資料失敗',
        timer: 1500,
        showConfirmButton: false,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserGroups()
  }, [])

  const handleDeleteGroup = async (groupId) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: '確認刪除',
      text: '確定要刪除此群組嗎？此操作無法復原',
      showCancelButton: true,
      confirmButtonText: '確定',
      cancelButtonText: '取消',
    })

    if (!result.isConfirmed) return

    try {
      const response = await fetch(
        `http://localhost:3005/api/group/${groupId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )

      const data = await response.json()
      if (data.status === 'success') {
        await Swal.fire({
          icon: 'success',
          title: '刪除成功',
          text: '群組已成功刪除',
          timer: 1500,
          showConfirmButton: false,
        })
        fetchUserGroups()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error('刪除群組失敗:', error)
      await Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: error.message || '刪除群組失敗',
        timer: 1500,
        showConfirmButton: false,
      })
    }
  }

  const handleEditClick = (group) => {
    setSelectedGroup(group)
    setIsEditModalOpen(true)
  }

  const handleEditSave = async (updatedData) => {
    try {
      const response = await fetch(
        `http://localhost:3005/api/group/${selectedGroup.group_id}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            group_name: updatedData.title,
            description: updatedData.description,
            max_members: updatedData.maxMembers,
            group_time: updatedData.group_time,
          }),
        }
      )

      const result = await response.json()

      if (result.status === 'success') {
        setGroups((prevGroups) =>
          prevGroups.map((group) =>
            group.group_id === selectedGroup.group_id
              ? { ...group, ...result.data.group }
              : group
          )
        )
        await Swal.fire({
          icon: 'success',
          title: '更新成功',
          text: '群組資訊已成功更新',
          timer: 1500,
          showConfirmButton: false,
        })
        setIsEditModalOpen(false)
      } else {
        throw new Error(result.message || '更新失敗')
      }
    } catch (error) {
      console.error('更新揪團失敗:', error)
      await Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: error.message || '更新失敗',
        timer: 1500,
        showConfirmButton: false,
      })
    }
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'http://localhost:3005/uploads/groups/group-default.png'
    }
    return `http://localhost:3005${imagePath}`
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (groups.length === 0) {
    return <div>目前沒有參加或創建的群組</div>
  }

  return (
    <div className={`py-2`}>
      <div className={styles.groupList}>
        <div className={styles.listHeader}>
          <div className={styles.listTitle}>
            <i className="bi bi-people-fill"></i>
            揪團資訊
          </div>
        </div>

        <div
          className={`${styles.listRow} ${styles.desktopHeader} d-none d-md-block`}
        >
          <div className="row align-items-center">
            <div className="col-2"></div>
            <div className="col-3">揪團名稱</div>
            <div className="col-2">時間</div>
            <div className="col-1">人數</div>
            <div className="col-2">身份</div>
            <div className="col-2">編輯</div>
          </div>
        </div>

        {groups.map((group) => (
          <div key={group.group_id} className={styles.listRow}>
            <div className="row align-items-center d-none d-md-flex">
              <div className="col-2">
                <img
                  src={getImageUrl(group.group_img)}
                  alt="揪團圖片"
                  className={styles.groupImg}
                  onError={(e) => {
                    e.target.src =
                      'http://localhost:3005/uploads/groups/group-default.png'
                  }}
                />
              </div>
              <div className="col-3">{group.group_name}</div>
              <div className="col-2">
                {new Date(group.creat_time).toLocaleString()}
              </div>
              <div className="col-1">
                {group.member_count}/{group.max_members}
              </div>
              <div className="col-2">
                {group.role === 'creator' ? '創建者' : '參加者'}
              </div>
              <div className="col-2">
                <div className="d-flex gap-2">
                  {group.role === 'creator' && (
                    <>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleEditClick(group)}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleDeleteGroup(group.group_id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className={`${styles.mobileLayout} d-block d-md-none`}>
              <div className={styles.mobileImgWrapper}>
                <img
                  src={getImageUrl(group.group_img)}
                  alt="揪團圖片"
                  className={styles.groupImg}
                  onError={(e) => {
                    e.target.src =
                      'http://localhost:3005/uploads/groups/group-default.png'
                  }}
                />
              </div>
              <div className={styles.mobileInfo}>
                <div className={styles.mobileTitle}>{group.group_name}</div>
                <div className={styles.mobileDetails}>
                  <div className={styles.mobileStats}>
                    <span>
                      <i className="bi bi-clock"></i>{' '}
                      {new Date(group.creat_time).toLocaleString()}
                    </span>
                    <span>
                      <i className="bi bi-people"></i> {group.member_count}/
                      {group.max_members}
                    </span>
                    <span>
                      <i className="bi bi-person-badge"></i>{' '}
                      {group.role === 'creator' ? '創建者' : '參加者'}
                    </span>
                  </div>
                  {group.role === 'creator' && (
                    <div className={styles.mobileActions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleEditClick(group)}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleDeleteGroup(group.group_id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isEditModalOpen && (
        <EditGroupModal
          groupData={{
            title: selectedGroup.group_name,
            description: selectedGroup.description,
            maxMembers: selectedGroup.max_members,
            group_time: selectedGroup.group_time,
          }}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditSave}
        />
      )}
    </div>
  )
}

export default GroupManagement
