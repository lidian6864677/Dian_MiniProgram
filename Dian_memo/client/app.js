//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config.js')
import { log, promiseHandle } from './utils/util.js';


App({
  getUserInfo(cb) {
    if (typeof cb !== "function") return;
    let that = this;
    if (that.globalData.userInfo) {
      cb(that.globalData.userInfo);
    } else {
      promiseHandle(wx.login).then(() => promiseHandle(wx.getUserInfo)).then(res => {
        that.globalData.userInfo = res.userInfo;
        cb(that.globalData.userInfo);
      }).catch(err => {
        log(err);
      });
    }
  },
  onLaunch: function () {
    // qcloud.setLoginUrl(config.service.loginUrl)
  },
  globalData: {
    userInfo: null
  },

  //自定义配置
  settings: {
    debug: true, //是否调试模式
    moreLink: 'http://github.com/oopsguy'
  }
}); 
