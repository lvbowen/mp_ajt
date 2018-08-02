// pages/generation/editBaseInfo/editBaseInfo.js
let network = require("../../../utils/network.js")
let commonApi = require("../../../utils/commonApi.js")
let user = require("../../../utils/user.js")
let util = require("../../../utils/util.js")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isIOS: false,
        isVip: -1,
        cardInfo: {
            "headImgUrl": getApp().globalData.defaultAvatar,
        },
        addMargin: false,
        wH:0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //隐藏分享菜单
        wx.hideShareMenu();

        //系统判断
        try {
            var res = wx.getSystemInfoSync()
            getApp().globalData.isIOS = res.system.indexOf('iOS') > -1
            this.setData({
                isIOS: getApp().globalData.isIOS,
                wH: res.windowHeight
            })
        } catch (e) {
            // Do something when catch error
        }

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
            //分享链接进入
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
        let globalData = getApp().globalData;

        if (this.data.isOnload) { //点击分享名片、模板消息、重启动
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
        } else {
            //获取上传裁剪头像
            if (globalData.avatar) {
                if (globalData.avatar != true) {
                    this.setData({
                        ['cardInfo.headImgUrl']: globalData.avatar
                    })
                }
                globalData.avatar = null;
                return;
            }
            if (globalData.chooseLocation) {
                globalData.chooseLocation = false;
                return;
            }
            //刷新页面
            this.getCardInfo();
            this.isMember();
        }
    },
    indexLinkEvent(data, cardId) {

        let globalData = getApp().globalData;
        var nameCardId = data.nameCardId;
        if (cardId) {
            nameCardId = cardId
        }
        globalData.nameCardId = nameCardId;
        // if (this.data.shareFansId) { //外部分享进入         
        //     wx.navigateTo({
        //         url: '../shareCard/shareCard?shareFansId=' + this.data.shareFansId + '&shareCardId=' + this.data.shareCardId + '&linkPage=' + data.infoPage
        //     })
        //     return false
        // }
        //信息填写完全或者指定进入详情页
        if ((data.infoPage == 1 || this.data.gotoDetail == 1) && !getApp().globalData.appLaunch) {
            this.data.autoGo = true;
            wx.navigateTo({
                url: '../myCard/myCard'
            })
            return false;
        }

        this.getCardInfo();
        this.isMember();
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
       if (!this.data.autoGo){
        this.save();
      }
       this.data.autoGo = false;
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
    showTips() {
        wx.showModal({
            title: '提示',
            content: '成为会员才可分享哦！',
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
    isMember(obj) {
        network.post('/api.do', {
            method: 'nameCard/isMember',
            param: JSON.stringify({
                fansId: getApp().globalData.cardFansId
            })
        }, (res) => {
            if (res.code == 0) {
                if (res.data && res.data == 1) {
                    this.setData({
                        isVip: 1
                    })
                    getApp().globalData.isVip = 1;
                } else {
                    this.setData({
                        isVip: 0
                    })
                    getApp().globalData.isVip = 0;
                }
            }
        })
    },
    getPhoneNumber: function (e) {
        console.log(e.detail.errMsg)
        console.log(e.detail.iv)
        console.log(e.detail.encryptedData)
    },
    getUserInfo() {
        user.cardLogin((data) => {
            if (data.isSystemUser == 1) {
                this.getCardInfo();
            }
        })
    },

    /**
     * 获取公司信息
     */
    /**
     * 获取名片信息
     */
    getCardInfo() {
        network.post('/api.do', {
            method: 'nameCard/getNameCardInfo',
            param: JSON.stringify({
                fansId: getApp().globalData.cardFansId,
                id: getApp().globalData.nameCardId
            })
        }, (res) => {
            if (res.code == 0 && res.data) {
                var nameCard = res.data.nameCard;
                var ajtFansInfo = res.data.fansInfo;
                var cardInfo
                if (nameCard) {
                    cardInfo = nameCard
                } else {
                    ajtFansInfo.id = 0;
                    cardInfo = ajtFansInfo;
                }
                cardInfo.fansId = getApp().globalData.cardFansId
                cardInfo.headImgUrl = cardInfo.headImgUrl || getApp().globalData.defaultAvatar;
                var nick = cardInfo.nickName;
                cardInfo.nickName = (nick && nick.length > 8) ? nick.substring(0, 8) : nick
                this.setData({
                    cardInfo: cardInfo
                })
            }
            // wx.hideLoading()
        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (res) {
        if (res.from === 'button') {
            this.save();
            return util.getShareCon(this.data.cardInfo.nickName, this.data.cardInfo.fansId, getApp().globalData.nameCardId)
        }
    },


    /**
     * 添加logo
     */
    chooseLogoImage: function (e) {
        getApp().globalData.avatar = true;
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success(res) {
                const src = res.tempFilePaths[0]
                wx.navigateTo({
                    url: `../../upload/upload?src=${src}`
                })
            }
        })
    },
    chooseLocation() {
        wx.getSetting({
            success: (res) => {
                let auths = Object.keys(res.authSetting);
                if (auths.indexOf('scope.userLocation') > -1 && res.authSetting['scope.userLocation'] === false) {
                    wx.openSetting({
                        success: (res) => {
                            getApp().globalData.chooseLocation = true
                            if (res.authSetting['scope.userLocation']) {
                                setTimeout(() => { //增加延时确保授权已生效      
                                    wx.chooseLocation({
                                        success: (res) => {
                                            this.setData({
                                                ['cardInfo.address']: res.address
                                            })
                                        }
                                    })
                                }, 100)
                            }
                        }
                    })
                } else {
                    getApp().globalData.chooseLocation = true
                    wx.chooseLocation({
                        success: (res) => {
                            this.setData({
                                ['cardInfo.address']: res.address
                            })
                        }
                    })
                }
            }
        })

    },
    /**
     * 监听input事件
     */
    operateInput: function (e) {
        let prop = e.currentTarget.dataset.prop
        if (e.detail.cursor > 0) {
            let value = '';
            if (prop == 'cardInfo.nickName') {
                value = e.detail.value;
                if (value.length == 8) {
                    wx.showToast({
                        icon: 'none',
                        title: '最多只能输入8个字!',
                    })
                }
            }
            if (prop == 'cardInfo.address') {
                value = e.detail.value.replace(/^\s+/, '')
            } else {
                value = e.detail.value.trim()
            }
            this.setData({
                [prop]: value
            })
        } else {
            this.setData({
                [prop]: ''
            })
        }
    },
    checkData(e) {
        let prop = e.currentTarget.dataset.prop;
        let value = e.detail.value;
        if (prop == 'cardInfo.phone') {
            if (value && value != '' && !util.PregRule.Tel.test(value)) {
                wx.showToast({
                    icon: 'none',
                    title: '您的手机号填写错误！',
                })
                return false;
            }
        }
        if (prop == 'cardInfo.email') {
            if (value && value != '' && !util.PregRule.Email.test(value)) {
                wx.showToast({
                    icon: 'none',
                    title: '您的邮箱填写错误！',
                })
                return false;
            }
        }
    },
    /**
     * 检测数据
     */
    checkFormData: function () {
        let cardInfo = this.data.cardInfo;
        if (cardInfo.phone && cardInfo.phone != '' && !util.PregRule.Tel.test(cardInfo.phone)) {
            wx.showToast({
                icon: 'none',
                title: '您的手机号填写错误！',
            })
            return false;
        }
        if (cardInfo.email && cardInfo.email != '' && !util.PregRule.Email.test(cardInfo.email)) {
            wx.showToast({
                icon: 'none',
                title: '您的邮箱填写错误！',
            })
            return false;
        }
        return true;
    },
    // 点击分享按钮获取formid
    share: function (e) {
        commonApi.saveFormId({
            formId: e.detail.formId
        })
    },

    /**
     * 保存
     */
    save: function (e) {
        let isShare = true

        if (!this.checkFormData()) {
            return;
        }

        if (e) {
            isShare = false;
            commonApi.saveFormId({
                formId: e.detail.formId
            })
        }

        network.post('/api.do', {
            method: "nameCard/editorNameCard",
            param: JSON.stringify(this.data.cardInfo)
        }, (res) => {
            if (res.code == '0') {
                if (isShare) {
                    return false;
                }
                wx.navigateTo({
                    url: '../myCard/myCard'
                })
            } else {
                wx.showToast({
                    icon: 'none',
                    title: res.message,
                })
            }
        })
    },
    /**
     * 安卓手机键盘挡住文本域的问题处理
     */
    taFocus(e) {
        let systemInfo = wx.getSystemInfoSync();
        if (systemInfo.system.indexOf("Android") > -1) {
            this.setData({
                addMargin: true
            })
            setTimeout(() => {
                //延时是为了确保margin样式加上之后再滚动
                let top = systemInfo.windowHeight + 500;
                wx.pageScrollTo({
                    scrollTop: top,
                    duration: 30
                })
            }, 300)
        }
    },
    taBlur(e) {
        if (this.data.addMargin) {
            this.setData({
                addMargin: false
            })
        }
    }
})