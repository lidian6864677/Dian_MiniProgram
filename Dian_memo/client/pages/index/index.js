import DataService from '../../datas/DataService';
import {
  LEVEL,
  service
} from '../../config.js';

import {
  promiseHandle,
  log,
  formatNumber
} from '../../utils/util.js';
// var qcloud = require('../../vendor/wafer2-client-sdk/index')
var qcloud = require('../../vendor/wafer2-client-sdk/index.js')
// var con = require('../../config.js')
var util = require('../../utils/util.js')

Page({
  data: {
    showMonth: {},
    data: {},
    selectDateText: '',
    pickerDateValue: '',

    isSelectMode: false,
    isMaskShow: false,
    isEditMode: false,

    // modal
    isModalShow: false,
    modalMsg: '',

    //事项等级数据
    levelSelectedValue: LEVEL.normal,
    levelSelectData: [LEVEL.normal, LEVEL.warning, LEVEL.danger],

    // updatePanel 数据
    updatePanelTop: 10000,
    updatePanelAnimationData: {},
    todoInputValue: '',
    todoTextAreaValue: '',
    imgUrl: '',

    // 事项列表
    itemList: [],
    editItemList: [], //编辑勾选中的事项id
    tempFilePaths: [] ///  选择的相册图片
  },

  //事件处理函数
  bindViewTap: function() {
    console.log("--bindViewTap--")
    // 从相册选择照片或拍摄照片


    wx.chooseImage({
      count: 9, // 最多选9张
      sizeType: ['origin', 'compressed'],
      sourceType: ['album', 'camera'],

      success: (res) => {
        this.setData({
          mediaActionSheetHidden: true
        });
        this.showLoading('图片处理中...');
        that.writeContent(res, IMAGE);
      }

    })

  },
  mediaTouch() {
    console.log("调起相册");
    var that = this

    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        console.log(res)
        that.setData({
          tempFilePaths: res.tempFilePaths
        })
        console.log(that.tempFilePaths)
      },
      fail: function() {
        // fail
        console.log('选择图片失败1')
      },
      complete: function() {
        // complete
        console.log('选择图片完成2')
      }
    })

  },


  onLoad() {
    this.bindGetUserInfo()
    let _this = this;
    promiseHandle(wx.getSystemInfo).then((data) => {
      _this.setData({
        updatePanelTop: data.windowHeight
      });
    });
    changeDate.call(this);
  },
  bindGetUserInfo: function () {
    if (this.data.logged) return

    util.showBusy('正在登录')

    const session = qcloud.Session.get()

    if (session) {
      // 第二次登录
      // 或者本地已经有登录态
      // 可使用本函数更新登录态
      qcloud.loginWithCode({
        success: res => {
          this.setData({ userInfo: res, logged: true })
          util.showSuccess('登录成功')
        },
        fail: err => {
          console.error(err)
          util.showModel('登录错误', err.message)
        }
      })
    } else {
      // 首次登录
      qcloud.login({
        success: res => {
          this.setData({ userInfo: res, logged: true })
          util.showSuccess('登录成功')
        },
        fail: err => {
          console.error(err)
          util.showModel('登录错误', err.message)
        }
      })
    }
  },
  

  onReady() {
    loadItemListData.call(this);
  },

  datePickerChangeEvent(e) {
    const date = new Date(Date.parse(e.detail.value));
    changeDate.call(this, new Date(date.getFullYear(), date.getMonth(), 1));
  },

  changeDateEvent(e) {
    const {
      year,
      month
    } = e.currentTarget.dataset;
    changeDate.call(this, new Date(year, parseInt(month) - 1, 1));
  },

  dateClickEvent(e) {
    const {
      year,
      month,
      date
    } = e.currentTarget.dataset;
    const {
      data
    } = this.data;
    let selectDateText = '';

    data['selected']['year'] = year;
    data['selected']['month'] = month;
    data['selected']['date'] = date;

    this.setData({
      data: data
    });

    changeDate.call(this, new Date(year, parseInt(month) - 1, date));
  },

  showUpdatePanelEvent() {
    showUpdatePanel.call(this);
  },

  closeUpdatePanelEvent() {
    closeUpdatePanel.call(this);
  },

  editClickEvent() {
    this.setData({
      isEditMode: true
    });
  },

  // 事项列表项长按动作事件
  listItemLongTapEvent(e) {
    const {
      isEditMode
    } = this.data;
    const {
      id
    } = e.currentTarget.dataset;
    let _this = this;
    //如果不是编辑勾选模式下才生效
    if (!isEditMode) {
      const itemList = ['详情', '删除'];
      promiseHandle(wx.showActionSheet, {
          itemList: itemList,
          itemColor: '#2E2E3B'
        })
        .then((res) => {
          if (!res.cancel) {
            switch (itemList[res.tapIndex]) {
              case '详情':
                wx.navigateTo({
                  url: '../detail/detail?id=' + id
                });
                break;
              case '删除':
                new DataService({
                  _id: id
                }).delete().then(() => {
                  loadItemListData.call(_this);
                });
                break;
            }
          }
        });
    }
  },

  //取消编辑事件
  cancelEditClickEvent() {
    this.setData({
      isEditMode: false
    });
    resetItemListDataCheck.call(this);
  },

  // 事项标题文本框变化事件
  todoInputChangeEvent(e) {
    const {
      value
    } = e.detail;
    this.setData({
      todoInputValue: value
    });
  },

  //事项内容多行文本域变化事件
  todoTextAreaChangeEvent(e) {
    const {
      value
    } = e.detail;
    this.setData({
      todoTextAreaValue: value
    });
  },

  // 选择事项等级事件  
  levelClickEvent(e) {
    const {
      level
    } = e.currentTarget.dataset;
    this.setData({
      levelSelectedValue: level
    });
  },

  // 保存事项数据
  saveDataEvent() {
    const {
      todoInputValue,
      todoTextAreaValue,
      levelSelectedValue,
      tempFilePaths
    } = this.data;
    const {
      year,
      month,
      date
    } = this.data.data.selected;


    if (todoInputValue !== '') {
      var filePath = tempFilePaths[0]
      util.showBusy('正在上传')
      // 上传图片
      var that = this
      wx.uploadFile({
        url: service.uploadUrl,
        filePath: filePath,
        name: 'file',

        success: function(res) {
          util.showSuccess('上传图片成功')
          console.log("上传图片成功")
          console.log(res)
          res = JSON.parse(res.data)
          console.log(res)
          that.setData({
            imgUrl: res.data.imgUrl
          })
          
        },

        fail: function(err) {
          util.showModel('登录错误', err.message)
        },
        complete: function(e){
          that.updataFile()
        }

      })

    } else {
      showModal.call(this, '请填写事项内容');
    }
  },
  updataFile(){
    util.showBusy('处理中')
    console.log("调用接口")
    const {
      todoInputValue,
      todoTextAreaValue,
      levelSelectedValue,
      tempFilePaths,
      imgUrl
    } = this.data;
    const {
      year,
      month,
      date
    } = this.data.data.selected;
    var that = this
    wx.request({
      url: "http://192.168.1.108:8888/calendar/insert",
      header: {
        'Content-Type': 'application/json'
      },
      method: "POST",
      data: {
        memoTitle: todoInputValue,
        memoConcent: todoTextAreaValue,
        memoPic: imgUrl,
        memoLevel: levelSelectedValue,
        mattersDate: year + "-" + month + '-' + date,
        addDate: year + "-" + month + '-' + date
      },
      success(result) {
        console.log("chenggon： " + result)
        util.showSuccess('成功')
        that.saveData()
      },
      fail(err) {
        util.showModel('登录错误', err.message)
        // opts.fail(err)
      },
      complete: function (res) {
        console.log("接口错误")
        if (res == null || res.data == null) {
          util.showModel('保存失败',res.errMsg)
          return;
        }
      }
       
    })
  },

  saveData() {
    console.log("保存本地")
    const {
      todoInputValue,
      todoTextAreaValue,
      levelSelectedValue,
      tempFilePaths,
      imgUrl
    } = this.data;
    const {
      year,
      month,
      date
    } = this.data.data.selected;
    let promise = new DataService({
      title: todoInputValue,
      tempFilePaths: tempFilePaths,
      imgUrl: imgUrl,
      content: todoTextAreaValue,
      level: levelSelectedValue,
      year: year,
      month: parseInt(month) - 1,
      date: date
    }).save();


    promise && promise.then(() => {
      //清空表单
      this.setData({
        todoTextAreaValue: '',
        levelSelectedValue: LEVEL.normal,
        todoInputValue: '',
        tempFilePaths: [],
        imgUrl: ''
      });
      loadItemListData.call(this);
    })
        
        closeUpdatePanel.call(this);


    
  },

  //批量删除事件
  removeRangeTapEvent() {
    let {
      itemList
    } = this.data;
    if (!itemList) return;
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '确定要删除选定的事项？',
      success: (res) => {
        if (res.confirm) {
          DataService.deleteRange(_this.data.editItemList).then(() => {
            loadItemListData.call(_this);
          });
          _this.setData({
            editItemList: [],
            isEditMode: false
          });
        }
      }
    });
  },

  listItemClickEvent(e) {
    const {
      isEditMode
    } = this.data;
    const {
      id
    } = e.currentTarget.dataset;

    if (!isEditMode) {
      this.listItemLongTapEvent(e); //由于元素的长按和点击事件有冲突，暂时合并在一起，直接调用长按事件
      return;
    }

    let data = this.data.itemList || [];
    let editItemList = this.data.editItemList || [];
    const index = data.findIndex((item) => {
      return item['_id'] == id;
    });

    if (index >= 0) {
      data[index]['checked'] = !data[index]['checked'];
      const tIndx = editItemList.findIndex((item) => {
        return item == id;
      });
      if (data[index]['checked']) {
        tIndx >= 0 || editItemList.push(id);
      } else {
        editItemList.splice(tIndx, 1);
      }
      this.setData({
        itemList: data,
        editItemList: editItemList
      });
    }
  },

  //提示模态窗口关闭事件
  closeModalEvent() {
    closeModal.call(this);
  }
});






/**
 * 显示事项数据添加更新面板
 */
function showUpdatePanel() {
  let animation = wx.createAnimation({
    duration: 600
  });
  animation.translateY('-100%').step();
  this.setData({
    updatePanelAnimationData: animation.export()
  });
}

/**
 * 显示模态窗口
 * @param {String} msg 显示消息
 */
function showModal(msg) {
  this.setData({
    isModalShow: true,
    isMaskShow: true,
    modalMsg: msg
  });
}

/**
 * 关闭模态窗口
 */
function closeModal() {
  this.setData({
    isModalShow: false,
    isMaskShow: false,
    modalMsg: ''
  });
}

/**
 * 关闭事项数据添加更新面板
 */
function closeUpdatePanel() {
  let animation = wx.createAnimation({
    duration: 600
  });
  animation.translateY('100%').step();
  this.setData({
    updatePanelAnimationData: animation.export()
  });
}

/**
 * 加载事项列表数据
 */
function loadItemListData() {
  const {
    year,
    month,
    date
  } = this.data.data.selected;
  let _this = this;
  DataService.findByDate(new Date(Date.parse([year, month, date].join('-')))).then((data) => {
    _this.setData({
      itemList: data
    });
  });

}

/**
 * 重置是项列表勾选记录
 */
function resetItemListDataCheck() {
  let data = this.data.itemList || [];
  for (let i = 0, len = data.length; i < len; i++) {
    data[i]['checked'] = false;
  }
  this.setData({
    itemList: data
  });
}

/**
 * 变更日期数据
 * @param {Date} targetDate 当前日期对象
 */
function changeDate(targetDate) {
  let date = targetDate || new Date();
  let currentDateObj = new Date();

  let showMonth, //当天显示月份
    showYear, //当前显示年份
    showDay, //当前显示星期
    showDate, //当前显示第几天
    showMonthFirstDateDay, //当前显示月份第一天的星期
    showMonthLastDateDay, //当前显示月份最后一天的星期
    showMonthDateCount; //当前月份的总天数

  let data = [];

  showDate = date.getDate();
  showMonth = date.getMonth() + 1;
  showYear = date.getFullYear();
  showDay = date.getDay();

  showMonthDateCount = new Date(showYear, showMonth, 0).getDate();
  date.setDate(1);
  showMonthFirstDateDay = date.getDay(); //当前显示月份第一天的星期
  date.setDate(showMonthDateCount);
  showMonthLastDateDay = date.getDay(); //当前显示月份最后一天的星期  

  let beforeDayCount = 0,
    beforeYear, //上页月年份
    beforMonth, //上页月份
    afterYear, //下页年份
    afterMonth, //下页月份
    afterDayCount = 0, //上页显示天数
    beforeMonthDayCount = 0; //上页月份总天数

  //上一个月月份
  beforMonth = showMonth === 1 ? 12 : showMonth - 1;
  //上一个月年份
  beforeYear = showMonth === 1 ? showYear - 1 : showYear;
  //下个月月份
  afterMonth = showMonth === 12 ? 1 : showMonth + 1;
  //下个月年份
  afterYear = showMonth === 12 ? showYear + 1 : showYear;

  //获取上一页的显示天数
  if (showMonthFirstDateDay != 0)
    beforeDayCount = showMonthFirstDateDay - 1;
  else
    beforeDayCount = 6;

  //获取下页的显示天数
  if (showMonthLastDateDay != 0)
    afterDayCount = 7 - showMonthLastDateDay;
  else
    showMonthLastDateDay = 0;

  //如果天数不够6行，则补充完整
  let tDay = showMonthDateCount + beforeDayCount + afterDayCount;
  if (tDay <= 35)
    afterDayCount += (42 - tDay); //6行7列 = 42

  let selected = this.data.data['selected'] || {
    year: showYear,
    month: showMonth,
    date: showDate
  };
  let selectDateText = selected.year + '年' + formatNumber(selected.month) + '月' + formatNumber(selected.date) + '日';

  data = {
    currentDate: currentDateObj.getDate(), //当天日期第几天
    currentYear: currentDateObj.getFullYear(), //当天年份
    currentDay: currentDateObj.getDay(), //当天星期
    currentMonth: currentDateObj.getMonth() + 1, //当天月份
    showMonth: showMonth, //当前显示月份
    showDate: showDate, //当前显示月份的第几天 
    showYear: showYear, //当前显示月份的年份
    beforeYear: beforeYear, //当前页上一页的年份
    beforMonth: beforMonth, //当前页上一页的月份
    afterYear: afterYear, //当前页下一页的年份
    afterMonth: afterMonth, //当前页下一页的月份
    selected: selected,
    selectDateText: selectDateText
  };

  let dates = [];
  let _id = 0; //为wx:key指定

  if (beforeDayCount > 0) {
    beforeMonthDayCount = new Date(beforeYear, beforMonth, 0).getDate();
    for (let fIdx = 0; fIdx < beforeDayCount; fIdx++) {
      dates.unshift({
        _id: _id,
        year: beforeYear,
        month: beforMonth,
        date: beforeMonthDayCount - fIdx
      });
      _id++;
    }
  }

  for (let cIdx = 1; cIdx <= showMonthDateCount; cIdx++) {
    dates.push({
      _id: _id,
      active: (selected['year'] == showYear && selected['month'] == showMonth && selected['date'] == cIdx), //选中状态判断
      year: showYear,
      month: showMonth,
      date: cIdx
    });
    _id++;
  }

  if (afterDayCount > 0) {
    for (let lIdx = 1; lIdx <= afterDayCount; lIdx++) {
      dates.push({
        _id: _id,
        year: afterYear,
        month: afterMonth,
        date: lIdx
      });
      _id++;
    }
  }



  data.dates = dates;


  this.setData({
    data: data,
    pickerDateValue: showYear + '-' + showMonth
  });
  loadItemListData.call(this);

}