import API from '../../api/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconList: [],
    topBanner: [],
    goodList: [],
    page: 0,
    batchTimes: 0,
    loading: false,
    sort: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad() {
    const res = await API.getHomeConfig();
    const {topBanner, iconList} = res.data[0];
    console.log(topBanner, iconList, '---')
    const fileIds = [];
    topBanner.map(item => {
      fileIds.push(item.fileId);
    })
    const fileUrl = (await API.getTempFileURL(fileIds)).fileList;
    fileUrl.map((item, index) => {
      topBanner[index].tempFileURL = item.tempFileURL
    });
    this.setData({
      topBanner
    })
    console.log(topBanner,'---')

    wx.showLoading({
      title: '加载中',
      mask: true
    })
    const countResult = await API.getGoodsCount();
    const batchTimes = Math.ceil(countResult.total / 6);
    this.setData({
      batchTimes,
    }, () => {
      this.getGoodsList()
    })
  },

  
  /**
   * 商品列表
   */
  async getGoodsList () {
    console.log(1111)
    const db = wx.cloud.database();
    if (this.data.page === this.data.batchTimes) {
      return false;
    }
    const res = await API.filterBySortGoodsList(this.data.sort);
    console.log(res, '---')
    db.collection('goods-list').skip(this.data.page * 6).limit(6).get({ 
      success: res => {
        const fileIds = [];
        if (res.data && res.data.length) {
          const goodList = res.data;
          goodList.map(item => {
            fileIds.push(item.fileId)
          })
          wx.cloud.getTempFileURL({
            fileList: fileIds,
            success: res => {
              res.fileList.map(item => {
                goodList.map(good => {
                  good.coverImg = item.tempFileURL;
                })
              })
              wx.hideLoading();
              console.log(goodList, '----')
              this.setData({
                loading: true,
                goodList: this.data.goodList.concat(goodList),
                page: this.data.page+1,
              })
            },
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.page < this.data.batchTimes) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      this.getGoodsList();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})