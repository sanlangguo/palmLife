import API from "../../api/index.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo
      })
    } else {
      const res = await API.login();
      const {
        openid
      } = res.result;
      const userInfo = await API.getUserInfo(openid);
      if (userInfo.data && userInfo.data.length) {
        wx.setStorageSync('userInfo', userInfo.data[0]);
        this.setData({
          userInfo: userInfo.data[0]
        })
      } else {
        console.log(1)
        wx.getUserInfo({
          success (res) {
            console.log(1)
            const data = Object.assign({}, res.userInfo);
            data._openid = openid;
            // const result = await API.insetUserInfo(data)
            console.log(result)
          }
        })
      }
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