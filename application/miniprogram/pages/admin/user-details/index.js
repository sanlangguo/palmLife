import { formatTime } from '../../../tool.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options, 'options')
    this.getUserOrderNumber(options.id);
  },

  /**
   * 获取用户订单数
   */
  async getUserOrderNumber(id) {
    const res =  (await wx.cloud.callFunction({name: 'user', data: {
      type: 'user-order',
      openid: id
    }})).result.list[0];
    res.createTime = res.createTime ? formatTime(res.createTime): '无注册时间';
    let orderNumber = 0;
    if (res.orderList.length) {
      res.orderList.map(item => {
        if (item.active == 4) {
          orderNumber += 1;
        }
      })
    }
    res.orderNumber = orderNumber;
    this.setData({
      user: res
    })
  }
})