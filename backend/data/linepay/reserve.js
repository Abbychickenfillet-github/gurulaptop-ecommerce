// 根據環境動態選擇基礎 URL
const baseUrl = process.env.NODE_ENV === 'production' 
  ? 'https://yunlavendar-guru-smart-laptop.zeabur.app'
  : 'http://localhost:3000'

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
