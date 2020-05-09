const db = wx.cloud.database();
const _ = db.command;
wx.cloud.init({
  env: wx.cloud.DYNAMIC_CURRENT_ENV,
  traceUser: true,
})
const API = {
  async login() {
    return await wx.cloud.callFunction({
      name: 'login'
    });
  },
  async getUserInfo(_openid) {
    return await db.collection('user').where({
      _openid
    }).get();
  },
  async insetUserInfo(data) {
    return await db.collection('user').add({
      data
    });
  },
  async updateUserInfo(uid, data) {
    return await db.collection('user').doc(uid).update({
      data
    });
  },
  async getCardList(openid) {
    return await db.collection('cart').where({
      openid
    }).get();
  },
  async addCards(data) {
    return await db.collection('cart').add({
      data
    });
  },
  async changeCards(id, data) {
    return await db.collection('cart').doc(id).update({
      data
    });
  },
  async deletCards(id) {
    return await db.collection('cart').doc(id).remove();
  },
  async getGoodsList(ids) {
    return await db.collection('goods-list').where({
      _id: _.in(ids),
    }).get();
  },
  async filterBySortGoodsList(sort, page) {
    return await db.collection('goods-list').where({
      sort: _.eq(sort)
    }).skip(page || 0).limit(6).get();
  },
  async getGroupBuyGoods(groupBuy) {
    return await db.collection('goods-list').where({
      groupBuy: _.eq(groupBuy)
    }).skip(0).limit(5).get();
  },
  async getGoodsCount(sort) {
    return await db.collection('goods-list').where({
      sort: _.eq(sort)
    }).count();
  },
  async getGoodsDetail(id) {
    return await db.collection('goods-list').doc(id).get();
  },
  async getTempFileURL(fileList) {
    return await wx.cloud.getTempFileURL({
      fileList: fileList
    })
  },
  async orderTotal(data) {
    return await db.collection('order').add({
      data
    });
  },
  async getAllOrderList(page) {
    return await db.collection('order').orderBy('createTime', 'desc').skip(page).limit(4).get();
  },
  async deletOrder(id) {
    return await db.collection('order').doc(id).remove();
  },
  async getOrderCount() {
    return await db.collection('order').count();
  },
  async filterOrder(active, page) {
    return await db.collection('order').orderBy('createTime', 'desc').where({
      active: _.eq(active)
    }).skip(page).limit(4).get();
  },
  async getOrderActiveCount(active) {
    return await db.collection('order').where({
      active: _.eq(active)
    }).count();
  },
  async getOrderDetail(_id) {
    return await db.collection('order').where({
      _id
    }).get();
  },
  async getMerchantInfo() {
    return await db.collection('merchant').get();
  },
  async updateOrder(id, data) {
    return await db.collection('order').doc(id).update({
      data
    });
  },
  async getHomeConfig() {
    return await db.collection('home-config').get();
  },
  async checkUserGroup(uid, gid) {
    return await db.collection('order')
      .where({
        'group.id': uid,
        groupbuy: true,
        'goods.id': gid
      }).get()
  }
};

export default API;