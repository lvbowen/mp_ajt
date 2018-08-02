// pages/mine/index/index.js
let network = require("../../../utils/network.js")
let user = require("../../../utils/user.js")
let commonApi = require("../../../utils/commonApi.js")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    vipType: 0,  //0:不是会员，1：普通会员，2：终身会员（创客）
    personnalInfo: null
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideShareMenu();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getPersonnalInfo();
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
      return {
        title: '我向您推荐“爱聚通”',
        path: '/pages/card/index/index',
        imageUrl: '/images/mine-path.png'
      }
  },
  /**
   * 获取个人中心信息
   */
  getPersonnalInfo() {
    network.post('/api.do', {
      method: 'nameCard/getPersonnalInfo',
      param: JSON.stringify({
        fansId: getApp().globalData.cardFansId
      })
    }, (res) => {
      if (res.code == '0' && res.data.personnalInfo) {
        this.setData({
          personnalInfo: res.data.personnalInfo,    
          vipType: res.data.personnalInfo.vipType || 0
        })
      }
    })
  },
  /**
 * 保存formId
 */
  saveFormId(e) {
    commonApi.saveFormId({
      formId: e.detail.formId
    })
  },

  /**
   * 跳转
   */
  linkTo(e) {
    let { url } = e.currentTarget.dataset;
    let vipType = this.data.vipType;
    switch (url) {
      case '1':
        if (vipType == 0) {
          wx.navigateTo({
            url: '../buy/buy',
          })
        } else if (vipType == 1) {
          wx.navigateTo({
            url: '../buy/buy?pid=2',
          })
        } else {
          wx.navigateTo({
            url: '../maker/maker',
          })
        }
        break;
      case '2':
        let balance = 0;
        if (this.data.personnalInfo && this.data.personnalInfo.totalRewardMoney){
          balance = this.data.personnalInfo.totalRewardMoney;
        }      
        wx.navigateTo({
          url: '../cash/cash?balance=' + balance,
        })
        break;
      case '3':
        wx.switchTab({
          url: '../../card/index/index',
        })
        break;
      case '4':
        wx.navigateTo({
          url: '../visitorRecord/visitorRecord',
        })
        break;
      case '5':
        wx.navigateTo({
          url: '../memberPrivileges/memberPrivileges',
        })
        break;
      case '6':
        if (vipType == 0) {
          wx.navigateTo({
            url: '../buy/buy?pid=2',
          })
        } else if (vipType == 1) {
          wx.navigateTo({
            url: '../vipMember/vipMember',
          })
        } else {
          wx.navigateTo({
            url: '../maker/maker',
          })
        }
        break;
      case '7':
        wx.navigateTo({
          url: '../about/about',
        })
        break;
      case '8':
        wx.navigateTo({
          url: '../rolodex/rolodex',
        })
        break;
      default:
        break;
    }
  }
})