Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 0,
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.selectComponent("#order").turnPage();
  },

})