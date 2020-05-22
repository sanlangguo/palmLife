Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 0,
    show: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 选择月份
   */
  onDisplay() {
    this.setData({ show: true });
  },

  /**
   * 确认日期
   */
  onConfirm(event) {
    this.setData({
      show: false,
      date: this.formatDate(event.detail),
    });
  },

  onClose() {
    this.setData({ show: false });
  },

  formatDate(date) {
    date = new Date(date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  },
})