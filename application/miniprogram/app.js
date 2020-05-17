App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: wx.cloud.DYNAMIC_CURRENT_ENV,
        traceUser: true,
      })
    }
    const userInfo = wx.getStorageSync('userInfo');
    if (Object.keys(userInfo).length === 0) {
      this.checkUserInfo();
    } else {
      this.globalData = {
        userInfo
      }
    }
  },
  async checkUserInfo() {
    const db = wx.cloud.database();
    const res = await wx.cloud.callFunction({name: 'login'});
    const {
      openid
    } = res.result;
    const userInfo = await db.collection('user').where({_openid:openid}).get();
    if (userInfo.data && userInfo.data.length) {
      wx.setStorageSync('userInfo', userInfo.data[0]);
      this.globalData = {
        userInfo: userInfo.data[0]
      }
    } else {
      this.globalData = {
        userInfo: {}
      }
    }
  }
})
