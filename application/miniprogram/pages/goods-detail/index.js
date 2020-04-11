import API from '../../api/index';
const userInfo = getApp().globalData.userInfo;
Page({

  data: {
    // Banner数据
    images:[
      "http://img.zcool.cn/community/014056564bd8596ac7251c94eb5559.jpg",
      "http://img.zcool.cn/community/01e03b58047e96a84a0e282b09e8fc.jpg",
      "http://pic.90sjimg.com/back_pic/00/00/69/40/d678a42886e0232aaea0d6e69e9b1945.jpg",
      "http://img.zcool.cn/community/0132dd55800bc700000059ffbe83e9.jpg@1280w_1l_2o_100sh.jpg",
      "http://img.zcool.cn/community/0154755a2df102a80120ba3828b5af.jpg@1280w_1l_2o_100sh.jpg",
      "http://pic.90sjimg.com/back_pic/00/00/69/40/bf4f8e2ab7e05dc3c7cc2a7f7e9c2fe7.jpg",
      "http://img.zcool.cn/community/01a2a2594943d3a8012193a328e0fd.jpg@1280w_1l_2o_100sh.jpg"
    ],
    goods: {},
    cartLength: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    if (options && options.id) {
      wx.showLoading({
        title: '加载中',
      })
      const goods = (await API.getGoodsDetail(options.id)).data;
      const topBanner = (await API.getTempFileURL(goods.topBanner)).fileList;
      const infoList = (await API.getTempFileURL(goods.infoList)).fileList;
      const card = await API.getCardList(userInfo.openid);
      goods.topBannerUrl = topBanner;
      goods.infoListUrl = infoList;
      this.setData({
        goods,
        cartLength: card.data && card.data.length ? card.data[0].goods.length : 0
      })
      wx.hideLoading();
    } else {
      wx.reLaunch({
        url: '../goods-list/index',
      })
    }
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