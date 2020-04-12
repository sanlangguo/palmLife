import API from '../../api/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 0,
    batchTimes: 0,
    page: 0,
    order: []
  },


  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    wx.showLoading({
      title: '加载中',
    })
    const count = await API.getOrderCount();
    console.log(count, 'countResult')
    const batchTimes = Math.ceil(count.total / 6);
    this.setData({
      batchTimes,
    }, () => {
      this.getOrderList()
    })
  },

  /**
   * 获取订单列表
   */
  async getOrderList() {
    if (this.data.page === this.data.batchTimes) {
      return false;
    }
    const res = await API.getOrderList(this.data.page);
    if (res.data && res.data.length) {
      res.data.map(async item => {
        item.goods.map(async goods => {
          const data = [goods.fileId];
          console.log(goods, 'goods');
          console.log(data, 'data');
          const fileRes = await API.getTempFileURL(data);
          goods.coverImg = fileRes.fileList[0].tempFileURL;
          item.totalPrice = goods.count * goods.originPrice;
        })
      })
      this.setData({
        batchTimes: 0,
        page: this.data.page + 1,
        order: res.data,
      })
    } else {
      this.setData({
        batchTimes: 0,
        page: 0,
        order: [],
        active: 0,
      })
    }
    console.log(res.data, '---')
    wx.hideLoading();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.page < this.data.batchTimes) {
      wx.showLoading({
        title: '加载中',
      })
      this.getOrderList();
    }
  },

})