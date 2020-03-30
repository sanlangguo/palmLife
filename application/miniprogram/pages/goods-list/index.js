// pages/goods-list/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodList: [],
    page: 0,
    batchTimes: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    wx.showLoading({
      title: '加载中',
    })
    const db = wx.cloud.database();
    const countResult = await db.collection('goods-list').count();
    const batchTimes = Math.ceil(countResult.total / 6);
    this.setData({
      batchTimes,
    }, () => {
      this.getGoodsList()
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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
      this.getGoodsList();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 添加购物车
   */
  addCart(e) {
    console.log(e, '222')
  },

  async getGoodsList () {
    const db = wx.cloud.database();
    if (this.data.page === this.data.batchTimes) {
      return false;
    }
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
                page: this.data.page+1,
              })
            },
          })
        }
      }
    })
  },

})