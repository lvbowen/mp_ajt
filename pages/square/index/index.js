// pages/square/index/index.js

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
    nameCardList: [],
    hasMarket: 1,   //0：没购买，看不到，1：购买，能看到
    noData:false,
    defaultAvatar: getApp().globalData.defaultAvatar,
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
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getPersonnelMarket();
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
    this.data.timestamp = +new Date();
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    if (+new Date() - this.data.timestamp < 888 ){
      return;
    }
    this.setData({
      inputShowed: false,
      inputVal: ""
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
    this.getPersonnelMarket();
  },
  /**
   * 获取人脉广场列表
   */
  getPersonnelMarket(){
      network.post('/api.do',{
        method:'nameCardHolder/getPersonnelMarket',
        param:JSON.stringify({
          fansId: getApp().globalData.cardFansId,
          character: this.data.inputVal.trim()
        })
      },(res) => {
        if(res.code == '0'){
          let _nameCardList= res.data.nameCardList;
           this.setData({
             hasMarket:res.data.hasMarket
           })
           if (_nameCardList.length === 0){
              this.setData({
                noData:true
              })
           }else{
             this.setData({
               nameCardList: _nameCardList,
               noData:false
             })
           }
        }
      })
  },
  /**
   * 收藏他人名片
   */
  collect(e){
    if (this.data.hasMarket == 0) {
      let ct = '您还不是会员，暂无权限添加关注';
      this.showModal(ct)
      return;
    }
    let _dataset = e.currentTarget.dataset;
    let collectFansId = _dataset.otherfansid, isCancel = _dataset.iscancel, index = _dataset.index; 
    network.post('/api.do', {
      method: 'nameCardHolder/dealNameCard',
      param: JSON.stringify({
        fansId: getApp().globalData.cardFansId,
        collectFansId: collectFansId,
        isCancel: Number(!isCancel)
      })
    }, (res) => {
      if (res.code == '0') {
        this.data.nameCardList[index].isCancel = Number(!isCancel);
        this.setData({
          nameCardList: this.data.nameCardList
        })
        if (isCancel == '0'){
          wx.showToast({
            icon:'none',
            title: '关注成功',
          })
        }else{
          wx.showToast({
            icon:'none',
            title: '取消关注',
          })
        }
      }
    })
  },
  /**
   * 图片加载出错则显示默认图片
   */
  binderror(e) {
    let { index } = e.currentTarget.dataset;
    this.data.nameCardList[index].headImgUrl = this.data.defaultAvatar;
    this.setData({
      nameCardList: this.data.nameCardList
    })
  },
  /**
   * 
   */
  showModal(ct){
    wx.showModal({
      title: '提示',
      content: ct,
      confirmText: '成为会员',
      success: function (res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '../../mine/buy/buy',
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  /**
   *  跳转
   */
  linkTo(e){
    if (this.data.hasMarket == 0) {
      let ct = '您还不是会员，暂无权限浏览人脉详情';
      this.showModal(ct)
      return;
    }
    let params = JSON.parse(e.currentTarget.dataset.json);
    wx.navigateTo({
      url: `/pages/card/shareCard/shareCard?fansId=${params.fansId}&cardId=${params.cardId}&fromPage=inside`,
    })
  }
})