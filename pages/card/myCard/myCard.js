let network = require("../../../utils/network.js")
let commonApi = require("../../../utils/commonApi.js")
let util = require("../../../utils/util.js")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        wH: 0,
        isIOS: false,
        isVip: -1,
        showCard2: false,
        cardInfo: {},
        showImgurl: '',
        showImg: false,
        showShare: false,
        open: false, //操作菜单  
        operationArr: [{
            src: '/images/bianj.png',
            text: '编辑',
            'type': 'edit'
        },
        {
            src: '/images/operation_delete.png',
            text: '删除',
            'type': 'deleted'
        },
        ],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //系统判断
        try {
            var res = wx.getSystemInfoSync()
            console.log('getSystemInfoSync', res)
            getApp().globalData.isIOS = res.system.indexOf('iOS') > -1
            this.setData({
                isIOS: getApp().globalData.isIOS,
                wH: res.windowHeight
            })
        } catch (e) {
            // Do something when catch error
        }

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () { },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        wx.hideShareMenu();
        this.getCardInfo();
        this.setData({
            isVip: -1
        })
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
    onShareAppMessage: function (res) {
        if (res.from === 'button') {
            return util.getShareCon(this.data.cardInfo.nickName, getApp().globalData.cardFansId, getApp().globalData.nameCardId)
        }
    },
    onBackEvent(e) {
      wx.reLaunch({
        url: '../../card/index/index',
      })
    },
    /**
     * 获取公司信息
     */
    getCardInfo(cb) {
        network.post('/api.do', {
            method: 'nameCard/getNameCardInfo',
            param: JSON.stringify({
                fansId: getApp().globalData.cardFansId,
                id: getApp().globalData.nameCardId
            })
        }, (res) => {
            if (res.code == 0 && res.data) {
                var nameCard = res.data.nameCard;
                var cardInfo = res.data.fansInfo;
                if (nameCard) {
                    cardInfo = nameCard;
                }
                cardInfo.headImgUrl = cardInfo.headImgUrl || getApp().globalData.defaultAvatar;
                this.setData({
                    cardInfo: cardInfo
                })
                if ((cardInfo.phone && cardInfo.phone != '') ||
                    (cardInfo.wechatNum && cardInfo.wechatNum != '') ||
                    (cardInfo.address && cardInfo.address != '') ||
                    (cardInfo.email && cardInfo.email != '')) {
                    this.setData({
                        showCard2: true
                    })
                }
                this.getFirstCanvas();
            }

        })
    },

    /**
     * 删除名片
     */
    delcardInfo() {
        network.post('/api.do', {
            method: 'nameCard/delNameCard',
            param: JSON.stringify({
                id: this.data.cardInfo.id,
                fansId: getApp().globalData.cardFansId,
                sessionId: wx.getStorageSync("cardSessionId")
            })
        }, (res) => {
            if (res.code == 0) {
                getApp().globalData.nameCardId = res.data.nameCardId
                getApp().globalData.isEditCard = true
                wx.switchTab({
                    url: '/pages/card/index/index'
                })
            } else {
                wx.showToast({
                    icon: 'none',
                    title: res.message,
                })
            }
        })
    },

    //获取firstCanvas并画图
    getFirstCanvas: function (res) {
        console.log("enter getFirstCanvas")
        let cardInfo = this.data.cardInfo;
        let companyName = cardInfo.companyName || '公司名称';
        var logo = cardInfo.headImgUrl;
        var nick = cardInfo.nickName || '';
        var ewm = cardInfo.qrcodeImgUrl;
        if (nick.length > 8) {
            nick = nick.substr(0, 8) + '...';
        }
        var bg = 'https://aijuhr.com/images/xcx/ajt_ewm-bg.png'
        let str1 = '',
            str2 = '',
            yMove = 0;
        if (companyName.length > 12) {
            str1 = companyName.substr(0, 12);
            str2 = companyName.substr(12);
        } else {
            yMove = 20;
            str1 = companyName;
        }
        var _this = this;
        var context = wx.createCanvasContext('firstCanvas');
        wx.downloadFile({
            url: bg, //仅为示例，并非真实的资源
            success: function (res) {
                if (res.statusCode === 200) {
                    console.log("enter downloadFile bg")
                    context.drawImage(res.tempFilePath, 0, 0, 560, 371);
                    context.setFontSize(40);
                    context.setFillStyle("#ffffff");
                    context.setTextAlign('center')
                    context.fillText(nick, 280, 230 + yMove);
                    context.setFontSize(32);
                    context.setFillStyle("#ffffff");
                    context.setTextAlign('center')
                    context.fillText(str1, 280, 287 + yMove);
                    if (str2) {
                        context.setFontSize(32);
                        context.setFillStyle("#ffffff");
                        context.setTextAlign('center')
                        context.fillText(str2, 280, 332);
                    }
                    context.save();
                    context.arc(280, 100 + yMove, 65, 0, 2 * Math.PI)
                    context.clip();
                    wx.downloadFile({
                        url: logo,
                        success: function (logoRes) {
                            if (logoRes.statusCode === 200) {
                                console.log("enter downloadFile logo")
                                context.drawImage(logoRes.tempFilePath, 215, 35 + yMove, 130, 130);
                                context.restore();
                                context.beginPath()
                                context.setFillStyle('white');
                                context.fillRect(0, 371, 560, 270);
                                if (ewm && ewm != '') {
                                    console.log("enter downloadFile ewm")
                                    wx.downloadFile({
                                        url: ewm,
                                        success: function (ewmRes) {
                                            if (logoRes.statusCode === 200) {
                                              
                                              context.drawImage(ewmRes.tempFilePath, 200, 400, 160, 160);
                                              context.draw(true);
                                                
                                            }
                                        }
                                    })
                                    return;
                                }
                                context.draw(true)
                            }
                        }
                    })

                }
            }
        })

    },

    /**
     * canvas转成图片
     */
    previewQrcode: function () {
        this.isMember({
            success: () => {
                var self = this;
                wx.canvasToTempFilePath({
                    canvasId: 'firstCanvas',
                    fileType: 'jpg',
                    quality: '1',
                    success: function (res) {
                        self.setData({
                            showImgurl: res.tempFilePath, //生成的图片大小就是<canvas>标签设置的大小（宽高）
                            showImg: true
                        })
                    }
                })
            },
            fail: () => {
                this.showTips();
            }
        })
    },

    //关闭图片预览
    closeShowimg() {
        this.setData({
            showImg: false
        })
        wx.showTabBar();
    },

    // 保存图片到本地
    saveImg(res) {
        var _this = this;
        wx.saveImageToPhotosAlbum({
            filePath: _this.data.showImgurl,
            success(res2) {
                wx.showModal({
                    content: '海报已保存到系统相册\n快去分享给朋友',
                    showCancel: false,
                    confirmText: '我知道了',
                    success: function (res2) {

                    }
                })
            },
            fail(res2) {
                wx.showModal({
                    title: '警告',
                    content: '您点击了拒绝授权,将无法正常保存图片到本地,点击确定重新获取授权。',
                    success: function (res2) {
                        if (res2.confirm) {
                            wx.openSetting({
                                success: function (res3) {
                                    if (res3.authSetting['scope.writePhotosAlbum']) {
                                        _this.previewQrcode();
                                    }
                                }
                            })
                        }
                    }
                })
            }
        })
    },
    /**
     * 点击编辑图标
     */
    clickEdit() {
        // wx.hideTabBar()
        this.setData({
            open: true
        })
    },

    /**
     * 监听operation组件内事件
     */
    onMyEvent(e) {
        let ty = e.detail.type;
        switch (ty) {
            case 'edit':
                this.setData({
                    open: false,
                })
                getApp().globalData.isEditCard = true
                wx.switchTab({
                    url: '/pages/card/index/index'
                })
                break;
            case 'deleted':
                wx.showModal({
                    title: '提示',
                    content: '你确定删除名片么？',
                    confirmText: '确定',
                    success: (res) => {
                        if (res.confirm) {
                            this.delcardInfo();
                        } else if (res.cancel) {
                            console.log('用户点击取消')
                        }
                    }
                })
                break;
            default:
                break;
        }
    },

    isMember(obj) {
        if (this.data.isVip == 0) {
            obj.fail && obj.fail()
            return;
        }
        if (this.data.isVip == 1) {
            obj.success && obj.success()
            return;
        }
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
                    obj.success && obj.success()
                } else {
                    this.setData({
                        isVip: 0
                    })
                    getApp().globalData.isVip = 0;
                    obj.fail && obj.fail()
                }
            }
        })
    },
    /**
     *  切换分享操作菜单
     */
    toggleShareSheet(e) {
        this.isMember({
            success: () => {
                this.setData({
                    showShare: !this.data.showShare
                })
                commonApi.saveFormId({
                    formId: e.detail.formId
                })
            },
            fail: () => {
                this.showTips();
            }
        })
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

})