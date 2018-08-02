// pages/mine/rolodex/rolodex.js
let network = require("../../../utils/network.js")
let util = require("../../../utils/util.js")
let commonApi = require("../../../utils/commonApi.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputShowed: false,
    inputVal: "",
    nameCardPersonal: null,
    cardTotal:0,
    nameCardList: [],
    defaultAvatar: getApp().globalData.defaultAvatar
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getNameCardHolder()
   
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
  // onShareAppMessage: function () {
  
  // }
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: "",
    });
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  },
  /**
   * 搜索
   */
  confirmSearch(e) {
    this.getNameCardHolder();
  },
  /**
   * 拨打电话
   */
  callPhone(e){
    let { phone } = e.currentTarget.dataset;
    wx.makePhoneCall({
      phoneNumber:  String(phone)
    })
  },
  /**
   * 获取名片夹列表
   */
  getNameCardHolder(){
    network.post('/api.do', {
      method: 'nameCardHolder/getNameCardHolder',
      param: JSON.stringify({
        fansId: getApp().globalData.cardFansId,
        character: this.data.inputVal.trim()
      })
    }, (res) => {
      if (res.code == '0') {
        this.setData({
          nameCardPersonal: res.data.nameCardPersonal,
          cardTotal: res.data.count
        })  
        if (res.data.nameCardList && res.data.nameCardList.length > 0){
          let arr = this.newSort(res.data.nameCardList);
          console.log(arr)
          this.setData({
            nameCardList:arr
          })
        }       
      }
    })  
  },
  /**
   * 重新排序
   */
  newSort(arr){
    var letters = "*ABCDEFGHJKLMNOPQRSTWXYZ".split('');
    var segs = [];
    var curr;
    letters.forEach((lett, j) => {
      curr = { letter: lett, data: [] };
      arr.forEach((item, i) => {
        for (var key in item) {
          if (item.hasOwnProperty(key) && lett == key.toUpperCase()) {
             curr.data.push(item[key])
          }
        }
      })
      if (curr.data.length) {
        segs.push(curr);
      }
    })
    return segs;
  },
  /**
   *  跳转
   */
  linkTo(e) {
    commonApi.saveFormId({
      formId: e.detail.formId
    })
    let params = JSON.parse(e.currentTarget.dataset.json);
    wx.navigateTo({
      url: `/pages/card/shareCard/shareCard?fansId=${params.fansId}&cardId=${params.cardId}&fromPage=inside`,
    })
  }
})