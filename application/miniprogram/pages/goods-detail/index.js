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
    userInfo: wx.getStorageSync('userInfo'),
    groupbuy: false,
    hasUserGroup: false, // 当前团购商品是否正在开团抢购
    orderId: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    if (options && options.id) {
      wx.showLoading({
        title: '加载中',
        mask: true
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
      if (goods.groupBuy && goods.expireTime - new Date().getTime() > 0) {
        if (this.data.userInfo.openid) {
          const group = await API.checkUserGroup(this.data.userInfo.openid, options.id);
          if (group.data && group.data.length) {
            const data = group.data[0];
            if (data.groupExpireTime - new Date().getTime() > 0) {
              this.setData({
                hasUserGroup: true,
                orderId: data._id
              })
            }
          }
        }
        goods.countdown = goods.expireTime - new Date().getTime();
      } else {
        goods.groupBuy = false;
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
        url: '../home/index',
      })
    }
  },

  onChange(e) {
    this.setData({
      timeData: e.detail
    });
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
      console.log(this.data.userInfo, '--sssss--')
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
  async viewGroup(e) {
    const {
      hasUserGroup,
      orderId
    } = this.data;
    if (hasUserGroup && orderId) {
      wx.navigateTo({
        url: '../group-details/index?id=' + orderId,
      })
    }
  },

  // 购买
  async buyNow(e) {
    const {
      goods
    } = this.data;
    let {
      groupbuy
    } = e.currentTarget.dataset;
    groupbuy = (groupbuy === "false")? false : true;
    this.setData({
      groupbuy,
      show: true,
      count: 1,
      currentPrice: groupbuy ? goods.groupPurchasePrice : goods.originPrice,
    })
  },

  /**
   * 下一步
   */
  async next() {
    wx.showToast({
      title: '下单中',
      icon: 'none',
      mask: true
    })
    const {
      goods,
      userInfo,
      count,
      key,
      groupbuy,
      currentPrice
    } = this.data;
    if (userInfo) {
      const data = {
        orderNumber: orderNumber(),
        active: 1,
        totalPrice: currentPrice * 1,
        name: userInfo.name,
        phone: userInfo.phone,
        receiveCity: userInfo.receiveCity,
        receiveDetailedAddress: userInfo.receiveDetailedAddress,
        createTime: new Date().getTime(),
        goods: [{
          id: goods._id,
          coverImg: goods.coverImg,
          count: count,
          fileId: goods.fileId,
          desc: goods.desc,
          name: goods.name,
          unit: goods.norm[key].name ? goods.norm[key].name : goods.unit,
          price: goods.originPrice,
          originPrice: groupbuy ? goods.groupPurchasePrice : goods.norm[key].price ? goods.norm[key].price : goods.price
        }],
      }
      if (groupbuy) {
        data.groupbuy = true;
        data.groupPurchaseNumber = goods.groupPurchaseNumber;
        data.groupPurchasePrice = goods.groupPurchasePrice
      }
      const res = await API.orderTotal(data);
      wx.hideLoading({
        complete: () => {
          wx.navigateTo({
            url: '/pages/order-detail/index?id=' + res._id,
          })
        },
      })
    } else {
      wx.hideLoading();
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
    const {
      goods
    } = this.data;
    if (goods.norm && goods.norm.length == 1) return false;
    const {
      key
    } = e.currentTarget.dataset;
    const currentPrice = (goods.norm[key].price * 1).toFixed(2);
    this.setData({
      key,
      count: 1,
      currentPrice
    })
  },

  onGoodsCounts(e) {
    const {
      goods,
      key,
      groupbuy
    } = this.data;
    const currentPrice = groupbuy ? (e.detail * goods.groupPurchasePrice).toFixed(2) : (goods.norm[key].price * e.detail).toFixed(2);
    this.setData({
      count: e.detail,
      currentPrice
    })
  },

  addCounts(e) {
    if (e.detail == "plus") {
      wx.showToast({
        title: '就这几件啦',
        icon: 'none',
        mask: true
      })
    }
  },

  /**
   * 活动结束时触发
   */
  async activityEnds() {
    await wx.cloud.callFunction({
      name: 'editGoods',
      data: {
        _id: this.data.goods._id,
        data: {
          groupBuy: false
        },
      },
    })
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

})