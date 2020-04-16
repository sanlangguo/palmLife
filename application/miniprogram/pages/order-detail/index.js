import API from '../../api/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const id = options.id;
    if (id) {
      const res = await API.getOrderDetail(id);
      res.data.map(async item => {
        item.status = item.active == 0 ? '待下单' : item.active == 1 ? '待收货': '已收货';
        item.goods.map(async goods => {
          const data = [goods.fileId];
          const fileRes = await API.getTempFileURL(data);
          goods.coverImg = fileRes.fileList[0].tempFileURL;
          item.totalPrice = goods.count * goods.originPrice;
        })
      })
      console.log(res.data, '------')
      this.setData({
        order: res.data,
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 播放商户电话
   */
  async makePhoneCall() {
    const res = await API.getMerchantInfo();
    const merchant = wx.getStorageSync('merchant');
    let phone = '';
    if (!merchant) {
      wx.setStorageSync('merchant', res.data[0]);
      phone = `${res.data[0].phone}`
    } else {
      phone =  `${merchant.phone}`
    }
    wx.makePhoneCall({
      phoneNumber: phone
    })
  }
})