// 前端網址只由環境變數 FRONTEND_URL 決定，沒設時使用本機預設值
const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'

let options = {
  amount: 1500,
  currency: 'TWD',
  orderId: '20211216003',
  packages: [
    {
      id: 'c99abc79-3b29-4f40-8851-bc618ca57856',
      amount: 1500,
      products: [
        {
          name: 'Product Name1',
          quantity: 1,
          price: 500,
        },
        {
          name: 'Product Name2',
          quantity: 2,
          price: 500,
        },
      ],
    },
  ],
  redirectUrls: {
    confirmUrl: `${baseUrl}/pay-confirm`,
    cancelUrl: `${baseUrl}/pay-cancel`,
  },
}
