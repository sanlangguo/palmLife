import API from '../../api/index';
import area from '../../api/area';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
    areaList: area,
    showArea: false,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const data = {
      receiveCity: '河南省郑州市新郑市'
    }
    const res = await API.updateUserInfo('dc65fe3e5e80a04b001b22f075115686', data);
    console.log(res, 'update')
  },

  /**
   * 选择地址
   */
  confirmArea(e) {
    console.log(e, '----------')
  },

  /**
   * 取消选择地址
   */
  // cancelArea

  /**
   * 显示城市选择器
   */
  selectArea() {
    this.setData({
      showArea: !this.data.showArea
    })
  }

})