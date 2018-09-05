import DataService from '../../datas/DataService';
import {getDateStr} from '../../utils/util';
import {LEVEL} from '../../config.js';

Page({
    data: {
        item: '',
        levelSelectData: [LEVEL.normal, LEVEL.warning, LEVEL.danger],
    },
  // 从相册选择照片或拍摄照片
  chooseImage() {
    let that = this;

    wx.chooseImage({
      count: 9,  // 最多选9张
      sizeType: ['origin', 'compressed'],
      sourceType: ['album', 'camera'],

      success: (res) => {
        this.setData({ mediaActionSheetHidden: true });
        this.showLoading('图片处理中...');
        that.writeContent(res, IMAGE);
      }
    })
  },

    onLoad(option) {
        const {id} = option;
        let item = DataService.findById(id).then((item) => {
            item['addDate'] = getDateStr(new Date(item['addDate']));
            console.log(item)
            this.setData({
                item: item
            });
        });
    }
});