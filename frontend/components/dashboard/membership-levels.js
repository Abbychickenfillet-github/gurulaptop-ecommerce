import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import ProgressBar from 'react-bootstrap/ProgressBar'
// 匯出會員等級函式型元件
export default function MembershipLevels() {
  const { auth } = useAuth()
  // 從useAuth() Hook（函式型元件的方法）中解構出auth狀態
  const [membershipData, setMembershipData] = useState({
    totalSpent: 0,
    nextLevelRequired: 0,
    created_at: null,
    daysToThreeYears: 0,
  })
  // 為什麼這邊是沒有就創建(!membershipData.created_at) return [0, 0, 0, 0] 只要用戶登入不是應該都要有資訊了嗎
  const calculateDateProgress = () => {
    if (!membershipData.created_at) return [0, 0, 0, 0]

    const totalDays = 365 * 3 // 3年的總天數
    const daysPassed = totalDays - membershipData.daysToThreeYears
    const progress = (daysPassed / totalDays) * 100

    if (progress >= 75) return [40, 30, 20, 10]
    if (progress >= 50) return [35, 20, 20, 0]
    if (progress >= 25) return [25, 25, 0, 0]
    return [progress, 0, 0, 0]
  }

  useEffect(() => {
    const fetchMembershipData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/membership/${auth?.userData?.user_id}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        setMembershipData(() => ({
          ...result,
          totalSpent: Number(result.totalSpent) || 0,
          nextLevelRequired: Number(result.nextLevelRequired) || 0,
        }))
      } catch (error) {
        console.error('Error fetching membership data:', error)
      }
    }

    if (auth?.userData?.user_id) {
      fetchMembershipData()
    }
  }, [auth?.userData?.user_id])

  const totalSpent = membershipData.totalSpent
  const getMembershipLevel = (totalSpent) => {
    // 確保 totalSpent 是數字
    const spent = Number(totalSpent)

    if (spent >= 100000) {
      return '鑽石會員'
    } else if (spent >= 70000) {
      return '金牌會員'
    } else if (spent >= 40000) {
      return '銀牌會員'
    } else if (spent >= 20000) {
      return '銅牌會員'
    } else if (spent >= 0) {
      return '消費金額未達銅牌2萬'
    } else {
      return '帳號有問題，請聯繫客服'
    }
  }
  const calculateProgress = () => {
    const total = membershipData.totalSpent
    // 計算每個區段的進度值
    if (total >= 100000) {
      return [40, 30, 30] // 總計 100%
    } else if (total >= 70000) {
      return [35, 20, 20] // 總計 75%
    } else if (total >= 40000) {
      return [25, 25, 0] // 總計 50%
    } else if (total >= 20000) {
      return [25, 0, 0] // 總計 25%
    }
    // 低於 20000 的情況
    const progress = (total / 20000) * 25
    return [progress, 0, 0, 0]
  }

  const getVariants = () => {
    return ['success', 'warning', 'danger', 'primary'] // 固定的三種顏色
  }

  // 使用範例:

  const levels = [
    {
      name: '銅牌會員',
      benefits:
        '可於文章區發表文章、參加活動、包膜優惠價(打95折，價值1,000元的包膜等於省50元)',
      criteria: '消費金額達 NT$20,000',
    },
    {
      name: '銀牌會員',
      benefits:
        '可於文章區發表文章、參加活動、包膜優惠價(打95折，價值1,000元的包膜等於省50元)',
      criteria: '消費金額達 NT$40,000',
    },
    {
      name: '金牌會員',
      benefits:
        '可於文章區發表文章、參加活動、送免費新機包膜服務、三節打95折(等於購買30,000元的電腦可省500)、電腦包客製化姓名刺繡服務(價值120元)',
      criteria: '消費金額達 NT$70,000',
    },
    {
      name: '鑽石會員',
      benefits:
        '可於文章區發表文章、參加活動、免費包膜服務(價值1,000元)、日後購買新機免費升級延長保固半年、生日禮(抽獎券-可抽筆電支架)',
      criteria: '消費金額達 NT$100,000 及以上',
    },
  ]

  return (
    <div
      className="container py-5 "
      style={{
        background: 'linear-gradient(135deg, #6C4CCE 0%, #805AF5 100%)',
      }}
    >

      <div className="row mb-4 ">
        <div className="col">
          <h2 className="text-white mb-0 d-flex justify-content-center align-items-center">
            <span className="diamond-title me-2"></span>
            <span className="membership-title">會員等級</span>
            <span className="diamond-title ms-2"></span>
          </h2>
          <div className="d-flex justify-content-center">
            <h3 className="text-white">{getMembershipLevel(totalSpent)}</h3>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col">
          <h3 className="text-white d-flex justify-content-center">
             累計消費: NT${Number(membershipData.totalSpent || 0).toLocaleString()}
          </h3>
          <p className="text-white">
            升級至 <strong>銅牌會員</strong>，還需消費 NT$
            {membershipData.nextLevelRequired.toLocaleString()}
          </p>
          <ProgressBar 
            style={{ 
              height: '20px', 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              overflow: 'hidden'
            }}
          >
            {calculateProgress().map((progress, index) => (
              <ProgressBar
                animated
                key={index}
                striped={index % 2 === 0}
                variant={getVariants()[index]}
                now={progress}
                style={{
                  background: index === 0 ? 'linear-gradient(90deg, #E0B0FF, #805AF5)' : 
                             index === 1 ? 'linear-gradient(90deg, #C0C0C0, #808080)' :
                             index === 2 ? 'linear-gradient(90deg, #FFD700, #FFA500)' :
                             'linear-gradient(90deg, #B9F2FF, #4169E1)',
                  borderRadius: '10px'
                }}
              />
            ))}
          </ProgressBar>
        </div>
      </div>

      <div className="row mb-5 mt-5">
        <div className="col">
          <h3 className="text-white d-flex justify-content-center">
            註冊日期: {new Date(membershipData.created_at).toLocaleDateString()}
          </h3>
          <p className="text-white">
            距離3年會員到期還有: {membershipData.daysToThreeYears} 天
          </p>
          <ProgressBar>
            {calculateDateProgress().map((progress, index) => (
              <ProgressBar
                key={index}
                animated
                striped={index % 2 === 0}
                variant={getVariants()[index]}
                now={progress}
              />
            ))}
          </ProgressBar>
        </div>
      </div>

      {/* 以下是卡片 */}
      <div className="row g-4">
        {levels.map((level, index) => {
          // 根據會員等級名稱決定CSS類別
          // 這是一個巢狀三元運算子，類似switch的功能
          // 如果 level.name === '銅牌會員' 則 className = 'bronze'
          // 如果不是銅牌，則檢查是否為銀牌，以此類推
          let levelClass = '';
          if (level.name === '銅牌會員') {
            levelClass = 'bronze';
          } else if (level.name === '銀牌會員') {
            levelClass = 'silver';
          } else if (level.name === '金牌會員') {
            levelClass = 'gold';
          } else if (level.name === '鑽石會員') {
            levelClass = 'diamond';
          }
          
          // 檢查是否為當前用戶的會員等級，如果是則加上 active-card 類別
          const isActiveCard = level.level === auth?.userData?.level ? 'active-card' : '';
          
          return (
            <div key={index} className="col">
              <div
                className={`membership-card ${levelClass} p-4 d-flex flex-column justify-content-center ${isActiveCard}`}
              >
                {/* SVG 星星圖標解析 */}
              <div className="membership-icon">
                <svg viewBox="0 0 24 24" fill="none" className="icon-svg">
                  <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"/>
                </svg>
              </div>

              <h3 className="text-white mb-3 z-3">{level.name}</h3>
              <p className={`text-white flex-grow-1 z-2 ${
                level.name === getMembershipLevel(totalSpent) ? 
                  level.name === '銅牌會員' ? 'bronze-glow' :
                  level.name === '銀牌會員' ? 'silver-glow' :
                  level.name === '金牌會員' ? 'gold-glow' :
                  level.name === '鑽石會員' ? 'diamond-glow' : '' : ''
              }`}>
                {level.criteria}
              </p>
              <p className={`text-white flex-grow-1 z-2 small ${
                level.name === getMembershipLevel(totalSpent) ? 
                  level.name === '銅牌會員' ? 'bronze-glow' :
                  level.name === '銀牌會員' ? 'silver-glow' :
                  level.name === '金牌會員' ? 'gold-glow' :
                  level.name === '鑽石會員' ? 'diamond-glow' : '' : ''
              }`}>
                {level.benefits}
              </p>
            </div>
          </div>
          );
        })}
      </div>

      <style jsx>{`
        .membership-card {
          // background: rgba(148, 54, 54, 0.1);
          // backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          height: 100%;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        .membership-card.bronze {
          background: linear-gradient(135deg, rgba(205, 127, 50, 0.3), rgba(184, 134, 11, 0.3)) !important;
          backdrop-filter: blur(15px) !important;
          border: 1px solid rgba(255, 215, 0, 0.4) !important;
          box-shadow: 0 4px 20px rgba(255, 215, 0, 0.2) !important;
        }
        .membership-card.silver {
          background: linear-gradient(135deg, rgba(192, 192, 192, 0.3), rgba(128, 128, 128, 0.3)) !important;
          backdrop-filter: blur(15px) !important;
          border: 1px solid rgba(230, 230, 250, 0.4) !important;
          box-shadow: 0 4px 20px rgba(230, 230, 250, 0.2) !important;
        }
        .membership-card.gold {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 165, 0, 0.3)) !important;
          backdrop-filter: blur(15px) !important;
          border: 1px solid rgba(255, 255, 0, 0.4) !important;
          box-shadow: 0 4px 20px rgba(255, 255, 0, 0.2) !important;
        }
        .membership-card.diamond {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(200, 200, 255, 0.3)) !important;
          backdrop-filter: blur(15px) !important;
          border: 1px solid rgba(255, 255, 255, 0.4) !important;
          box-shadow: 0 4px 20px rgba(255, 255, 255, 0.3) !important;
        }
        .membership-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            ellipse at center,
            rgba(255, 255, 255, 0.3) 0%,
            rgba(255, 255, 255, 0) 70%
          );
          transform: rotate(-45deg);
          pointer-events: none;
        }
        .active-card {
          opacity: 1;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
          transform: scale(1.02);
        }

        .diamond-title {
          width: 12px;
          height: 12px;
          background-color: #805af5;
          transform: rotate(45deg);
          display: inline-block;
          box-shadow: 0 0 8px rgba(128, 90, 245, 0.6);
          animation: diamondPulse 2s ease-in-out infinite alternate;
        }
        .membership-title {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(45deg, #E0B0FF, #805AF5, #FFFFFF);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 3s ease-in-out infinite alternate;
          text-shadow: 0 0 20px rgba(224, 176, 255, 0.5);
        }
        @keyframes diamondPulse {
          0% {
            box-shadow: 0 0 8px rgba(128, 90, 245, 0.6);
            transform: rotate(45deg) scale(1);
          }
          100% {
            box-shadow: 0 0 16px rgba(128, 90, 245, 1);
            transform: rotate(45deg) scale(1.1);
          }
        }
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }
        .membership-icon {
          position: absolute;
          top: 8px;
          left: 8px;
          width: 24px;
          height: 24px;
          z-index: 10;
        }
        .icon-svg {
          width: 100%;
          height: 100%;
          color: #E0B0FF;
          filter: drop-shadow(0 0 8px rgba(224, 176, 255, 0.6));
          transition: all 0.3s ease;
        }
        .membership-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        }
        .membership-card.bronze:hover {
          box-shadow: 0 8px 30px rgba(255, 215, 0, 0.4);
        }
        .membership-card.silver:hover {
          box-shadow: 0 8px 30px rgba(230, 230, 250, 0.4);
        }
        .membership-card.gold:hover {
          box-shadow: 0 8px 30px rgba(255, 255, 0, 0.4);
        }
        .membership-card.diamond:hover {
          box-shadow: 0 8px 30px rgba(0, 191, 255, 0.5);
        }
        .membership-card:hover .icon-svg {
          color: #FFFFFF;
          transform: scale(1.1);
          filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.8));
        }
        .bronze-glow {
          animation: bronzeGlow 2s ease-in-out infinite alternate;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
        }
        .silver-glow {
          animation: silverGlow 2s ease-in-out infinite alternate;
          text-shadow: 0 0 10px rgba(192, 192, 192, 0.8);
        }
        .gold-glow {
          animation: goldGlow 2s ease-in-out infinite alternate;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
        }
        .diamond-glow {
          animation: diamondGlow 2s ease-in-out infinite alternate;
          text-shadow: 0 0 10px rgba(0, 191, 255, 0.8);
        }
        @keyframes bronzeGlow {
          0% {
            text-shadow: 0 0 5px rgba(255, 215, 0, 0.6);
            color: #FFFFFF;
          }
          100% {
            text-shadow: 0 0 15px rgba(255, 215, 0, 1);
            color: #FFD700;
          }
        }
        @keyframes silverGlow {
          0% {
            text-shadow: 0 0 5px rgba(192, 192, 192, 0.6);
            color: #FFFFFF;
          }
          100% {
            text-shadow: 0 0 15px rgba(192, 192, 192, 1);
            color: #C0C0C0;
          }
        }
        @keyframes goldGlow {
          0% {
            text-shadow: 0 0 5px rgba(255, 215, 0, 0.6);
            color: #FFFFFF;
          }
          100% {
            text-shadow: 0 0 15px rgba(255, 215, 0, 1);
            color: #FFD700;
          }
        }
        @keyframes diamondGlow {
          0% {
            text-shadow: 0 0 5px rgba(0, 191, 255, 0.6);
            color: #FFFFFF;
          }
          100% {
            text-shadow: 0 0 15px rgba(0, 191, 255, 1);
            color: #00BFFF;
          }
        }
      `}</style>
    </div>
  )
}
