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
        if (goods.length >=20) {
          wx.showToast({
            title: '购物车已经加满啦',
            icon: 'none',
            mask: true
          })
        } else {
          const ids = [];
          goods.map((item) => { ids.push(item.id)});
          if (ids.includes(gid)) {
            goods.map((item) => {
              if (item.id == gid ) {
                item.count+=1;
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
  async getGoodsList () {
    const db = wx.cloud.database();
    if (this.data.page === this.data.batchTimes) {
      return false;
    }
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
              this.setData({
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
   * 商品分类切换
   * @param {0-惠选，1-卤菜, 2-生鲜, 3-居家}
   */
  switchSort(e) {
    const { detail } = e;
    console.log(detail)
  },



  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
})