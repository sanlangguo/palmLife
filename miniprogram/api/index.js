// const db = wx.cloud.database();
const API = {
  async login() {
    return await wx.cloud.callFunction({name: 'login'});
  },
  async inputUserInfo() {
    return await wx.cloud.callFunction({name: 'login'});
  }
};

export default API;