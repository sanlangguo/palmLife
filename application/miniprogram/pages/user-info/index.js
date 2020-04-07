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
    this.setData({
      userInfo: wx.getStorageSync('userInfo')
    })
  },

  /**
   * 选择地址
   */
  confirmArea(e) {
    console.log(e, '--------')
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
    const {_id, name, phone, receiveCity,receiveDetailedAddress, openid} = this.data.userInfo;
    if (name && phone && receiveCity && receiveDetailedAddress ) {
      if (checkPhone(phone)) {
        Notify({ type: 'danger', message: '请输入正确的手机号', duration: 900 });
        return;
      }
      const data = JSON.parse(JSON.stringify(this.data.userInfo))
      delete data._openid;
      delete data.openid;
      delete data._id;
      const res = await API.updateUserInfo(_id, data);
      if (res.stats.updated) {
        Notify({ type: 'success', message: '保存成功', duration: 900 });
        const userData = await API.getUserInfo(openid);
        if (userData.data && userData.data.length) {
          wx.setStorageSync('userInfo', userData.data[0]);
          this.setData({
            userInfo: userData.data[0]
          })
        }
      } else {
        Notify({ type: 'primary', message: '无内容更新', duration: 900 });
      }
    } else {
      Notify({ type: 'danger', message: '请完善个人信息', duration: 900 });
    }
  }
})