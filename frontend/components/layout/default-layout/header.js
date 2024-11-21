import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import Swal from 'sweetalert2'
import { useRouter } from 'next/router'
import { MessageCircle } from 'lucide-react'
import { ShoppingCart } from 'lucide-react'

export default function Header() {
  const { auth, logout } = useAuth()
  const { isAuth, userData } = auth
  const [user_id, setUserId] = useState('')
  const router = useRouter()
  const [image_path, setImagePath] = useState('/Vector.svg')

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
          const defaultImage =
            data?.gender === 'male'
              ? 'signup_login/undraw_profile_2.svg'
              : data?.gender === 'female'
              ? 'signup_login/undraw_profile_1.svg'
              : '/Vector.svg'

          setImagePath(data?.image_path || defaultImage)
        })
    }

    document.body.style.paddingTop = '75px'
    return () => {
      document.body.style.paddingTop = '0px'
    }
  }, [user_id, auth?.userData?.image_path])

  useEffect(() => {
    if (userData && userData.user_id) {
      setUserId(userData.user_id)
    } else {
      setUserId(null)
    }
    // 動態設置 body 的 padding-top
    document.body.style.paddingTop = '75px'
    return () => {
      // 清除設置
      document.body.style.paddingTop = '0px'
    }
  }, [userData])

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
                  <img src={image_path} alt="User" />
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

      <style jsx>{`
        body {
          padding-top: 75px;
        }
        .tech-nav {
          background: linear-gradient(
            90deg,
            rgba(15, 5, 30, 0.92) 0%,
            rgba(20, 10, 40, 0.92) 50%,
            rgba(15, 5, 30, 0.92) 100%
          );
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(128, 90, 245, 0.15);
          padding: 0.5rem 4rem;
          position: fixed;
          width: 100%;
          top: 0;
          height: 75px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          z-index: 99999999999999999999;
        }

        .nav-container {
          max-width: 1800px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 3rem;
          height: 100%;
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
           {
          }
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
        @media (max-width: 1280px) {
          .tech-nav {
            padding: 0.5rem 2rem;
          }

          .nav-center {
            gap: 2rem;
          }
        }

        @media (max-width: 1024px) {
          .tech-nav {
            height: auto;
            padding: 0.5rem 1rem;
          }

          .nav-container {
            grid-template-columns: auto auto;
          }

          .nav-center {
            grid-column: 1 / -1;
            grid-row: 2;
            overflow-x: auto;
            justify-content: start;
            padding: 0.5rem 0;
            gap: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .nav-container {
            grid-template-columns: 1fr;
            justify-items: center;
            gap: 1rem;
          }

          .nav-left {
            justify-self: center;
          }

          .nav-right {
            display: flex;
            flex-direction: row;
            gap: 1rem;
            justify-content: center;
            margin-top: 1rem;
          }

          .auth-section {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .nav-center {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 1rem;
            justify-content: center;
            margin-top: 1rem;
          }

          .auth-buttons {
            display: flex;
            flex-direction: row;
            gap: 0.5rem;
          }

          .login {
            margin-right: 0;
          }
        }
      `}</style>
    </header>
  )
}
