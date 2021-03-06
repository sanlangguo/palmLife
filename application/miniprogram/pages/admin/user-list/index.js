Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 0,
    batchTimes: 0,
    user: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const count = (await wx.cloud.callFunction({name: 'user', data: {
      type: 'count'
    }})).result;
    const batchTimes = Math.ceil(count.total / 8);
    this.setData({
      batchTimes: batchTimes
    }, () => {
      this.getUserList();
    })
  },

  async getUserList() {
    const res = (await wx.cloud.callFunction({
      name: 'user',
      data: {
        type: 'get',
        page: this.data.page * 8,
      },
    })).result;
    if (res.data && res.data.length) {
      this.setData({
        user: this.data.user.concat(res.data)
      })
    } else {
      wx.showToast({
        title: '暂无更多数据',
        mask: true
      })
    }
  },
  /**
   * 上拉刷新
   */
  onReachBottom() {
    const { batchTimes, page } = this.data;
    if (batchTimes == page || batchTimes == 0) {
      wx.showToast({
        title: '暂无更多数据',
        mask: true
      })
    } else {
      page += 1;
      this.setData({
        page
      }, () => {
        this.getUserList();
      })
    }
  },
})