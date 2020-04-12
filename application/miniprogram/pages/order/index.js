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
    console.log(res, 'res')
    return false
    db.collection('goods-list').skip(this.data.page).limit(6).get({
      success: res => {
        const fileIds = [];
        if (res.data && res.data.length) {
          const goodList = res.data;
          goodList.map(item => {
            fileIds.push(item.fileId)
          })
          wx.cloud.getTempFileURL({
            fileList: fileIds,
            success: res => {
              res.fileList.map(item => {
                goodList.map(good => {
                  good.coverImg = item.tempFileURL;
                })
              })
              wx.hideLoading();
              this.setData({
                goodList: this.data.goodList.concat(goodList),
                page: this.data.page + 1,
              })
            },
          })
        }
      }
    })
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