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
  async changeCards(id, data) {
    return await db.collection('cart').doc(id).update({data});
  },
  async deletCards(id) {
    return await db.collection('cart').doc(id).remove();
  },
  async getGoodsList(ids) {
    return await db.collection('goods-list').where({
      _id: _.in(ids),
    }).get();
  },
  async getTempFileURL(fileList) {
    return await wx.cloud.getTempFileURL({ fileList })
  }
};

export default API;