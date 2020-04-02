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
  }
};

export default API;