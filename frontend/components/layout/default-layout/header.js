import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import Swal from 'sweetalert2'
import { useRouter } from 'next/router'
import { MessageCircle, ShoppingCart, Menu } from 'lucide-react'

export default function Header() {
  const { auth, logout } = useAuth()
  const { isAuth, userData } = auth
  const [user_id, setUserId] = useState('')
  const router = useRouter()
  const getDefaultImage = (gender) => {
    switch (gender) {
      case 'male':
        return '/signup_login/undraw_profile_2.svg'
      case 'female':
        return '/signup_login/undraw_profile_1.svg'
      default:
        return '/Vector.svg'
    }
  }

  const [image_path, setImagePath] = useState(
    () => auth?.userData?.image_path || getDefaultImage(auth?.userData?.gender)
  )

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const handleLogout = async () => {
    try {
      const result = await Swal.fire({
        title: '確定要登出嗎？',
        text: '您即將退出當前帳戶',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#805AF5',
        cancelButtonColor: '#d33',
        confirmButtonText: '確定登出',
        cancelButtonText: '取消',
      })

      if (!result.isConfirmed) return

      await logout()

      await Swal.fire({
        title: '登出成功',
        text: '您已成功登出',
        timer: 1000,
        icon: 'success',
        confirmButtonColor: '#805AF5',
      })

      setTimeout(() => {
        router.push('/member/login')
      }, 1000)
    } catch (error) {
      console.error('登出失敗:', error)
      Swal.fire({
        title: '登出失敗',
        text: '請稍後再試',
        timer: 1000,
        icon: 'error',
        confirmButtonColor: '#805AF5',
      })
    }
  }

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth > 768) {
        setIsMenuOpen(false)
      }
    }

    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  useEffect(() => {
    if (user_id) {
      fetch(`http://localhost:3005/api/header`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user_id,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          // 使用相同的 getDefaultImage 函數
          setImagePath(data?.image_path || getDefaultImage(data?.gender))
        })
       
    }

    document.body.style.paddingTop = '75px'
    return () => {
      document.body.style.paddingTop = '0px'
    }
  }, [user_id, auth?.userData?.gender, auth?.userData?.image_path])

  useEffect(() => {
    if (userData && userData.user_id) {
      setUserId(userData.user_id)
    } else {
      setUserId(null)
    }
    document.body.style.paddingTop = isMobile ? '60px' : '75px'
    return () => {
      document.body.style.paddingTop = '0px'
    }
  }, [userData, isMobile])

  const navItems = [
    { name: '首頁', path: '/' },
    { name: '產品', path: '/product' },
    { name: '比較', path: '/product/compare' },
    { name: '活動', path: '/event' },
    { name: '揪團', path: '/group' },
    { name: '部落格', path: '/blog' },
  ]

  return (
    <header className="tech-nav">
      {isMobile ? (
        <>
          <div className="mobile-header">
            <Link href="/" className="logo-link">
              <img src="/logo.svg" alt="Logo" className="logo" />
            </Link>

            <div className="mobile-controls">
              <button
                className="menu-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="icon" size={24} />
              </button>
            </div>
          </div>

          <div
            className={`nav-menu ${isMenuOpen ? 'open' : ''}`}
            style={{ zIndex: '1000' }}
          >
            <nav className="nav-links">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`nav-item ${
                    router.pathname === item.path ? 'active' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                  style={{ textDecoration: 'none' }}
                >
                  <span>{item.name}</span>
                </Link>
              ))}
              {isAuth && (
                <>
                  <div className="mobile-icons">
                    <Link href="/dashboard" className="icon-wrapper">
                      <div className="user-avatar">
                        <img
                          src={
                            auth?.userData?.image_path ||
                            (auth?.userData?.gender === 'male'
                              ? '/signup_login/undraw_profile_2.svg'
                              : auth?.userData?.gender === 'female'
                              ? '/signup_login/undraw_profile_1.svg'
                              : '/Vector.svg')
                          }
                          alt="user-avatar"
                        />
                      </div>
                    </Link>
                    <Link href="/chatroom" className="icon-wrapper">
                      <MessageCircle className="icon" size={24} />
                    </Link>
                    <Link href="/cart" className="icon-wrapper">
                      <ShoppingCart className="icon" size={24} />
                    </Link>
                  </div>
                  <button className="mobile-logout-btn" onClick={handleLogout}>
                    登出
                  </button>
                </>
              )}
            </nav>
          </div>
        </>
      ) : (
        <div className="nav-container">
          <div className="nav-left">
            <Link href="/" className="logo-link">
              <img src="/logo.svg" alt="Logo" className="logo" />
            </Link>
          </div>

          <div className="nav-center">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-item ${
                  router.pathname === item.path ? 'active' : ''
                }`}
                style={{ textDecoration: 'none' }}
              >
                <span>{item.name}</span>
                {router.pathname === item.path && (
                  <div className="active-indicator" />
                )}
              </Link>
            ))}
          </div>

          <div className="nav-right">
            {isAuth ? (
              <div className="auth-section">
                <Link href="/dashboard">
                  <div className="user-avatar">
                    <img
                      src={
                        auth?.userData?.image_path ||
                        getDefaultImage(auth?.userData?.gender)
                      }
                      alt="User"
                    />
                  </div>
                </Link>
                <Link href="/chatroom" className="icon-wrapper">
                  <MessageCircle className="icon" size={24} />
                </Link>
                <Link href="/cart" className="icon-wrapper">
                  <ShoppingCart className="icon" size={24} />
                </Link>
                <button className="logout-btn" onClick={handleLogout}>
                  登出
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link href="/member/login">
                  <button className="auth-btn login">登入</button>
                </Link>
                <Link href="/member/signup">
                  <button className="auth-btn signup">註冊</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .tech-nav {
          background: linear-gradient(
            90deg,
            rgba(15, 5, 30, 0.92) 0%,
            rgba(20, 10, 40, 0.92) 50%,
            rgba(15, 5, 30, 0.92) 100%
          );
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(128, 90, 245, 0.15);
          position: fixed;
          width: 100%;
          top: 0;
          z-index: 999;
        }

        .nav-container {
          max-width: 1800px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 3rem;
          height: 75px;
          padding: 0.5rem 4rem;
        }

        .nav-left {
          justify-self: start;
        }

        .logo {
          height: 45px;
          filter: drop-shadow(0 0 8px rgba(128, 90, 245, 0.3));
          transition: all 0.3s ease;
        }

        .logo:hover {
          filter: drop-shadow(0 0 15px rgba(128, 90, 245, 0.6));
          transform: scale(1.05);
        }

        .nav-center {
          display: flex;
          justify-content: center;
          gap: 3rem;
        }

        .nav-item {
          position: relative;
          padding: 0.5rem 0;
          transition: all 0.3s ease;
          text-decoration: none !important;
        }

        .nav-item span {
          color: rgba(255, 255, 255, 0.85);
          font-size: 1rem;
          font-weight: 500;
          letter-spacing: 0.8px;
          transition: all 0.3s ease;
        }

        .nav-item:hover span {
          color: #805af5;
          text-shadow: 0 0 15px rgba(128, 90, 245, 0.5);
        }

        .nav-item.active span {
          color: #805af5;
          text-shadow: 0 0 20px rgba(128, 90, 245, 0.6);
        }

        .active-indicator {
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            #805af5,
            #9d7af5,
            #805af5,
            transparent
          );
          background-size: 200% auto;
          animation: gradient 3s linear infinite;
          box-shadow: 0 0 10px rgba(128, 90, 245, 0.5),
            0 0 20px rgba(128, 90, 245, 0.3);
        }

        @keyframes gradient {
          0% {
            background-position: 200% center;
          }
          100% {
            background-position: -200% center;
          }
        }

        .nav-right {
          justify-self: end;
          display: flex;
          align-items: center;
          gap: 1.8rem;
        }

        .auth-section {
          display: flex;
          align-items: center;
          gap: 1.8rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid rgba(128, 90, 245, 0.5);
          transition: all 0.3s ease;
          filter: drop-shadow(0 0 8px rgba(128, 90, 245, 0.3));
        }

        .user-avatar:hover {
          transform: scale(1.05);
          border-color: #805af5;
          filter: drop-shadow(0 0 15px rgba(128, 90, 245, 0.6));
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          filter: drop-shadow(0 0 8px rgba(128, 90, 245, 0.3));
        }

        .icon-wrapper:hover {
          filter: drop-shadow(0 0 15px rgba(128, 90, 245, 0.6));
          transform: scale(1.05);
        }

        .icon {
          color: rgba(255, 255, 255, 0.85);
          height: 24px;
          width: 24px;
        }

        .auth-btn,
        .logout-btn {
          padding: 0.5rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          letter-spacing: 0.5px;
        }

        .login {
          background: transparent;
          color: #fff;
          border: 1px solid rgba(128, 90, 245, 0.5);
          margin-right: 1rem;
          filter: drop-shadow(0 0 8px rgba(128, 90, 245, 0.3));
        }

        .signup,
        .logout-btn {
          background: linear-gradient(135deg, #805af5, #6a48d1);
          color: #fff;
          border: none;
          filter: drop-shadow(0 0 8px rgba(128, 90, 245, 0.3));
        }

        .auth-btn:hover,
        .logout-btn:hover {
          transform: translateY(-2px);
          filter: drop-shadow(0 0 15px rgba(128, 90, 245, 0.6));
          background: linear-gradient(135deg, #9d7af5, #805af5);
        }

        /* Mobile Styles */
        .mobile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 60px;
          padding: 0 1rem;
          width: 100%;
          background: rgba(15, 5, 30, 0.98);
        }

        .mobile-header .logo {
          height: 35px;
        }

        .mobile-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .menu-btn {
          background: transparent;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.85);
        }

        .nav-menu {
          position: fixed;
          top: 60px;
          left: 0;
          width: 100%;
          height: calc(100vh - 60px);
          overflow-y: auto;
          background: rgba(15, 5, 30, 0.98);
          transition: transform 0.3s ease-in-out;
          transform: translateX(-100%);
          padding: 2rem 0;
          z-index: 1000;
        }

        .nav-menu.open {
          transform: translateX(0);
        }

        .nav-links {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .nav-links .nav-item {
          width: 100%;
          text-align: center;
          padding: 0.5rem 0;
          text-decoration: none !important;
        }

        .nav-links .nav-item span {
          font-size: 1.2rem;
          font-weight: 500;
        }

        .mobile-icons {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin: 1rem 0;
          width: 100%;
        }

        .mobile-icons .icon-wrapper {
          text-decoration: none;
        }

        .mobile-icons .user-avatar {
          width: 32px;
          height: 32px;
        }

        .mobile-icons .icon {
          width: 24px;
          height: 24px;
        }

        .mobile-logout-btn {
          margin-top: 1rem;
          padding: 0.5rem 1.5rem;
          background: linear-gradient(135deg, #805af5, #6a48d1);
          color: #fff;
          border: none;
          border-radius: 8px;
          width: 40%;
          cursor: pointer;
          font-size: 1rem;
          filter: drop-shadow(0 0 8px rgba(128, 90, 245, 0.3));
        }

        .mobile-logout-btn:hover {
          filter: drop-shadow(0 0 15px rgba(128, 90, 245, 0.6));
          background: linear-gradient(135deg, #9d7af5, #805af5);
        }

        @media (max-width: 1280px) {
          .nav-container {
            padding: 0.5rem 2rem;
          }

          .nav-center {
            gap: 2rem;
          }
        }
      `}</style>
    </header>
  )
}
