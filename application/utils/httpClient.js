//封装请求，返回一个promise
const config = require('config.js');
import {
  utils,
  showPromptBox
} from "./util.js";

const formatUrl = function (url, parameters) {
  if (!parameters) {
    return url;
  } else {
    let arr = [];
    for (let n in parameters) {
      arr.push(n + '=' + parameters[n]);
    }

    if (!url.includes('?')) {
      return url + '?' + arr.join('&');
    } else {
      return url + '&' + arr.join('&');
    }
  }
};

const handleCustomError = error => {
  const data = {};
  switch (parseInt(error.code || '0')) {
    case 20010:
      data.title = '审核失败';
      data.content = '您已经是教练了';
      showPromptBox(data, (res) => {
        if (res.confirm) {
          wx.reLaunch({
            url: '/coach/pages/message/index',
          })
        }
      });
      break;
    case 20011:
      data.title = '审核失败';
      data.content = '邀请码不存在';
      showPromptBox(data);
      break;
    case 20012:
      data.title = '审核失败';
      data.content = '邀请码已被使用';
      showPromptBox(data);
      break;
    case 200004:
      wx.showToast({
        title: '日期填写有误',
        icon: "none",
        mask: true,
        duration: 1800
      });
      break;
    default:
      return false;
  }

  return true;
}

const handleServerError = (option, res) => {
  wx.navigateTo({
    url: '/pages/friendship-prompt/server-error/index',
  });
}

// 节流函数
function throttle(method, context, time) {
  clearTimeout(method.tId);
  method.tId = setTimeout(function () {
    method.call(context);
  }, time);
}

// 请求时显示loading
function showLoading() {
  wx.showLoading({
    title: '数据请求中',
    mask: true
  });

}

const HttpClient = {
  send: option => {
    // 线上获取token
    let headers = {
      "content-type": "application/json;charset=UTF-8;",
    };
    const startTime = new Date().getTime();
    return new Promise((success, fail) => {
      const endTime = new Date().getTime()
      wx.getNetworkType({
        success(res) {
          const networkType = res.networkType;
          if (networkType === '2g' || networkType === '3g') {
            throttle(showLoading, window, endTime - startTime);
          }
        }
      })

      wx.request({
        url: encodeURI(formatUrl(`${config.ApiEndpoint}/${option.url}`, option.parameters)),
        data: option.data,
        method: option.method,
        header: headers,
        success: (res) => {
          const statusCode = res.statusCode;
          if (statusCode >= 200 && statusCode < 300) {
            if (success) {
              success(res);
            }
          } else if (statusCode == 400) {
            const code = res.data.code;
            if (code) {
              success(code);
            } else {
              handleCustomError(res.data);
            }
          } else if (statusCode === 401 || statusCode === 403) {

          } else if (statusCode == 404) {
            if (/^api\/courses\/\d+/.test(option.url)) {
              wx.showToast({
                title: `课程不存在`,
                icon: "none",
                duration: 2000,
                success() {
                  wx.reLaunch({
                    url: '/pages/remote-control/remote-control',
                  })
                }
              })
              return
            }
            if (option.url.indexOf('cancel') != -1 && option.url.indexOf('liveCourse/book') != -1) {
              success(res);
              return
            }
            wx.showToast({
              title: `数据被外星人带走了。。。`,
              icon: "none",
              duration: 1000,
              success() {
                wx.reLaunch({
                  url: '/pages/remote-control/remote-control',
                })
              }
            })

          } else if (statusCode >= 500) {
            handleServerError(option, res);
          } else if (fail) {
            fail(res);
          }
        },
        fail: err => {
          if (fail) {
            fail(err);
          } else {
            handleServerError(option, err);
          }
        },
        complete: () => {
          wx.hideLoading();
        }
      });
    });
  },
  get: option => {
    option.method = 'GET';
    return HttpClient.send(option);
  },
  post: option => {
    option.method = 'POST';
    return HttpClient.send(option);
  },
  put: option => {
    option.method = 'PUT';
    return HttpClient.send(option);
  },
  delete: option => {
    option.method = 'DELETE';
    return HttpClient.send(option);
  },
  patch: option => {
    option.method = 'PATCH';
    return HttpClient.send(option);
  }
};

module.exports = {
  HttpClient
}