import API from '../../api/index'
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
    const res = await API.getAreas();
    console.log(res, '--------------')
  },
})