/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3005',
      },
      // 添加部署後的域名
      {
        protocol: 'https',
        hostname: 'guru-laptop-lavendarbug-vqq.zeabur.app',
      },
    ],
    unoptimized: true,
  },
  // 移除 output: 'export'，因為這會影響 SSR 和 API 路由
  trailingSlash: true,
  distDir: 'dist'
  // avoid cors with proxy
  // async rewrites() {
  //   // 根據環境選擇 API 地址
  //   const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3005';
    
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: `${apiUrl}/:path*`, // 使用環境變數
  //     },
  //   ]
  // },
  // async redirects() {
  //   return [
  //     {
  //       source: '/chatroom',
  //       destination: '/chat',
  //       permanent: true,
  //     },
  //   ]
  // },
}

module.exports = nextConfig
