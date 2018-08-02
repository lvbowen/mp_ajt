// pages/mine/maker/maker.js
let commonApi = require("../../../utils/commonApi.js")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    showBack:'1',
    fromShare:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.fromShare) {
      this.setData({
        fromShare: true
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '我向您推荐“爱聚通”',
      path: '/pages/card/index/index',
      imageUrl: '/images/mine-path.png'
    }
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
   * 点击返回键
   */
  onBackEvent(e) {
    if (this.data.fromShare) {
      wx.reLaunch({
        url: '../../card/index/index',
      })
    }
  }
})