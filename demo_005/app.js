//app.js
App({
  onLaunch: function() {
    var that = this
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      success: res => {
        if (res.code) {
          console.log(res)
          /// 发起网络请求
          wx.request({
            url: 'https://api.techfoco.com/account/wxlogin',
            data: {
              code: res.code
            },
            header: {
              'Content-Type': 'application/json'
            },
            success: function(res) {
              var res = JSON.parse(res.data)
              console.log(res)
              wx.setStorage({
                key: 'openid',
                data: res.openid,
              });/// c存储openod
              that.globalData.openid = res.openid


            }
          })
        } else {
          console.log("登录失败" + res.errMsg)
        }
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              //  unionId可以将 res 发送给后台解码出
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null
  }
})