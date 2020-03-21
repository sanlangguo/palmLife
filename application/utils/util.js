const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

var tsFormatTime = function(timestamp, format) {
  const formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  let returnArr = [];
  let date = new Date(timestamp * 1000);
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  let hour = date.getHours()
  let minute = date.getMinutes()
  let second = date.getSeconds()
  returnArr.push(year, month, day, hour, minute, second);
  returnArr = returnArr.map(formatNumber);
  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;

}
//封装 showModal 弹框
function showPromptBox(data, callback) {
  const call = whatTypeIs(callback);

  wx.showModal({
    title: data.title || '提示',
    content: data.content || '操作失误',
    showCancel: data.showCancel || false,
    cancelText: data.cancelText || '取消',
    cancelColor: data.cancelColor || '#000000',
    confirmText: data.confirmText || '确定',
    confirmColor: data.confirmColor || '#7A66FE',
    success(res) {
      if (call === 'Function') {
        callback(res);
      }
    },
    fail(error) {
      if (call === 'Function') {
        callback(error);
      }
    }
  })
}

module.exports = {
  formatTime: formatTime,
  tsFormatTime: tsFormatTime,
  showPromptBox,
}
