import API from '../../api/index';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
import { formatTime } from '../../tool.js'
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
        })
        item.createTime = formatTime(item.createTime);
        item.updateTime = item.updateTime ? formatTime(item.updateTime): null;
      })
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
   * 拨打商户电话
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
      wx.hideLoading();
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
    })
    data.goods = order[0].goods;
    data.totalPrice =  order[0].totalPrice;
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
  },

  /**
   * 拷贝订单号
   */
  copyOrderNumber() {
    wx.setClipboardData({
      data: this.data.order[0].orderNumber
    })
  }
})