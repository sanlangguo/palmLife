import API from '../../api/index';
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sort: 0,
    goodList: [],
    page: 0,
    batchTimes: 0,
    cart: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const { sort } = this.data;
    if (options && options.sort) {
      this.setData({
        sort: options.sort
      })
    }
    this.pagination(options && options.sort ? options.sort : sort);
  },

  /**
   * 分页
   */
  async pagination(sort) {
    const countResult = await API.getGoodsCount(parseInt(sort));
    const batchTimes = Math.ceil(countResult.total / 6);
    this.setData({
      batchTimes,
    }, () => {
      this.getGoodsList()
    })
  },


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    const { page , batchTimes, sort} = this.data;
    if (page < batchTimes) {
      this.getGoodsList();
    } else {
      if (sort == 3) {
        wx.showToast({
          title: '没有更多',
          icon: 'none',
          mask: true
        })
      } else {
        this.setData({
          sort: sort+1,
          page: 0,
        }, () => {
          this.pagination(sort+1);
        })
      }
    }
  },

  /**
   * 添加购物车
   */
  async addCart(e) {
    const gid = e.currentTarget.dataset.id;
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.openid) {
      const card = await this.getUserCardList(userInfo.openid);
      let data = {};
      if (card.data && card.data.length) {
        const data = JSON.parse(JSON.stringify(card.data[0]));
        delete data._openid;
        delete data.openid;
        delete data._id;
        const goods = data.goods;
        if (goods.length >= 20) {
          wx.showToast({
            title: '购物车已经加满啦',
            icon: 'none',
            mask: true
          })
        } else {
          const ids = [];
          goods.map((item) => {
            ids.push(item.id)
          });
          if (ids.includes(gid)) {
            goods.map((item) => {
              if (item.id == gid) {
                item.count += 1;
              }
            });
          } else {
            goods.push({
              id: gid,
              count: 1
            })
          }
          const changeCards = await API.changeCards(card.data[0]._id, data);
          if (changeCards.stats.updated == 1) {
            wx.showToast({
              title: '添加成功',
              icon: 'none',
              mask: true
            })
          } else {
            wx.showToast({
              title: '添加失败请重新添加',
              icon: 'none',
              mask: true
            })
          }
        }
      } else {
        data.openid = userInfo.openid;
        data.goods = [{
          id: gid,
          count: 1
        }];
        const addGoods = await this.addGoods(data);
        if (addGoods._id) {
          wx.showToast({
            title: '添加成功',
            icon: 'none',
            mask: true
          })
        } else {
          wx.showToast({
            title: '添加失败请重新添加',
            icon: 'none',
            mask: true
          })
        }
      }
    } else {
      Dialog.confirm({
        title: '授权',
        message: '用户信息不存在，点击确认授权'
      }).then(() => {
        wx.navigateTo({
          url: '../login/index',
        })
      });
    }
  },

  /**
   * 用户第一次添加购物车
   */
  async addGoods(data) {
    return await API.addCards(data);
  },

  /**
   * 用户添加多个商品添加购物车
   */
  async changeCards(data) {
    return await API.changeCards(data);
  },

  /**
   * 查询用户购物车
   */
  async getUserCardList(openid) {
    return await API.getCardList(openid);
  },

  /**
   * 商品列表
   */
  async getGoodsList() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    if (this.data.page !=0 && this.data.page === this.data.batchTimes) {
      return false;
    }
    const res = await API.filterBySortGoodsList(parseInt(this.data.sort), this.data.page * 6);
    const fileIds = [];
    if (res.data && res.data.length) {
      const goodList = res.data;
      goodList.map((item, index) => {
        if (item.num <= 0) {
          goodList.splice(index ,1)
        }
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
          this.setData({
            goodList: this.data.goodList.concat(goodList),
            page: this.data.page + 1,
          })
        },
      })
    }
    wx.hideLoading();
  },

  /**
   * 商品分类切换
   * @param {0-惠选，1-卤菜, 2-生鲜, 3-居家}
   */
  switchSort(e) {
    const {
      detail
    } = e;
    this.setData({
      sort: detail,
      page: 0,
      goodList: []
    }, () => {
      this.pagination(detail)
    })
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
})