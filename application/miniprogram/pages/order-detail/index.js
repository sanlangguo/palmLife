import API from '../../api/index';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order: [],
    message: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const id = options.id;
    if (id) {
      const res = await API.getOrderDetail(id);
      let title = '';
      res.data.map(async item => {
        item.status = item.active == 0 ? '待下单' : item.active == 1 ? '待收货': '已收货';
        title = item.active == 0 ? '待付款的订单' : '订单详情';
        item.goods.map(async goods => {
          const data = [goods.fileId];
          const fileRes = await API.getTempFileURL(data);
          goods.coverImg = fileRes.fileList[0].tempFileURL;
          item.totalPrice = goods.count * goods.originPrice;
        })
      })
      this.setData({
        order: res.data,
        id: options.id
      })
      wx.setNavigationBarTitle({
        title
      })
    } else {
      wx.reLaunch({
        url: '../goods-list/index',
      })
    }
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
  },

  /**
   * 修改留言
   */
  async onChangeMessage(event) {
    const { id } = this.data
    const data = {
      message: event.detail
    }
    await API.updateOrder(id, data);    
  },

  /**
   * 提交订单
   */
  async onSubmit() {
    const { id } = this.data
    const data = {
      active: 1,
      createTime: new Date().getTime()
    }
    const res = await API.updateOrder(id, data);
    if (res.stats.updated == 1) {
      Toast({
        type: 'success',
        message: '提交成功',
        onClose: () => {
          wx.reLaunch({
            url: '../goods-list/index',
          })
        }
      });
    }
  }
})