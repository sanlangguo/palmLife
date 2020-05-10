import API from "../../api/index"
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods: {},
    count: 1,
    show: false,
    order: {},
    time: 0,
    timeData: {},
    id: null,
    hasUserGroup: false, // 当前团购商品是否正在开团抢购
    userInfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    if (options && options.id) {
      const userInfo = wx.getStorageSync('userInfo');
      const order = (await wx.cloud.callFunction({
        name: 'getOrders',
        data: {
          id: options.id,
        },
      })).result.data[0];
      let time = 0;
      order.goods.map(async item => {
        const fileRes = await API.getTempFileURL([item.fileId]);
        item.coverImg = fileRes.fileList[0].tempFileURL;
      })

      if (order.group && order.group.length && userInfo) {
        order.group.map(item => {
          if (item.id == userInfo.openid) {
            this.setData({
              hasUserGroup: true
            })
          }
        })
      }

      if (order.groupExpireTime - new Date().getTime() > 0) {
        time = order.groupExpireTime - new Date().getTime();
      }
      this.setData({
        order,
        time,
        id: options.id,
        userInfo,
      })
    } else {
      wx.reLaunch({
        url: '../home/index',
      })
    }
    wx.hideLoading();
  },

  onChange(e) {
    this.setData({
      timeData: e.detail
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const {
      order,
      id,
      userInfo
    } = this.data;
    return {
      title: `【${userInfo.nickName ? userInfo.nickName : '好友'}@我】开来拼 ${order.goods[0].name}`,
      path: '/pages/group-details/index?id=' + id,
      imageUrl: `${order.goods[0].coverImg}`,
    }
  },

  /**
   * 参加拼团
   */
  async joinFightTogether() {
    const {
      id,
      order,
      goods
    } = this.data;
    const userInfo = this.data.userInfo || wx.getStorageSync('userInfo');
    if (userInfo && userInfo.openid) {
      if (Object.keys(this.data.goods).length != 0) {
        this.setData({
          show: true
        })
        return false;
      }
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      const goods = (await API.getGoodsDetail(order.goods[0].id)).data;
      if (!goods.norm || !goods.norm.length) {
        goods.norm = [{
          price: goods.originPrice,
          name: goods.unit
        }]
      }
      goods.coverImg = (await API.getTempFileURL([goods.fileId])).fileList[0].tempFileURL;
      this.setData({
        goods,
        show: true,
        currentPrice: goods.originPrice
      })
      wx.hideLoading();
      return false
      wx.navigateTo({
        url: '../goods-detail/index?id=' + order.goods[0].id,
      })
      if (order.group && order.group.length) {
        const isHaveJoin = order.group.find(o => o.id === userInfo.openid);
        if (isHaveJoin && Object.keys(isHaveJoin).length) {
          wx.showToast({
            title: '您已经参加拼团',
            mask: true,
            icon: 'none',
          })
          return false
        }
      }
      const data = {
        id: userInfo.openid,
        nickName: userInfo.userInfo,
        avatarUrl: userInfo.avatarUrl,
        roles: '团员'
      }
      const res = (await wx.cloud.callFunction({
        name: 'editOrder',
        data: {
          id,
          data,
        },
      }));
      console.log(res, '---')
    } else {
      Dialog.confirm({
        title: '授权',
        message: '点击确认授权'
      }).then(() => {
        wx.navigateTo({
          url: `../login/index?id=${id}`,
        })
      }).catch(() => {})
    }
  },

  /**
   * 查看拼团成功后的订单
   */
  viewGroupOrder() {
    wx.switchTab({
      url: '../order/index',
    })
  },

  /**
   * 关闭底部规格选择弹框
   */
  onClose() {
    this.setData({
      show: false
    })
  },
})