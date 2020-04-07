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
  },
  async updateUserInfo(openid, data) {
    console.log(openid, data, '---')
    return await db.collection('user').doc('dc65fe3e5e80a04b001b22f075115686').update({data: { receiveCity: "河南省郑州市新郑市1"}});
  }
};

export default API;