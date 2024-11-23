import React, { useState } from 'react'
import { X } from 'lucide-react'

const PrivacyPolicy = () => {
  const [show, setShow] = useState(false)

  const handleShow = (e) => {
    e.preventDefault()
    setShow(true)
  }

  return (
    <>
      <button
        onClick={handleShow}
        className="btn btn-link p-0"
        style={{
          color: 'rgba(147, 197, 253, 0.8)',
          textDecoration: 'none',
        }}
      >
        隱私政策
      </button>

      {show && (
        <div
          className="modal d-block"
          onClick={(e) => e.target === e.currentTarget && setShow(false)}
          style={{
            backgroundColor: 'rgba(56, 29, 89, 0.5)',
            backdropFilter: 'blur(8px)',
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-dialog-scrollable modal-lg modal-dialog-centered">
            <div
              className="modal-content"
              style={{
                background: 'rgba(97, 4, 4, 0.2)',
                border: '2px solid rgba(147, 197, 253, 0.9)',
                backdropFilter: 'blur(8px)',
                color: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              <div className="modal-header border-0">
                <div>
                  <h3
                    className="modal-title fs-4 mb-1"
                    style={{ color: '#93c5fd' }}
                  >
                    隱私政策
                  </h3>
                  <small>更新日期：2024年09月21日</small>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShow(false)}
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body">
                <p>
                  本網站非常重視您的隱私權。為了讓您能夠安心使用我們的服務，特此說明我們對於會員個人資料的收集、使用及保護方式。本隱私政策適用於本網站所提供的所有服務。
                </p>

                <div className="mb-4">
                  <h4
                    className="fs-5 mb-3"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    一、資料收集目的
                  </h4>
                  <p>我們收集您的個人資料，旨在：</p>
                  <ul className="list-unstyled ps-3">
                    <li className="mb-2">
                      • 提供會員服務，如註冊、身份驗證與客製化功能
                    </li>
                    <li className="mb-2">
                      • 優化使用者體驗，改善本網站的內容與功能
                    </li>
                    <li className="mb-2">
                      • 向您提供相關的活動通知或行銷資訊（需經您的同意）
                    </li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h4
                    className="fs-5 mb-3"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    二、收集的資料範圍
                  </h4>
                  <h5
                    className="fs-6 mb-2"
                    style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  >
                    必要資料
                  </h5>
                  <p>當您註冊或填寫表單時，我們可能會收集以下資料：</p>
                  <ul className="list-unstyled ps-3">
                    <li className="mb-2">• 姓名</li>
                    <li className="mb-2">• 聯絡方式（如電子郵件、電話號碼）</li>
                    <li className="mb-2">• 地址</li>
                    <li className="mb-2">• 出生日期</li>
                    <li className="mb-2">
                      • 身份證字號（如適用，僅用於身份驗證或法律需求）
                    </li>
                  </ul>

                  <h5
                    className="fs-6 mb-2"
                    style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  >
                    其他資料
                  </h5>
                  <p>根據您的使用情境，我們可能會收集：</p>
                  <ul className="list-unstyled ps-3">
                    <li className="mb-2">
                      • 設備資訊（如IP地址、裝置類型、瀏覽器類型）
                    </li>
                    <li className="mb-2">• 使用記錄（如登入時間、瀏覽頁面）</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h4
                    className="fs-5 mb-3"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    三、資料使用方式
                  </h4>
                  <p>您提供的個人資料僅用於下列目的：</p>
                  <ul className="list-unstyled ps-3">
                    <li className="mb-2">• 提供、維護及改善本網站服務</li>
                    <li className="mb-2">• 防止不當行為（如詐欺或濫用行為）</li>
                    <li className="mb-2">• 法律規定或政府要求的其他用途</li>
                  </ul>
                  <p>
                    除非獲得您的同意或符合法律規定，我們不會將您的個人資料提供給第三方。
                  </p>
                </div>

                <div className="mb-4">
                  <h4
                    className="fs-5 mb-3"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    四、資料保存期限
                  </h4>
                  <p>
                    我們會在您使用本網站期間內保留您的個人資料，並於服務終止後，根據法律規定刪除或匿名化處理。
                  </p>
                </div>

                <div className="mb-4">
                  <h4
                    className="fs-5 mb-3"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    五、資料分享與第三方合作
                  </h4>
                  <p>我們承諾不會販售、交換或出租您的個人資料予任何第三方。</p>
                  <p>在必要時，我們可能將您的資料提供給以下單位：</p>
                  <ul className="list-unstyled ps-3">
                    <li className="mb-2">
                      • 與本網站合作的服務提供商（如付款處理、寄送通知的第三方）
                    </li>
                    <li className="mb-2">
                      • 司法機關或其他有權機構（僅於法律規定或合法要求時提供）
                    </li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h4
                    className="fs-5 mb-3"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    六、您的權利
                  </h4>
                  <ul className="list-unstyled ps-3">
                    <li className="mb-2">
                      • 您可隨時查詢、更正或刪除您的個人資料
                    </li>
                    <li className="mb-2">
                      • 您有權拒絕我們使用您的資料於行銷用途
                    </li>
                    <li className="mb-2">
                      • 若您對本網站的資料處理有任何疑問，請隨時聯繫我們
                    </li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h4
                    className="fs-5 mb-3"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    七、資料安全保護
                  </h4>
                  <p>
                    我們採用適當的技術與管理措施，確保您的個人資料不會遭到未經授權的存取、修改或洩露。
                  </p>
                </div>

                <div className="mb-4">
                  <h4
                    className="fs-5 mb-3"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    八、政策更新
                  </h4>
                  <p>
                    我們可能會隨時更新本隱私政策，更新後的內容將公布於本網站，並以明顯方式通知您。
                  </p>
                </div>

                <div className="mb-4">
                  <h4
                    className="fs-5 mb-3"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    九、聯繫我們
                  </h4>
                  <p>
                    若您對本隱私政策有任何疑問或需要協助，請透過以下方式聯繫我們：
                  </p>
                  <div className="ps-3">
                    <p className="mb-2">
                      <strong>Email：</strong> guru@gmail.com
                    </p>
                    <p className="mb-0">
                      <strong>電話：</strong> +886-2324-5688
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PrivacyPolicy
