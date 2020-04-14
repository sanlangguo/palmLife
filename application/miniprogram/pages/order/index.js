Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 0,
  },
  /**
   *  切换tabs
   */
  switchTabs(event) {
    const {index} = event.detail;
    this.setData({
      index,
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.selectComponent("#order").turnPage();
  },

})