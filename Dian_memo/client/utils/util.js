// const formatTime = date => {
//   const year = date.getFullYear()
//   const month = date.getMonth() + 1
//   const day = date.getDate()
//   const hour = date.getHours()
//   const minute = date.getMinutes()
//   const second = date.getSeconds()

//   return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
// }

// const formatNumber = n => {
//   n = n.toString()
//   return n[1] ? n : '0' + n
// }


// 显示繁忙提示
var showBusy = text => wx.showToast({
    title: text,
    icon: 'loading',
    duration: 10000
})

// 显示成功提示
var showSuccess = text => wx.showToast({
    title: text,
    icon: 'success'
})

// 显示失败提示
var showModel = (title, content) => {
    wx.hideToast();

    wx.showModal({
        title,
        content: JSON.stringify(content),
        showCancel: false
    })
}

function formatTime(date) {
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()

  let hour = date.getHours()
  let minute = date.getMinutes()
  let second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getDateStr(date) {
  if (!date) return '';
  return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
}

/**
 * 生成GUID序列号
 * @returns {string} GUID
 */
function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 记录日志
 * @param {Mixed} 记录的信息
 * @returns {Void}
 */
function log(msg) {
  if (!msg) return;
  if (getApp().settings['debug'])
    console.log(msg);
  let logs = wx.getStorageSync('logs') || [];
  logs.unshift(msg)
  wx.setStorageSync('logs', logs)
}

/**
 * @param {Function} func 接口
 * @param {Object} options 接口参数
 * @returns {Promise} Promise对象
 */
function promiseHandle(func, options) {
  options = options || {};
  return new Promise((resolve, reject) => {
    if (typeof func !== 'function')
      reject();
    options.success = resolve;
    options.fail = reject;
    func(options);
  });
}

module.exports = {
  formatTime: formatTime,
  guid: guid,
  log: log,
  promiseHandle: promiseHandle,
  getDateStr: getDateStr,
  formatNumber: formatNumber,
  formatTime: formatTime, 
  showBusy: showBusy, 
  showSuccess: showSuccess,
  showModel: showModel 
}

