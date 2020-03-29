const db = wx.cloud.database();
const API = {
  async login() {
    return await wx.cloud.callFunction({name: 'login'});
  },
  async getUserInfo(_openid) {
    return await db.collection('user').where({_openid}).get();
  },
  async insetUserInfo(data) {
    return await db.collection('user').add({data});
  }
};

export default API;