// POST
const AllParams = {
  MerchantID: '3002607',
  MerchantTradeNo: 'od1715561901749',
  MerchantTradeDate: '2024/05/13 08:58:21',
  PaymentType: 'aio',
  EncryptType: 1,
  TotalAmount: 300,
  TradeDesc: '商店線上付款',
  ItemName: '訂單編號25f923b5-07e9-46b9-bfbf-13ef3bb7be15商品一批',
  ReturnURL: 'process.env.NEXT_PUBLIC_API_BASE_URL/ecpay/result',
  ChoosePayment: 'ALL',
  OrderResultURL: 'process.env.NEXT_PUBLIC_API_BASE_URL/api/ecpay/result',
  CheckMacValue: 'ED293D7B8768BE934608D14FD869E2DB3D6F802198FC98555BA9262A77816971'
}