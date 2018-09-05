/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var host = 'https://r3wvbdfv.qcloud.la';



// 下面的地址配合云端 Demo 工作
var service = {
  host,

  // 登录地址，用于建立会话
  loginUrl: `${host}/weapp/login`,

  // 测试的请求地址，用于测试会话
  requestUrl: `${host}/weapp/user`,

  // 测试的信道服务地址
  tunnelUrl: `${host}/weapp/tunnel`,

  // 上传图片接口
  uploadUrl: `${host}/weapp/upload`
}

var LEVEL = {
  normal: 1,
  warning: 2,
  danger: 3
}

module.exports = {
  service: service,
  ITEMS_SAVE_KEY: 'todo_item_save_Key',
  LEVEL: LEVEL,
};
// module.exports = config;