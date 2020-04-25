import API from "../../api/index.js";
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    const res = await API.login();
    const {
      openid
    } = res.result;
    const userInfo = await API.getUserInfo(openid);
    console.log(userInfo, 'userInfo')
    if (userInfo.data && userInfo.data.length) {
      wx.setStorageSync('userInfo', userInfo.data[0]);
      this.selectSuccessCallBack();
    } else {
      wx.hideLoading();
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
          Notify({ type: 'warning', message: '授权失败请重试', duration: 900 });
        },
      })
      return
    }

    const res = await API.login();
    const that = this;
    const {
      openid
    } = res.result;
    const userInfo = Object.assign({}, e.detail.userInfo)
    userInfo.openid = openid;
    userInfo.areaCode = '410184';
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
    Notify({ type: 'success', message: '授权成功', duration: 900 });
    setTimeout(() => {
      wx.reLaunch({
        url: '../my/index'
      })
    }, 1000)
  }
})