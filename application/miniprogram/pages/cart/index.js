import API from '../../api/index';
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import { orderNumber } from '../../tool.js';
Page({
  data: {
    checkedGoods: [],
    goods: [],
    cart: [],
    totalPrice: 0,
  },

  onShow() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    this.getGoodsList();
  },

  /**
   * 购物车商品列表
   */
  async getGoodsList(cartId) {
    const userInfo = wx.getStorageSync('userInfo');
    if (Object.keys(userInfo).length) {
      const card = await this.getUserCardList(userInfo.openid);
      if (card.data && card.data.length) {
        const data = JSON.parse(JSON.stringify(card.data[0]));
        delete data._openid;
        delete data.openid;
        delete data._id;
        const goods = data.goods;
        const ids = [];
        goods.map((item) => {
          ids.push(item.id)
        });
        const goodList = await API.getGoodsList(ids);
        if (goodList.data && goodList.data.length) {
          const fileList = [];
          goodList.data.map(item => fileList.push(item.fileId));
          const fileUrl = await API.getTempFileURL(fileList);
          if (fileUrl.fileList && fileUrl.fileList.length) {
            goodList.data.map((item, index) => {
              goods[index].coverImg = fileUrl.fileList[index].tempFileURL;
              goods[index].name = item.name;
              goods[index].price = item.price;
              goods[index].fileId = item.fileId;
              goods[index].originPrice = item.originPrice;
              goods[index].desc = item.desc;
              goods[index].unit = item.unit;
              goods[index].num = item.num;
            })
          }
          const checkedGoods = this.data.checkedGoods;
          if (cartId || checkedGoods.length>0) {
            let totalPrice = goods.reduce(
              (total, item) =>
              total + (checkedGoods.includes(item.id) ? item.originPrice * item.count : 0),
              0,
            );
            this.setData({
              totalPrice: totalPrice.toFixed(2) * 100,
            });
          }
          this.setData({
            goods,
            cart: card.data[0]
          })
        }
      } else {
        this.setData({
          checkedGoods: [],
          goods: [],
          cart: [],
        })
      }
    } else {
      this.setData({
        checkedGoods: [],
        goods: [],
        cart: [],
      })
    }
    wx.hideLoading();
  },

  /**
   * 查询用户购物车
   */
  async getUserCardList(openid) {
    return await API.getCardList(openid);
  },

  /**
   * 选择结算金额
   */
  onChange(event) {
    const {
      goods,
      checkedGoods
    } = this.data;
    const {
      id
    } = event.currentTarget.dataset;
    if (checkedGoods.includes(id)) {
      checkedGoods.splice(checkedGoods.findIndex(item => item == id), 1);
    } else {
      checkedGoods.push(id);
    }
    let totalPrice = goods.reduce(
      (total, item) =>
      total + (checkedGoods.includes(item.id) ? item.originPrice * item.count : 0),
      0,
    );
    this.setData({
      checkedGoods,
      totalPrice: totalPrice.toFixed(2) * 100,
    });
  },

  /**
   * 提交结算
   */
  async onSubmit() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.phone && userInfo.receiveCity && userInfo.name && userInfo.receiveDetailedAddress) {
      const {checkedGoods, goods, cart, totalPrice} = this.data;
      const orderData = {
        active: 1,
        openid: userInfo.openid,
        phone: userInfo.phone,
        receiveCity: userInfo.receiveCity,
        name: userInfo.name,
        receiveDetailedAddress: userInfo.receiveDetailedAddress,
        goods: [],
        createTime: new Date().getTime(),
        orderNumber: orderNumber(),
        totalPrice: (totalPrice/100),
      };
      if (checkedGoods.length === goods.length) {
        orderData.goods = goods;
        await API.deletCards(cart._id);
      } else {
        goods.map((item, index) => {
          checkedGoods.map(id => {
            if (item.id == id) {
              orderData.goods.push(item);
              cart.goods.splice(cart.goods.findIndex(item => item.id == id), 1);
            }
          })
        })
        await API.changeCards(cart._id, {
          goods: cart.goods
        });
      }
      const res =  await API.orderTotal(orderData);
      wx.navigateTo({
        url: '../order-detail/index?id='+res._id,
      })
    } else {
      Dialog.confirm({
        title: '收货信息',
        message: '请完善收货信息'
      }).then(() => {
        wx.navigateTo({
          url: '../user-info/index',
        })
      }).catch(() => {});
    }
  },

  /**
   * 减少|增加 商品
   */
  async editCart(e) {
    const goods = JSON.parse(JSON.stringify(this.data.cart.goods));
    const id = this.data.cart._id;
    const cartId = e.currentTarget.dataset.id;
    const action = e.currentTarget.dataset.action;
    goods.map(item => {
      if (item.id == cartId) {
        if (action == 'reduce') {
          if (item.count == 1) {
            wx.showToast({
              title: '左滑删除物品',
              icon: 'none',
              mask: true
            })
          } else {
            item.count -= 1;
          }
        } else {
          item.count += 1;
        }
      }
    });
    await API.changeCards(id, {
      goods
    });
    this.getGoodsList(cartId);
  },

  // 删除商品
  async deleteGood(e) {
    const {
      position
    } = e.detail;
    const cartId = e.currentTarget.dataset.id;
    const id = this.data.cart._id;
    if (position == 'right') {
      const goods = JSON.parse(JSON.stringify(this.data.cart.goods));
      if (goods.length > 1) {
        goods.splice(goods.findIndex(item => item.id == cartId), 1);
        console.log(goods, '-- goods')
        await API.changeCards(id, {
          goods
        });
      } else {
        await API.deletCards(id);
      }
      wx.showToast({
        title: '删除成功',
        icon: 'none',
        mask: true
      })
      this.getGoodsList();
    }
  },
});