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
    steps: [{
        text: '发起拼团',
      },
      {
        text: '邀请好友拼团',
      },
      {
        text: '拼团成功',
      }
    ],
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
        url: '../home/index',
      })
    }
  },

  async onShow() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    if (this.data.id) {
      const res = await API.getOrderDetail(this.data.id);
      let title = '';
      res.data.map(async item => {
        switch (item.active) {
          case 1:
            item.status = '待下单';
            break;
          case 2:
            item.status = '待成团';
            break;
          case 3:
            item.status = '待发货';
            break;
          case 4:
            item.status = '已收货';
            break;
          case 5:
            item.status = '拼团失败';
            break;
          default:
            break;
        }
        title = item.active == 1 ? '待付款的订单' : '订单详情';
        item.goods.map(async goods => {
          const data = [goods.fileId];
          const fileRes = await API.getTempFileURL(data);
          goods.coverImg = fileRes.fileList[0].tempFileURL;
          item.totalPrice = goods.count * goods.originPrice;
        })
      })
      console.log(res.data, 'order data')
      this.setData({
        order: res.data,
        payMode: res.data[0].payMode
      })
      wx.setNavigationBarTitle({
        title
      })
    }
    wx.hideLoading();
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
      phone = `${merchant.phone}`
    }
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },

  /**
   * 修改留言
   */
  async onChangeMessage(event) {
    const {
      id
    } = this.data
    const data = {
      message: event.detail
    }
    await API.updateOrder(id, data);
  },

  /**
   * 提交订单
   */
  async onSubmit() {
    wx.showLoading({
      title: '提交订单',
      mask: true
    })
    if (!this.data.payMode) {
      this.setData({
        show: true
      })
      return false
    }
    const {
      id,
      payMode,
      order
    } = this.data;
    const data = {
      active: order[0].active == 2 ? order[0].active : 3,
      updateTime: new Date().getTime(),
      payMode,
    }
    // 更新库存数量
    order[0].goods.map(async item => {
      const res = await API.getGoodsDetail(item.id);
      let num = 0;
      if (res.data.num - item.count <=0 ) {
        item.count = res.data.num;
        num = 0;
      } else {
        num = res.data.num - item.count;
      }
      await API.editGoodsDetails(item.id, { num })
      order[0].totalPrice += item.count * item.originPrice * 1;
    })
    data.goods = order[0].goods;
    data.totalPrice =  (order[0].totalPrice * 1).toFixed(2)
    await API.updateOrder(id, data);
    wx.hideLoading({
      complete: () => {
        Toast({
          type: 'success',
          message: '提交成功',
          onClose: () => {
            wx.reLaunch({
              url: '../home/index',
            })
          }
        });
      },
    })
    
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
  selectPayMode(e) {
    const payMode = e.currentTarget.dataset.pay;
    this.setData({
      payMode,
      show: false
    })
  },

  openPayMode(e) {
    const active = e.currentTarget.dataset.active;
    if (active == 1 || active == 2) {
      this.setData({
        show: true
      })
    }
  }
})