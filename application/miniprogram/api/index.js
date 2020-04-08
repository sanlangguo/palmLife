const db = wx.cloud.database();
const _ = db.command;
const API = {
  async login() {
    return await wx.cloud.callFunction({name: 'login'});
  },
  async getUserInfo(_openid) {
    return await db.collection('user').where({_openid}).get();
  },
  async insetUserInfo(data) {
    return await db.collection('user').add({data});
  },
  async updateUserInfo(uid, data) {
    return await db.collection('user').doc(uid).update({data});
  },
  async getCardList(openid) {
    return await db.collection('cart').where({openid}).get();
  },
  async addCards(data) {
    return await db.collection('cart').add({data});
  },
  async changeCards(uid, data) {
    return await db.collection('cart').doc(uid).update({data});
  },
  async deletCards() {
    return await db.collection('cart').add({data});
  },
  async getGoodsList() {
    return await db.collection('goods-list').aggregate().match({
      _id: ['1', '2'],
    }).end();
  }
};

export default API;