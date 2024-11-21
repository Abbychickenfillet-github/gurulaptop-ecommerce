import React, { useState } from 'react'
import styles from './EditGroupModal.module.css'
import { X } from 'lucide-react'

const EditGroupModal = ({
  onClose = () => {},
  groupData = {},
  onSave = () => {},
}) => {
  const [formData, setFormData] = useState({
    title: groupData?.title || '',
    description: groupData?.description || '',
    maxMembers: groupData?.maxMembers || 1,
    group_time: groupData?.group_time
      ? new Date(groupData.group_time).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...formData,
      group_time: new Date(formData.group_time).toISOString(),
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleClose = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className={styles.modalBackdrop}
      onClick={handleClose}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClose()
        }
      }}
    >
      <div className={styles.customModal}>
        <button
          className={styles.closeButton}
          onClick={() => onClose()}
          aria-label="關閉視窗"
        >
          <X size={24} />
        </button>

        <div className={styles.modalContent}>
          <h3 className={styles.modalTitle}>編輯揪團</h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className={styles.formLabel}>
                揪團名稱
              </label>
              <input
                type="text"
                name="title"
                id="title"
                className={`form-control ${styles.formInput}`}
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="description" className={styles.formLabel}>
                揪團描述
              </label>
              <textarea
                name="description"
                id="description"
                className={`form-control ${styles.formInput}`}
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="group_time" className={styles.formLabel}>
                揪團時間
              </label>
              <input
                type="datetime-local"
                id="group_time"
                name="group_time"
                className={`form-control ${styles.dateTimeInput}`}
                value={formData.group_time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="maxMembers" className={styles.formLabel}>
                需求人數
              </label>
              <input
                type="number"
                id="maxMembers"
                name="maxMembers"
                className={`form-control ${styles.numberInput}`}
                value={formData.maxMembers}
                onChange={handleChange}
                min={1}
                required
              />
            </div>

            <div className={styles.buttonContainer}>
              <button type="submit" className={styles.saveButton}>
                儲存變更
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditGroupModal
