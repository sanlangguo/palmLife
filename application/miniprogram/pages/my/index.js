import API from "../../api/index.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      avatarUrl: '../../images/default-avatar.png'
    },
    show: true
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
      const res = await wx.cloud.callFunction({ name: 'login'});
      const {
        openid
      } = res.result;
      const userInfo = await API.getUserInfo(openid);
      if (userInfo.data && userInfo.data.length) {
        wx.setStorageSync('userInfo', userInfo.data[0]);
        this.setData({
          userInfo: userInfo.data[0]
        })
      }
    }
  },

  /**
   * 点击授权
   */
  login(e) {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.navigateTo({
        url: '../login/index',
      })
    } else {
      const pagesUrl = e.currentTarget.dataset.url;
      if (pagesUrl == 'order' || pagesUrl == 'cart') {
        wx.switchTab({
          url: `../${pagesUrl}/index`,
        })
      } else {
        wx.navigateTo({
          url: `../${pagesUrl}/index`,
        })
      }
    }
  }

})