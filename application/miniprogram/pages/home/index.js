import API from '../../api/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconList: [],
    topBanner: [],
    goodList: [],
    batchTimes: 0,
    loading: false,
    sort: -1,
    groupBuy: [],
    preferred: [], //惠选
    braisedMeat: [], // 卤肉
    fresh: [], // 生鲜
    dailyUse: [] // 日用
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad() {
    const res = await API.getHomeConfig();
    const {
      topBanner,
      iconList
    } = res.data[0];
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
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    this.getGoodsList();
  },


  /**
   * 商品列表
   */
  async getGoodsList() {
    const res = this.data.sort == -1 ? await API.getGroupBuyGoods(true) : await API.filterBySortGoodsList(this.data.sort);
    const fileIds = [];
    if (res.data && res.data.length) {
      const goodList = res.data;
      goodList.map(item => {
        fileIds.push(item.fileId)
      })
      const filesData = await API.getTempFileURL(fileIds);
      filesData.fileList.map(item => {
        goodList.map(good => {
          good.coverImg = item.tempFileURL;
        })
      });
      switch (this.data.sort) {
        case -1:
          const data = [];
          goodList.map(item => {
            if (item.groupBuy && item.expireTime - new Date().getTime() > 0) {
              data.push(item)
            }
          })
          this.setData({
            groupBuy: data,
          })
          if (data.length <=2) {
            this.setData({
              sort:1
            }, () => {
              this.getGoodsList();
            })
          } 
          break
        case 0:
          this.setData({
            preferred: goodList,
          })
          break;
        case 1:
          this.setData({
            braisedMeat: goodList,
          })
          break;
        case 2:
          this.setData({
            fresh: goodList,
          })
          break;
        case 3:
          this.setData({
            dailyUse: goodList,
          })
          break;
        default:
          break;
      }
      wx.hideLoading();
      this.setData({
        loading: true,
      })
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let {
      sort
    } = this.data;
    if (sort == 3) {
      wx.showToast({
        title: '点击更多查看',
        icon: 'none',
        mask: true
      })
    } else {
      sort += 1;
      this.setData({
        sort
      }, () => {
        wx.showLoading({
          title: '加载中',
          mask: true
        })
        this.getGoodsList();
      })
    }
  },

  // 查看团购详情
  viewGoods(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: '../goods-detail/index?id='+id,
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})