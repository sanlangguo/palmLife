import API from "../../api/index"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    order: {},
    time: 0,
    timeData: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    const order = await (await API.getOrderDetail(options.id)).data[0];
    let time = 0;
    order.goods.map(async item => {
      const fileRes = await API.getTempFileURL([item.fileId]);
      item.coverImg = fileRes.fileList[0].tempFileURL;
    })

    if (order.groupExpireTime - new Date().getTime() > 0) {
      time = order.groupExpireTime - new Date().getTime();
    }

    this.setData({
      order,
      time,
    })
    console.log(order, '---')

  },

  onChange(e) {
    this.setData({
      timeData: e.detail
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})