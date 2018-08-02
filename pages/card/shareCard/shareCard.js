/**
 *  分享名片页和人脉详情页用的同一个页面，通过fromPage区分来源
 */

let network = require("../../../utils/network.js")
let user = require("../../../utils/user.js")
let commonApi = require("../../../utils/commonApi.js")
let util = require("../../../utils/util.js")

Page({
    /**
     * 页面的初始数据
     */
    data: {
        wH:0,
        showBackBtn: false,
        linkPage: 0,
        isLick: false,
        shareFansId: '',
        shareCardId:'',
        companyInfoId:'',
        fromPage:'',
        showCard2: false,
        hasCard: false,
        showMyCardBtn:false,
        cardInfo: {
            "headImgUrl": getApp().globalData.defaultAvatar,
        },
        canShare:true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
      
        //系统判断
        try {
            var res = wx.getSystemInfoSync()
            console.log('getSystemInfoSync', res)
            getApp().globalData.isIOS = res.system.indexOf('iOS') > -1
            this.setData({
                isIOS: getApp().globalData.isIOS,
                wH: res.windowHeight + 15
            })
        } catch (e) {
            // Do something when catch error
        }
        wx.hideShareMenu();

        var shareFansId = '';
        var shareCardId = '';
        var gotoDetail = 0;
        if (options.scene) {
          //海报扫码进入
          var scene = decodeURIComponent(options.scene)
          var arr1 = scene.split("&");
          var obj = {};
          arr1.forEach(function (item) {
            obj[item.split('=')[0]] = item.split('=')[1]
          })
          shareFansId = obj.fansId
          shareCardId = obj.cardId
          gotoDetail = obj.gotoDetail || 0
        }      
        if (options.fansId) {
          //分享链接或模板消息进入
          shareFansId = options.fansId
          shareCardId = options.cardId
        }
        if (options.gotoDetail) {
          gotoDetail = options.gotoDetai
        }
        this.setData({
          shareFansId: shareFansId,
          shareCardId: shareCardId,
          gotoDetail: gotoDetail,
          isOnload: true,
        })
        
        if (options.fromPage !== 'inside') {     
          //来自外部，如分享、扫码、模板消息等
          this.setData({
            showMyCardBtn: true
          })
          getApp().globalData.shareFansId = shareFansId;
          getApp().globalData.shareCardId = shareCardId;
          getApp().globalData.appLaunch = true;
        }else{
          if (getApp().globalData.cardFansId == this.data.shareFansId && !getApp().globalData.isVip) {
            this.setData({
              canShare:false
            })
          }
          this.setData({
            fromPage: options.fromPage
          })
        }      
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
      let globalData = getApp().globalData;

      if (this.data.isOnload && !globalData.cardFansId) { 
        this.setData({
          isOnload: false
        })
        user.cardLogin((data) => {
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
                this.indexLinkEvent(data, res.data.nameCardId);
              } else {
                wx.showToast({
                  icon: 'none',
                  title: res.message,
                })
              }
            })
            return;
          }
          this.indexLinkEvent(data);
        })
      }
      if (globalData.cardFansId){
        this.getCardInfo();
        this.getCompanyInfoId();
        if (globalData.cardFansId != this.data.shareFansId) {
          this.addShareRecord();
        }  
        this.setAnimation()          
      }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {},

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {},

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {},
    /**
     * 
     */
    indexLinkEvent(data, cardId) {
      this.getCompanyInfoId();    //先登录再获取
      let globalData = getApp().globalData;
      var nameCardId = data.nameCardId;
      if (cardId) {
        nameCardId = cardId
      }
      globalData.nameCardId = nameCardId;
     
      this.getCardInfo();
      if (globalData.cardFansId != this.data.shareFansId) {
        this.addShareRecord();
      }   
      this.setAnimation()
    },
    /**
     * 点击返回按钮
     */
    onBackEvent(e) {
        wx.reLaunch({
          url: '../../card/index/index',
        })
    },
    // 点击按钮获取formid
    share: function(e) {
        commonApi.saveFormId({
            formId: e.detail.formId
        })
    },
    showTips(){
      util.showTips();
      return;
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function(res) {
        if (res.from === 'button') {
            return util.getShareCon(this.data.cardInfo.nickName, this.data.shareFansId, this.data.shareCardId)
        }
    },
    /**
     * 获取名片信息
     */
    getCardInfo(cb) {
        network.post('/api.do', {
            method: 'nameCard/getNameCardInfo',
            param: JSON.stringify({
                fansId: this.data.shareFansId,
                visitFansId: getApp().globalData.cardFansId,
                id: this.data.shareCardId
            })
        }, (res) => {
            if (res.code == 0 && res.data) {
                var nameCard = res.data.nameCard;
                var cardInfo = res.data.fansInfo || {};
                var hasCard = nameCard ? true : false
                if (nameCard) {
                    cardInfo = nameCard;
                }
                cardInfo.headImgUrl = cardInfo.headImgUrl || getApp().globalData.defaultAvatar;
                var canlike = res.data.canlike;
                var linkPage;
                if (getApp().globalData.cardFansId != this.data.shareFansId){
                  linkPage = res.data.infoPageVisit;
                }else{
                  linkPage = res.data.infoPage;
                }
                this.setData({
                    cardInfo: cardInfo,
                    isLick: (canlike == null ? 1 : canlike) == 0,
                    hasCard: hasCard,
                    linkPage: linkPage
                })
                if ((cardInfo.phone && cardInfo.phone != '') ||
                    (cardInfo.wechatNum && cardInfo.wechatNum != '') ||
                    (cardInfo.address && cardInfo.address != '') ||
                    (cardInfo.email && cardInfo.email != '')) {
                    this.setData({
                        showCard2: true
                    })
                }
            }
        })
    },
    /**
     * 点赞
     */
    lick() {
        if (this.data.isLick) {
            wx.showModal({
                title: '提示',
                content: '亲，每天只能点赞一次哦！',
                showCancel: false,
                success: function(res) {}
            })
            return false;
        }
        if (!this.data.hasCard) {
            wx.showModal({
                title: '提示',
                content: '亲，名片不存在或则已被删除！',
                showCancel: false,
                success: function(res) {}
            })
            return false;
        }
        network.post('/api.do', {
            method: 'nameCard/isLike',
            param: JSON.stringify({
                likeFansId: getApp().globalData.cardFansId,
                nameCardId: this.data.cardInfo.id
            })
        }, (res) => {
            if (res.code == 0) {
                this.setData({
                    isLick: true,
                    'cardInfo.beLikedCount': +(this.data.cardInfo.beLikedCount || 0) + 1
                })
                this.animationUp.scale(2).step();
                this.setData({
                    animationUp: this.animationUp.export()
                })
                var self = this;
                setTimeout(function() {
                    this.animationUp.scale(1).step();
                    this.setData({
                        animationUp: this.animationUp.export()
                    })
                }.bind(this), 300)
            }
        })
    },
    /**
     * 增加访客记录
     */
    addShareRecord() {
      if (this.data.fromPage !== 'inside'){
        //来自外部
        network.post('/api.do', {
            method: 'nameCard/addShareRecord',
            param: JSON.stringify({
                id: this.data.shareCardId,
                fansId: this.data.shareFansId,
                visitFansId: getApp().globalData.cardFansId
            })
        }, (res) => {
            if (res.code == 0) {
                console.log(res.message)
            }
        })
      }
    },
    /**
     * 跳转到我的名片
     */
    linkTo: function(e) {
        var linkPage = this.data.linkPage;
        if (linkPage == 0) {
            getApp().globalData.isEditCard = true
            wx.switchTab({
                url: '/pages/card/index/index'
            })
        } else {
            wx.redirectTo({
                url: '../myCard/myCard'
            })
        }

    },
    /**
     * 设置动画
     */
    setAnimation() {
        var animationUp = wx.createAnimation({
            timingFunction: 'ease-in-out'
        })
        this.animationUp = animationUp;
    },
    /**
     * 保存通讯录
     */
    saveContact(e){
      commonApi.saveFormId({
        formId: e.detail.formId
      })
      let { cardInfo } = this.data;
      wx.addPhoneContact({
        firstName: cardInfo.nickName || '未知',
        title: cardInfo.position,
        organization: cardInfo.companyName,
        mobilePhoneNumber: cardInfo.phone,
        weChatNumber: cardInfo.wechatNum,
        email: cardInfo.email,
        workAddressStreet: cardInfo.address,
        success:function(res){
          console.log(res.errMsg)
        },
        fail:function(res){
          //点击取消
          console.log(res.errMsg)
        }
      })
    },
    /**
     * 获取微官网id
     */
    getCompanyInfoId(){
      network.post('/api.do', {
        method: 'nameCard/getCompanyInfoId',
        param: JSON.stringify({
          fansId:this.data.shareFansId
        })
      }, (res) => {
        if (res.code == 0) {
           this.setData({
             companyInfoId:res.data
           })
        }
      })
    }

})