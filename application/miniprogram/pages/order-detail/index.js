import API from '../../api/index';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order: [],
    show: false,
    payMode: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const id = options.id;
    if (id) {
      this.setData({
        id: options.id
      })
    } else {
      wx.reLaunch({
        url: '../goods-list/index',
      })
    }
  },

  async onShow() {
    if (this.data.id) {
      const res = await API.getOrderDetail(this.data.id);
      let title = '';
      res.data.map(async item => {
        item.status = item.active == 1 ? '待下单' : item.active == 2 ? '待收货': '已收货';
        title = item.active == 1 ? '待付款的订单' : '订单详情';
        item.goods.map(async goods => {
          const data = [goods.fileId];
          const fileRes = await API.getTempFileURL(data);
          goods.coverImg = fileRes.fileList[0].tempFileURL;
          item.totalPrice = goods.count * goods.originPrice;
        })
      })
      this.setData({
        order: res.data,
      })
      wx.setNavigationBarTitle({
        title
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
    if (!this.data.payMode) {
      this.setData({
        show: true
      })
      return false
    }
    const { id, payMode } = this.data
    const data = {
      active: 2,
      updateTime: new Date().getTime(),
      payMode,
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
  },

  /**
   * 关闭付款方式弹出层
   */
  onClose() {
    this.setData({
      show: false
    })
  },

  /**
   * 选择付款方式
   */
  seleteaPayMode(e) {
    const payMode = e.currentTarget.dataset.pay;
    this.setData({
      payMode,
      show: false
    })
  }
})