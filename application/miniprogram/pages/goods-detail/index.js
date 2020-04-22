import API from '../../api/index';
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import {
  orderNumber
} from '../../tool.js';
Page({

  data: {
    currentPrice: 0,
    show: false,
    goods: {},
    cartLength: 0,
    key: 0,
    count: 1,
    userInfo: wx.getStorageSync('userInfo')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    if (options && options.id) {
      wx.showLoading({
        title: '加载中',
      })
      const goods = (await API.getGoodsDetail(options.id)).data;
      const topBanner = (await API.getTempFileURL(goods.topBanner)).fileList;
      const infoList = (await API.getTempFileURL(goods.infoList)).fileList;
      if (!goods.norm || !goods.norm.length) {
        goods.norm = [{
          price: goods.originPrice,
          name: goods.unit
        }]
      }
      goods.topBannerUrl = topBanner;
      goods.infoListUrl = infoList;
      goods.coverImg = (await API.getTempFileURL([goods.fileId])).fileList[0].tempFileURL;
      this.setData({
        goods,
        currentPrice: goods.originPrice
      }, () => {
        this.getUserCartLength();
      })
    } else {
      wx.reLaunch({
        url: '../goods-list/index',
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 查询用户购物车数量
   */
  async getUserCartLength() {
    const card = await API.getCardList(this.data.userInfo.openid);
    this.setData({
      cartLength: card.data && card.data.length ? card.data[0].goods.length : 0
    }, () => {
      wx.hideLoading();
    })
  },

  /**
   * 添加购物车
   */
  async addCart(e) {
    const gid = this.data.goods._id;
    if (Object.keys(this.data.userInfo).length) {
      const {
        userInfo
      } = this.data;
      const card = await this.getUserCardList(userInfo.openid);
      let data = {};
      if (card.data && card.data.length) {
        data = JSON.parse(JSON.stringify(card.data[0]));
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
            this.getUserCartLength();
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
          this.getUserCartLength();
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
   * 查询用户购物车
   */
  async getUserCardList(openid) {
    return await API.getCardList(openid);
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
   * 点击购买
   */
  async buy() {
    this.setData({
      show: true
    })
  },

  /**
   * 下一步
   */
  async next() {
    const {
      goods,
      userInfo,
      count,
      key
    } = this.data;
    if (userInfo) {
      const data = {
        orderNumber: orderNumber(),
        active: 1,
        totalPrice: goods.norm[key].price * count,
        name: userInfo.name,
        phone: userInfo.phone,
        receiveCity: userInfo.receiveCity,
        receiveDetailedAddress: userInfo.receiveDetailedAddress,
        createTime: new Date().getTime(),
        goods: [{
          id: goods._id,
          count: count,
          fileId: goods.fileId,
          desc: goods.desc,
          name: goods.name,
          originPrice: goods.originPrice,
          price: goods.norm[key].price ? goods.norm[key].price : goods.price
        }],
      }
      const res = await API.orderTotal(data);
      wx.navigateTo({
        url: '/pages/order-detail/index?id='+res._id,
      })
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
   * 关闭底部规格选择弹框
   */
  onClose() {
    this.setData({
      show: false
    })
  },

  /**
   * 选择产品规格
   */
  seletGoodsNorm(e) {
    const { goods } = this.data;
    if (goods.norm && goods.norm.length == 1) return false;
    const { key } = e.currentTarget.dataset;
    const currentPrice = (goods.norm[key].price * 1).toFixed(2);
    this.setData({
      key,
      count: 1,
      currentPrice
    })
  },

  onGoodsCounts(e) {
    const { goods, key} = this.data;
    const currentPrice = (goods.norm[key].price * e.detail).toFixed(2);
    this.setData({
      count: e.detail,
      currentPrice
    })
  }
})
