import API from '../../api/index';
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
const userInfo = getApp().globalData.userInfo;
Page({
  data: {
    checkedGoods: [],
    goods: [],
    cart: [],
    totalPrice: 0,
  },

  onShow() {
    this.getGoodsList();
  },

  /**
   * 购物车商品列表
   */
  async getGoodsList(cartId) {
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
        goods: [],
        cart: []
      })
    }
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
  onSubmit() {
    wx.showToast({
      title: '点击结算',
      icon: 'none'
    });
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
            Notify({
              type: 'warning',
              message: '左滑删除物品',
              duration: 900
            });
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
        await API.changeCards(id, {
          goods
        });
      } else {
        await API.deletCards(id);
      }
      Notify({
        type: 'success',
        message: '删除成功',
        duration: 900
      });
      this.getGoodsList();
    }
  }
});