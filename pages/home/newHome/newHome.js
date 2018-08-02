// pages/home/newHome/newHome.js
const utils = require("../../../utils/util.js")
let network = require("../../../utils/network.js")
const user = require("../../../utils/user.js")
let commonApi = require("../../../utils/commonApi.js")

Page({

    /**
     * 页面的初始数据
     */
    data: {
        options: null,
        companyInfo: null,
        positionList: [],
        page: null,
        pageNum: 1,
        tabIndex: 1,
        isOpen: false,
        inputVal: '',
        inputShowed: false,
        confirmInputVal: '',
        hasPosition: false,
        showTabbar:false,
        otherCardId:'',     //他人的名片id（人脉广场或分享）
        otherFansId: '',     //他人的粉丝id（人脉广场或分享）
        fromPage:'',
        canShare: true,
        isSelf:false,     //是否是自己的微官网
        isOnload:true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //隐藏分享菜单
        wx.hideShareMenu();
        if (options) {
            this.setData({
                options: options
            })
        }
        if (options.scene) {
            //海报扫码进入
            var scene = decodeURIComponent(options.scene)
            var arr1 = scene.split("&");
            var obj = {};
            arr1.forEach(function (item) {
                obj[item.split('=')[0]] = item.split('=')[1]
            })
            this.setData({
              showTabbar:true
            })
            getApp().globalData.shareCompanyInfoId = obj.cId;
            this.setData({
              otherCardId: obj.cardId,
              otherFansId: obj.fansId,
            })
        } else if (options.cId) {
            //分享链接、模板消息、人脉广场、名片夹进入
            this.setData({
              showTabbar: true
            })
            getApp().globalData.shareCompanyInfoId = options.cId;
            this.setData({
              otherCardId: options.cardId,
              otherFansId: options.fansId,
            })
        }
        if (options.fromPage == 'inside' || Number(options.cId) === 0){
           //来自tabbar切换或模板消息但访客没公司信息
           this.setData({
             fromPage: options.fromPage ? options.fromPage : ''
           })
           if (getApp().globalData.cardFansId == options.fansId) {
             this.setData({
               isSelf: true
             })
           }
           if (!options.cId || Number(options.cId) === 0){
              this.setData({
                noData:true,
                otherCardId: options.cardId,
                otherFansId: options.fansId,
                showTabbar: true
              })
              return false;
           }
        }
        let globalData = getApp().globalData;
        if (globalData.cardFansId &&  globalData.nameCardId && (globalData.hrUser || options.fromPage == 'inside')) {
            //已登录
            this.getCompanyBasicInfo();
            this.compareFansId();
            this.sendTemplateMsg();
        } else {
            //未登录
          user.cardLogin((data) => {
              this.generateNameCardId(data);
              this.getCompanyBasicInfo();
              this.compareFansId();
            }, () => {
              this.sendTemplateMsg();
            })
        }
        if (options.from == 'share' || options.from == 'template' || options.scene) {
          //外部打开        
          getApp().globalData.shareFansId = this.data.otherFansId;    //打开分享的微官网再去购买也要分佣
          getApp().globalData.shareCardId = this.data.otherCardId;
          getApp().globalData.appLaunch = true;
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
        if(!this.data.isOnload){
          this.sendTemplateMsg();
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        this.setData({
          isOnload:false
        })
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
    compareFansId(){
      let options = this.data.options;
      if (getApp().globalData.cardFansId == this.data.otherFansId || !this.data.otherFansId){
          this.setData({
            isSelf:true
          })
      }
      if ((getApp().globalData.cardFansId == this.data.otherFansId || !this.data.otherFansId) && !getApp().globalData.isVip) {
        this.setData({
          canShare: false
        })
      }

    },
    /**
     * 返回键
     */
    onBackEvent(e) {
      wx.reLaunch({
        url: '../../card/index/index',
      })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        let companyInfoId = getApp().globalData.shareCompanyInfoId || (getApp().globalData.hrUser && getApp().globalData.hrUser.companyinfoId);
        let cardId = this.data.otherCardId || getApp().globalData.nameCardId;   //他人或自己的名片id
        let fansId = this.data.otherFansId || getApp().globalData.cardFansId;   //他人或自己的粉丝id
        return {
            title: this.data.companyInfo.companyName + '正在使用爱聚通小程序拓展商机',
            path: `/pages/home/newHome/newHome?cId=${companyInfoId}&cardId=${cardId}&fansId=${fansId}&from=share`,  
        }
    },
    /**
     * 若0，则生成名片id
     */
    generateNameCardId(data){
      let globalData = getApp().globalData;
      if (data.nameCardId == 0) {
        network.post('/api.do', {
          method: "nameCard/generateNameCardId",
          param: JSON.stringify({
            headImgUrl: globalData.userInfo ? globalData.userInfo.avatarUrl : '',
            nickName: globalData.userInfo ? globalData.userInfo.nickName : '',
            fansId: globalData.cardFansId,
            sessionId: wx.getStorageSync("cardSessionId")
          })
        }, (res) => {
          if (res.code == '0') {
            globalData.nameCardId = res.data.nameCardId;
          } else {
            wx.showToast({
              icon: 'none',
              title: res.message,
            })
          }
        })
      }else{
        globalData.nameCardId = data.nameCardId;
      }
    },
    /**
    * 获取公司信息
    */
    getCompanyBasicInfo() {
        network.post('/api.do', {
            method: 'quickSp/getCompanyBasicInfoNew',
            param: JSON.stringify({
                reqType: 1,
                sessionId: wx.getStorageSync('sessionId'),
                visitFansId: getApp().globalData.cardFansId,
                companyinfoId: getApp().globalData.shareCompanyInfoId || (getApp().globalData.hrUser && getApp().globalData.hrUser.companyinfoId)
            })
        }, (res) => {
            if (res.code == 0) {
                if (res.data.introduction) {
                    res.data.introduction = res.data.introduction.replace(/\n/g, '<br/>')
                }
                if (!res.data.companyName || !res.data.companyPhone){
                  this.setData({
                    noData:true
                  })
                }else{
                  this.setData({
                    companyInfo: res.data,
                    noData:false
                  })
                }          
            }
        })
    },
    /**
  * 获取职位列表
  */
    getPositionList() {
        network.post('/api.do', {
            method: 'quickSp/getPositionList',
            param: JSON.stringify({
                companyinfoId: getApp().globalData.shareCompanyInfoId || (getApp().globalData.hrUser && getApp().globalData.hrUser.companyinfoId),
                positionName: this.data.inputVal,
                pageNum: this.data.pageNum,
                pageSize: 10
            })
        }, (res) => {
            if (res.code == 0) {
                this.setData({
                    positionList: this.data.positionList.concat(res.data.positionList),
                    page: res.data.page
                })
                if (!this.data.inputVal && res.data.positionList.length > 0) {
                    this.setData({
                        hasPosition: true
                    })
                }
            }
        })
    },
    /**
     * 获得焦点
     */
    onFocus() {
        this.setData({
            inputShowed: true
        });
    },
    /**
     * 失去焦点
     */
    onBlur() {
        this.setData({
            // inputVal:'',
            inputShowed: false
        });
    },
    /**
     * 输入完成进行搜索
     */
    confirmSearch(e) {
        let val = e.detail.value   //输入框的值
        if (val !== this.data.confirmInputVal) {
            this.setData({
                inputVal: val,
                positionList: [],
                pageNum: 1,
                confirmInputVal: val

            })
            // this.getPositionList();
        }

    },
    switchTab: function (e) {
        let index = e.currentTarget.dataset.tab;
        this.setData({
            tabIndex: index
        })
    },
    downOrUp: function (e) {
        this.setData({
            isOpen: !this.data.isOpen
        })
    },
    linkTo: function (e) {
        let url = e.currentTarget.dataset.url;
        switch (url) {
            case '1':
                wx.switchTab({
                    url: '../../micro/index/index',
                })
                break;
            case '2':
                wx.switchTab({
                    url: '../../micro/index/index',
                })
                break;
            case '3':
                let item = e.currentTarget.dataset.item;
                let companyInfoId = getApp().globalData.shareCompanyInfoId || (getApp().globalData.hrUser && getApp().globalData.hrUser.companyinfoId);
                wx.navigateTo({
                    url: `../../position/detail/detail?positionId=${item.id}&cId=${companyInfoId}`,
                })
                break;
            case '4':
                let companyInfo = this.data.companyInfo;
                wx.navigateTo({
                    url: `../map/map?latitude=${companyInfo.latitude}&longitude=${companyInfo.longitude}`,
                })
                break;
            case '5':
              wx.reLaunch({
                url: '../../micro/index/index',
              })
              break;
        }

    },
    /**
     * 跳转到详情页
     */
    goDetail(e) {
        let companyInfoId = getApp().globalData.shareCompanyInfoId || (getApp().globalData.hrUser && getApp().globalData.hrUser.companyinfoId);
        let dataset = e.currentTarget.dataset;
        wx.navigateTo({
            url: `../../position/detail/detail?positionId=${dataset.positionid}&cId=${companyInfoId}`,
        })
    },
    /**
     * 新访客进入给分享者发送模板消息
     */
    sendTemplateMsg() {
        var companyinfoId = 0;
        if (getApp().globalData.hrUser && getApp().globalData.hrUser.companyinfoId){
          companyinfoId = getApp().globalData.hrUser.companyinfoId;
        }
        if (this.data.options.from == 'share' || this.data.options.scene) {
            //来自分享打开，才发
          network.post('/ajtSpTemplateMsg/newVisitor.do', { 
                companyinfoId: companyinfoId,   
                visitFansId: getApp().globalData.cardFansId,
                fansId: this.data.otherFansId,     
                nameCardId: getApp().globalData.nameCardId
            }, (res) => {
                if (res.code == '0') {
                    console.log('模板消息发送成功')
                } else {
                  console.log(`ajtSpTemplateMsg/newVisitor.do:${res.message}`)
                }
            })
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
    showTips(){
      utils.showTips();
      return;
    },
    /**
    * 保存用户信息
    */
    getUserInfo: function (e) {
        let dataset = e.currentTarget.dataset;
        let companyInfoId = getApp().globalData.shareCompanyInfoId || (getApp().globalData.hrUser && getApp().globalData.hrUser.companyinfoId);
        if (!getApp().globalData.userInfo) {
            if (e.detail.errMsg == "getUserInfo:ok") {
              let _userInfo = Object.assign({}, e.detail.userInfo, { id: getApp().globalData.cardFansId })
                console.log(_userInfo)
                network.post('/account/saveQuickSpFans.do', {
                    userInfo: JSON.stringify(_userInfo)

                }, (res) => {
                    getApp().globalData.userInfo = e.detail.userInfo
                    wx.setStorageSync('userInfo', e.detail.userInfo)
                    wx.navigateTo({
                        url: `../../position/detail/detail?positionId=${dataset.positionid}&cId=${companyInfoId}`,
                    })
                })
            } else {
                //拒绝授权errMsg:"getUserInfo:fail auth deny"也能跳到详情页，只是不显示该用户的头像
                wx.navigateTo({
                    url: `../../position/detail/detail?positionId=${dataset.positionid}&cId=${companyInfoId}`,
                })
            }
        } else {
            wx.navigateTo({
                url: `../../position/detail/detail?positionId=${dataset.positionid}&cId=${companyInfoId}`,
            })
        }
    },
})