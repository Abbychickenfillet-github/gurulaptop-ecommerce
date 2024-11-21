// components/dashboard/LoadingSpinner.js
import React from 'react'
import { PacmanLoader } from 'react-spinners'

export const LoadingSpinner = ({ show }) => {
  console.log('LoadingSpinner rendered', { show })
  if (!show) return null

  return
  // <div
  //   className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-black bg-opacity-25"
  //   style={{ zIndex: 9999 }}
  // >
  //   <PacmanLoader
  //     color="#d8d8d8" // 你可以換成 "#e8e4e4" 或其他顏色
  //     // 灰色 #d8d8d8
  //     // 粉色 #f2dcdc
  //     // loading={loading}
  //     size={100} // Pacman 的大小
  //     aria-label="Loading Spinner"
  //   />
  // </div>
}
//
// export default LoadingSpinner;
