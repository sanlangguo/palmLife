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
     this.setData({
       id: options.id,
     })
    } else {
      wx.reLaunch({
        url: '../home/index',
      })
    }
  },

  /**
   * 查询之前有没有下过订单
   */ 
  async checkBeforeHasOrder(groupBuy, id) {
    // 团购订单
    if (groupBuy) {
      const res = await API.checkHasOrder({
        active: 2,
        group: true,
        'goods.id': id,
      });
      if (res.data && res.data.length) {
        this.setData({
          hasUserGroup: true,
          groupId: res.data[0].groupId
        })
      }
    }
    // 单独订单
    const res = await API.checkHasOrder({
      active: 1,
      'goods.id': id,
    });
    if (res.data && res.data.length) {
      this.setData({
        orderId: res.data[0]._id
      })
    }
  },

  async onShow() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    const { id } = this.data;
    const goods = (await API.getGoodsDetail(id)).data;
    const topBanner = (await API.getTempFileURL(goods.topBanner)).fileList;
    const infoList = (await API.getTempFileURL(goods.infoList)).fileList;
    if (!goods.norm || !goods.norm.length) {
      goods.norm = [{
        price: goods.originPrice,
        name: goods.unit
      }]
    }
    if (goods.groupBuy && goods.expireTime - new Date().getTime() > 0) {
      goods.countdown = goods.expireTime - new Date().getTime();
    } else {
      goods.groupBuy = false;
    }

    this.checkBeforeHasOrder(goods.groupBuy, id)

    goods.topBannerUrl = topBanner;
    goods.infoListUrl = infoList;
    goods.coverImg = (await API.getTempFileURL([goods.fileId])).fileList[0].tempFileURL;
    this.setData({
      goods,
      currentPrice: goods.originPrice,
      show: false,
    }, () => {
      this.getUserCartLength();
    })
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
    console.log(e)
    let {
      groupbuy
    } = e.currentTarget.dataset;
    groupbuy = (groupbuy === "false") ? false : true;
    const {
      hasUserGroup,
      groupId,
      goods
    } = this.data;
    if (hasUserGroup && groupId) {
      wx.navigateTo({
        url: '../group-details/index?id=' + groupId,
      })
    } else {
      this.setData({
        show: true,
        groupbuy,
        currentPrice: groupbuy ? goods.groupPurchasePrice : goods.originPrice,
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
    groupbuy = (groupbuy === "false") ? false : true;
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
    const {
      goods,
      userInfo,
      count,
      key,
      groupbuy,
      currentPrice,
      groupId,
      orderId,
    } = this.data;


    if (userInfo.name && userInfo.phone) {
      wx.showToast({
        title: '下单中',
        icon: 'none',
        mask: true
      })
      // 更新之前的订单
      if (groupbuy) {
        
      } else {

      }


      const commentGoods = {
        id: goods._id,
        coverImg: goods.coverImg,
        fileId: goods.fileId,
        desc: goods.desc,
        name: goods.name,
        unit: goods.norm[key].name ? goods.norm[key].name : goods.unit,
        price: goods.originPrice,
      };
      let group = {};
      let active = 1;
      if (groupbuy) {
        const groupData = {
          goods: {
            ...commentGoods,
            originPrice: goods.groupPurchasePrice
          },
          group: [{
            id: userInfo.openid,
            avatarUrl: userInfo.avatarUrl,
            nickName: userInfo.nickName,
            roles: '团长',
            count: count,
          }],
          groupPurchaseNumber: goods.groupPurchaseNumber,
          createTime: new Date().getTime(),
          expireTime: goods.expireTime,
          groupExpireTime: new Date().getTime() + 86400000
        };
        group = await API.addGroupOrder(groupData);
        active = 2;
      }

      const data = {
        orderNumber: orderNumber(),
        active: active,
        totalPrice: currentPrice * 1,
        name: userInfo.name,
        phone: userInfo.phone,
        receiveCity: userInfo.receiveCity,
        receiveDetailedAddress: userInfo.receiveDetailedAddress,
        areaCode: userInfo.areaCode,
        createTime: new Date().getTime(),
        goods: [{
          ...commentGoods,
          count: count,
          originPrice: groupbuy ? goods.groupPurchasePrice : goods.norm[key].price ? goods.norm[key].price : goods.price
        }],
      }
      if (group._id) {
        data.groupId = group._id;
        data.group = true;
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