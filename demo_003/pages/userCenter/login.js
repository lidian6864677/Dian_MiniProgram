Page({

  /**
   * 页面的初始数据
   */
  data: {
    email: "",
    password: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  /**
   * 用户登录请求
   */
  login: function(e) {
    wx.showToast({
      title: '正在登录...',
      icon: 'loading',
      duration: 10000
    })
    /// 登录请求
    wx.request({
      url: 'https://api.gugujiankong.com/account/Login?email=' + this.data.email + '&password=' + this.data.password,
      header: {
        'Content-Type': 'application/json'
      },

      success: function(res) {
        wx.hideToast()
        console.log(res)
        var jsonStr = res.data;
        jsonStr = jsonStr.replace(" ", "");
        if (typeof jsonStr != 'object') {
          jsonStr = jsonStr.replace(/\ufeff/g, "");//重点
          var jj = JSON.parse(jsonStr);
          res.data = jj;
        }
        
        console.log(res.data)
        console.log(res.data.LoginStatus)
        
        if (res.data.LoginStatus == 1) {
          /// 进行状态存储
          wx.switchTab({
            url: '../index/index',
            success: function(res) {
              console.log("called switchTab")
            }
          })
        } else {
          wx.showModal({
            title: '登录失败',
            content: '请检测您填写的用户信息！',
            showCancel: false,
            success: function(res) {
              /// 失败的回调
            }
          })
        }


      }

    })

  },
  bindEmail: function(e) {
    this.setData({
      email: e.detail.value

    })
  },
  bindPassword: function(e) {
    this.setData({
      password: e.detail.value
    })

  }



})