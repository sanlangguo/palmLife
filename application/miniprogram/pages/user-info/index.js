import API from '../../api/index';
import area from '../../api/area';
import { checkPhone } from '../../tool';
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    areaList: area,
    showArea: false,
    groupId: null,
    userInfo: {
      name:  null,
      phone: null,
      receiveCity: null,
      areaCode: null,
      receiveDetailedAddress: null,
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    if (options.id) {
      this.setData({
        orderId: options.id
      })
    }
    if (options.groupId) {
      this.setData({
        groupId: options.groupId
      })
    }
  },

  async onShow() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      if (!this.data.userInfo) {
        this.setData({
          userInfo
        })
      }
    } else {
      wx.reLaunch({
        url: '../login/index'
      })
    }
    this.setData({
      userInfo
    })
  },

  /**
   * 选择地址
   */
  confirmArea(e) {
    let receiveCity = '';
    const detail = e.detail.values;
    const areaCode = detail[detail.length-1].code;
    const userInfo = this.data.userInfo;
    detail.map(item => {
      receiveCity+=item.name;
    })
    userInfo.areaCode = areaCode;
    userInfo.receiveCity = receiveCity;
    this.setData({
      showArea: false,
      userInfo
    })
  },

  /**
   * 取消选择地址
   */
  cancelArea() {
    this.setData({
      showArea: false,
    })
  },

  /**
   * 显示城市选择器
   */
  selectArea() {
    this.setData({
      showArea: !this.data.showArea
    })
  },

  onChange(event) {
    const userInfo = this.data.userInfo;
    userInfo[event.currentTarget.dataset.type] = event.detail;
    this.setData({
      userInfo
    })
  },

  /**
   * 保存修改
   */
  async save() {
    const { groupId, userInfo, orderId } = this.data;
    const { _id, name, phone, receiveCity,receiveDetailedAddress, openid } = userInfo;
    if (name && phone && receiveCity && receiveDetailedAddress) {
      if (checkPhone(phone)) {
        Notify({ type: 'danger', message: '请输入正确的手机号', duration: 900 });
        return;
      }
      const data = JSON.parse(JSON.stringify(userInfo))
      delete data._openid;
      delete data.openid;
      delete data._id;
      const orderData = {
        name,
        phone,
        receiveCity,
        receiveDetailedAddress
      }
      if (orderId) { await API.updateOrder(orderId, orderData) }
      const res = await API.updateUserInfo(openid, data);
      if (res.stats.updated) {
        const userData = await API.getUserInfo(openid);
        if (userData.data && userData.data.length) {
          wx.setStorageSync('userInfo', userData.data[0]);
          this.setData({
            userInfo: userData.data[0]
          },() => {
            wx.showToast({
              title: '保存成功',
              icon: 'none',
              mask: true,
              duration: 4000,
              success() {
                if (groupId) {
                  wx.reLaunch({
                    url: '../group-details/index?id=' + groupId,
                  })
                }
              }
            })
          })
        }
      } else {
        wx.showToast({
          title: '更新成功',
          mask: true
        })
      }
    } else {
      Notify({ type: 'danger', message: '请完善个人信息', duration: 900 });
    }
  }
})