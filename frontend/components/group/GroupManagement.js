import React from 'react'
import styles from './GroupManagement.module.css'

const GroupList = () => {
  return (
    <div className={`container py-2`}>
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
            <div className="col-2">人數</div>
            <div className="col-2">身份</div>
            <div className="col-1">編輯</div>
          </div>
        </div>

        <div className={styles.listRow}>
          <div className="row align-items-center d-none d-md-flex">
            <div className="col-2">
              <img
                src="https://images.pexels.com/photos/7862360/pexels-photo-7862360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="揪團圖片"
                className={styles.groupImg}
              />
            </div>
            <div className="col-3">英雄聯盟政大盃第十屆</div>
            <div className="col-2">2024/08/23 13:00</div>
            <div className="col-2">3/5</div>
            <div className="col-2">參加者</div>
            <div className="col-1">
              <div className="d-flex gap-2">
                <button className={styles.actionBtn}>
                  <i className="bi bi-pencil-square"></i>
                </button>
                <button className={styles.actionBtn}>
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <div className={`${styles.mobileLayout} d-block d-md-none`}>
            <div className={styles.mobileImgWrapper}>
              <img
                src="https://images.pexels.com/photos/7862360/pexels-photo-7862360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="揪團圖片"
                className={styles.groupImg}
              />
            </div>
            <div className={styles.mobileInfo}>
              <div className={styles.mobileTitle}>英雄聯盟政大盃第十屆</div>
              <div className={styles.mobileDetails}>
                <div className={styles.mobileStats}>
                  <span>
                    <i className="bi bi-clock"></i> 2024/08/23 13:00
                  </span>
                  <span>
                    <i className="bi bi-people"></i> 3/5
                  </span>
                  <span>
                    <i className="bi bi-person-badge"></i> 參加者
                  </span>
                </div>
                <div className={styles.mobileActions}>
                  <button className={styles.actionBtn}>
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button className={styles.actionBtn}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GroupList
