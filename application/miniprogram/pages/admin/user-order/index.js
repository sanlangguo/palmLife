import API from '../../../api/index';
import { formatTime } from '../../../tool.js';
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
        item.createTime = formatTime(item.createTime);
        item.goods.map(async goods => {
          const data = [goods.fileId];
          const fileRes = await API.getTempFileURL(data);
          goods.coverImg = fileRes.fileList[0].tempFileURL;
          item.totalPrice = goods.count * goods.originPrice;
        })
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
   * 拨打用户电话
   */
  async makePhoneCall() {
    console.log(this.data.order)
    wx.makePhoneCall({
      phoneNumber: this.data.order[0].phone
    })
  },
})