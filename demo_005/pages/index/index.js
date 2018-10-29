//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    feeds: [],
    page: 1
  },
  onLoad: function() {
    var that = this
    this.getData(that.data.page)
  },
  onReachBottom: function() {
    wx.showLoading({
      title: '加载更多',
    })
    var that = this
    this.getData(that.data.page)
  },

  getData: function(page) {
    if (page == 1) {
      wx.showLoading({
        title: '正在加载',
      })
    }
    var that = this
    wx.request({
      url: 'https://api.techfoco.com/feed/get?pageNumber=' + page + '&pageSize=10',
      method: 'get',
      header: {
        'content-Type': 'application/json'
      },

      success: function(res) {
        var res = JSON.parse(res.data)
        if (that.data.page > 1) {
          var feedTemp = that.data.feeds
          that.setData({
            feeds: feedTemp.concat(res),
            page: page + 1
          })
        } else {
          that.setData({
            feeds: res,
            page: page + 1
          })
        }
        console.log(res)
      },
      fail: function() {
        wx.showToast({
          title: '服务器异常',
          duration: 1500
        })
      },
      complete: function() {
        if (page >= 1) {
          wx.hideLoading()
        } else {
          wx.stopPullDownRefresh()

        }
      }
    })
  },
  tapItem: function(event) {
    var that = this
    var article = event.currentTarget.dataset.page
    // if (article.IsWeiXinArticle){
    //   wx.navigateTo({
    //     url: '../../pages/wxDefault/wxDefault',
    //   })
    // }else{
      wx.navigateTo({
        url: '../../pages/articleDetail/articleDetail?id=' + article.ArticleId,
      })
    // }

    console.log(event)


    // var that = this
    // var article = event.current

  }
})