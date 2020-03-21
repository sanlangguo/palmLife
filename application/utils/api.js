import {
  HttpClient
} from './httpClient.js';
const Api = {
  login: data => HttpClient.post({
    url: `api/login/miniapp`,
    data: data
  }).then(res => {
    res.data.userInfo.duration = Math.round(res.data.userInfo.duration / 60);
    wx.setStorageSync("userInfo", res.data.userInfo);
    wx.setStorageSync("token", res.data.token);
    return res;
  }),
  getUserInfo: () => HttpClient.get({
    url: `api/users/miniapp`,
  }).then(res => {
    if (res.data) {
      res.data.duration = Math.round(res.data.duration / 60);
      wx.setStorageSync('userInfo', res.data);
    }
    return res;
  }),
};

module.exports = {
  Api
}