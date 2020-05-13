import API from '../../api/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getGoodsList();
  },

  /**
   * 商品列表
   */
  async getGoodsList() {
    const res = await API.getGroupBuyGoods(true);
    const fileIds = [];
    if (res.data && res.data.length) {
      const goodList = res.data;
      goodList.map((item, index) => {
        if (item.num <= 0) {
          goodList.splice(index, 1)
        }
        fileIds.push(item.fileId)
      })
      const filesData = await API.getTempFileURL(fileIds);
      filesData.fileList.map(item => {
        goodList.map(good => {
          good.coverImg = item.tempFileURL;
        })
      });
      const data = [];
      goodList.map(item => {
        if (item.groupBuy && item.expireTime - new Date().getTime() > 0) {
          data.push(item)
        }
      })
      this.setData({
        goods: data,
      })
      wx.hideLoading();
      this.setData({
        loading: true,
      })
    }
  },


  /**
   * 查看团购详情
   */
  viewGoods(e) {
    const {
      id
    } = e.currentTarget.dataset
    wx.navigateTo({
      url: '../goods-detail/index?id=' + id,
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
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})