import API from "../../api/index"
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import {
  orderNumber
} from '../../tool.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods: {},
    count: 1,
    groupGoodsCount: 0,
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
      const order = (await API.getGroupOrderDetail(options.id)).data;
      const fileRes = await API.getTempFileURL([order.goods.fileId]);
      order.goods.coverImg = fileRes.fileList[0].tempFileURL;
      let time = 0;
      let groupGoodsCount = 0;
      if (order.groupExpireTime - new Date().getTime() > 0 && order.expireTime - new Date().getTime() > 0) {
        time = order.groupExpireTime - new Date().getTime();
      } else {
        // 更新订单状态(拼团失败)
        wx.cloud.callFunction({
          name: 'editOrder',
          data: {
            id: options.id,
            active: 5,
            updateTime: new Date().getTime(),
          },
        })
      }

      order.group.map(item => {
        if (item.id == userInfo.openid) {
          this.setData({
            hasUserGroup: true
          })
        }
        groupGoodsCount += item.count;
      })
      this.setData({
        groupGoodsCount,
        order,
        time,
        id: options.id,
        userInfo,
        currentPrice: order.goods.originPrice
      })
      wx.hideLoading();
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
  onShareAppMessage() {
    const {
      order,
      id,
      userInfo
    } = this.data;
    return {
      title: `【${userInfo.nickName ? userInfo.nickName : '好友'}@我】开来拼 ${order.goods.name}`,
      path: '/pages/group-details/index?id=' + id,
      imageUrl: `${order.goods.coverImg}`,
    }
  },

  /**
   * 参加拼团
   */
  async joinFightTogether() {
    const {
      id,
      order,
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
      const goods = (await API.getGoodsDetail(order.goods.id)).data;
      this.setData({
        goods,
        show: true,
      })
      wx.hideLoading();
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

  /**
   * 大于库存时提示
   */
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
   * 更改数量
   */
  onGoodsCounts(e) {
    const {
      order
    } = this.data;
    const currentPrice = (order.goods.originPrice * e.detail).toFixed(2);
    this.setData({
      count: e.detail,
      currentPrice
    })
  },

  /**
   * 下一步确认加入拼团
   */
  async next() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    const { id, count, userInfo, order, currentPrice, goods, groupGoodsCount } = this.data;
    // 查看用户是否填写收货信息
    if (!userInfo.name || !userInfo.phone || !userInfo.receiveCity || !userInfo.receiveDetailedAddress) {
      wx.hideLoading();
      Dialog.confirm({
        title: '收货信息',
        message: '请完善收货信息'
      }).then(() => {
        wx.navigateTo({
          url: '../user-info/index?groupId=' + id,
        })
      }).catch(() => {});
      return false;
    }

    const data = {
      id: userInfo.openid,
      nickName: userInfo.userInfo,
      avatarUrl: userInfo.avatarUrl,
      roles: '团员',
      count
    }
    let active = 2;
    if ((order.groupPurchaseNumber - order.group.length) == 1) {
      active = 3;
      await wx.cloud.callFunction({
        name: 'editOrder',
        data: {
          id,
          active,
          updateTime: new Date().getTime(),
        },
      });
      // 更新商品库存数量
      await API.editGoodsDetails(goods._id, {num: goods.num - (groupGoodsCount + count) <= 0 ? goods.num : goods.num - (groupGoodsCount + count)});
    }
    const res = await API.editGroupOrder(id, data);
    delete order._id;
    delete order._openid;
    delete order.groupPurchaseNumber;
    order.active = active;
    order.name = userInfo.name;
    order.phone = userInfo.phone;
    order.receiveCity = userInfo.receiveCity;
    order.receiveDetailedAddress = userInfo.receiveDetailedAddress;
    order.areaCode = userInfo.areaCode;
    order.createTime = new Date().getTime();
    order.goods = [{...order.goods, count}];
    order.totalPrice = currentPrice;
    order.orderNumber = orderNumber();
    order.group = true;
    await API.orderTotal(order);
    if (res.stats.updated == 1) {
      wx.hideLoading({
        complete: () => {
          wx.showToast({
            title: '拼团成功',
            mask: true,
            duration: 4000,
            success() {
              wx.reLaunch({
                url: '../order/index',
              })
            }
          })
        },
      })
    }
  }
})