import API from '../../api/index';
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import {
  orderNumber
} from '../../tool.js';
Page({

  data: {
    show: true,
    goods: {},
    cartLength: 0,
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
      goods.topBannerUrl = topBanner;
      goods.infoListUrl = infoList;
      this.setData({
        goods,
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
          Notify({
            type: 'warning',
            message: '购物车已经加满啦',
            duration: 1500
          });
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
            Notify({
              type: 'success',
              message: '添加成功',
              duration: 900
            });
            this.getUserCartLength();
          } else {
            Notify({
              type: 'warning',
              message: '添加失败请重新添加',
              duration: 900
            });
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
          Notify({
            type: 'success',
            message: '添加成功',
            duration: 900
          });
          this.getUserCartLength();
        } else {
          Notify({
            type: 'warning',
            message: '添加失败请重新添加',
            duration: 900
          });
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
    const {
      goods,
      userInfo
    } = this.data;
    if (userInfo) {
      const data = {
        orderNumber: orderNumber(),
        active: 1,
        totalPrice: goods.totalPrice,
        name: userInfo.name,
        phone: userInfo.phone,
        receiveCity: userInfo.receiveCity,
        receiveDetailedAddress: userInfo.receiveDetailedAddress,
        createTime: new Date().getTime(),
        goods: [{
          id: goods._id,
          count: goods.count,
          fileId: goods.fileId,
          desc: goods.desc,
          name: goods.name,
          num: goods.num,
        }],
      }
      console.log(data, '=====')
    } else {

    }

    console.log(this.data.goods)
  },

  /**
   * 关闭底部规格选择弹框
   */
  onClose() {
    this.setData({
      show: false
    })
  }
})