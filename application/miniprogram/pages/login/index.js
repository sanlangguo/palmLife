import API from "../../api/index.js";
Page({

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    if (options.id) {
      this.setData({
        id: options.id
      })
    }
    const res = await wx.cloud.callFunction({ name: 'login'});
    const {
      openid
    } = res.result;
    const userInfo = await API.getUserInfo(openid);
    if (userInfo.data && userInfo.data.length) {
      wx.setStorageSync('userInfo', userInfo.data[0]);
      this.selectSuccessCallBack();
    }
  },

  /**
   * 获取用户信息
   */
  async getUserInfo(e) {
    wx.showLoading({
      title: '授权中...',
      mask: true
    })
    if (!e.detail.userInfo) {
      wx.hideLoading({
        complete: () => {
          wx.showToast({
            title: '授权失败请重试',
            icon: 'none',
            duration: 900,
            mask: true
          })
        },
      })
      return
    }

    const res = await wx.cloud.callFunction({ name: 'login'});
    const that = this;
    const {
      openid
    } = res.result;
    const userInfo = Object.assign({}, e.detail.userInfo)
    userInfo.openid = openid;
    userInfo.areaCode = '410184';
    userInfo.createTime = new Date().getTime();
    await API.insetUserInfo(userInfo);
    wx.setStorageSync('userInfo', userInfo);
    wx.hideLoading({
      success() {
        that.selectSuccessCallBack()
      }
    })
  },

  /**
   * 查询成功回调
   */
  selectSuccessCallBack() {
    const that = this;
    wx.showToast({
      title: '授权成功',
      icon: 'success',
      duration: 900,
      mask: true,
      success() {
        if (that.data.id) {
          let pages = getCurrentPages();
          let prevPage = pages[pages.length - 2];
          prevPage.setData({
            id: that.data.id
          })
          setTimeout(() => {
            wx.navigateBack({
              delta: 1,
            })
          }, 1000)
        } else {
          setTimeout(() => {
            wx.reLaunch({
              url: '../my/index'
            })
          }, 1000)
        }
      }
    })
  }
})