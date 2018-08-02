

let network = require("../../../utils/network.js")
let user = require("../../../utils/user.js")
let commonApi = require("../../../utils/commonApi.js")
let utils = require("../../../utils/util.js")

Page({

    /**
     * 页面的初始数据
     */
    data: {
        companyInfo: null,
        quickSpQrcode: '',
        showImgurl: '',
        showBubbleDesktop: false,
        showEditIcon: false,
        showImg: false,
        showShare: false,
        open: false,    //操作菜单  
        operationArr: [
            { src: '/images/bianj.png', text: '编辑', 'type': 'edit' },
            { src: '/images/operation_delete.png', text: '删除', 'type': 'deleted' },
            { src: '/images/operation_preview.png', text: '预览', 'type': 'preview' },
            { src: '/images/operation_share.png', text: '分享', 'type': 'share' }
        ],
        showPositionTip: false,
        clickPositionClose: false,
        isOnload:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.loginDialog = this.selectComponent("#loginDialog");
        let globalData = getApp().globalData;
        if (globalData.cardFansId) {
            //已登录
          if (globalData.hrUser){
            this.getCompanyBasicInfo();
            this.getQuickSpQrcodeNew();
          }
        } else {
            //未登录
          user.cardLogin((data) => {
                if (data.isSystemUser == 1) {
                    this.getCompanyBasicInfo();
                    this.getQuickSpQrcodeNew();
                }

            })
        }
        this.setData({
          isOnload:true
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
      if (getApp().globalData.hrUser && getApp().globalData.hrUser.loginPhone && !this.data.isOnload) {
            if (this.loginDialog.data.isShow) {
                this.loginDialog.hideDialog();
            }
            this.getCompanyBasicInfo();
            this.getQuickSpQrcodeNew();
            wx.showTabBar();
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        this.setData({
          isOnload: false
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

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (res) {
        let cId = (getApp().globalData.hrUser && getApp().globalData.hrUser.companyinfoId) ? getApp().globalData.hrUser.companyinfoId : '';
        let cardId = getApp().globalData.nameCardId;   
        let fansId = getApp().globalData.cardFansId;   
        if (res.from === 'button') {
            return {
              title: this.data.companyInfo.companyName + '正在使用爱聚通小程序拓展商机',
              path: `/pages/home/newHome/newHome?cId=${cId}&cardId=${cardId}&fansId=${fansId}&from=share`
            }
        }

    },
    /**
   * 获取公司信息
   */
    getCompanyBasicInfo(cb) {
        network.post('/api.do', {
            method: 'quickSp/getCompanyBasicInfoNew',
            param: JSON.stringify({
                reqType: 1,
                sessionId: wx.getStorageSync('sessionId'),
                companyinfoId: getApp().globalData.hrUser.companyinfoId, 
            })
        }, (res) => {
            if (res.code == 0 && res.data) {
                this.setData({
                    companyInfo: res.data
                })
                if (res.data && res.data.companyName) {
                    this.setData({
                        showEditIcon: true
                    })
                    this.getFirstCanvas();
                }
            }
            if (res.code == 0 && !res.data && cb) {
                //新用户，还未公司信息
                cb()
            }
        })
    },
    /**
  * 获取小程序码
  */
    getQuickSpQrcodeNew() {
        network.post('/api.do', {
          method: 'quickSp/getWebQrCodeForAjt',
            param: JSON.stringify({
                companyinfoId: getApp().globalData.hrUser.companyinfoId,
                fansId: getApp().globalData.cardFansId,
                cardId: getApp().globalData.nameCardId
            })
        }, (res) => {
            if (res.code == 0) {
                this.setData({
                  quickSpQrcode: res.data.qrCodeForAjt,               
                })
            }
        })
    },
    /**
     * 删除公司信息
     */
    delCompanyInfo() {
        network.post('/api.do', {
            method: 'quickSp/delCompanyInfo',
            param: JSON.stringify({
                companyinfoId: getApp().globalData.hrUser.companyinfoId
            })
        }, (res) => {
            if (res.code == 0) {
                this.setData({
                    companyInfo: null,
                    open: false,
                    showEditIcon: false
                })
                getApp().globalData.companyAddress = '';
                getApp().globalData.longlat = null;
                wx.showTabBar();
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
        let companyInfo = this.data.companyInfo;
        let companyName = companyInfo.companyName;
        let str1 = '', str2 = '';
        if (companyName.length > 12) {
            str1 = companyName.substr(0, 12);
            str2 = companyName.substr(12);
        } else {
            str1 = companyName;
        }
        var _this = this;
        var context = wx.createCanvasContext('firstCanvas');
        wx.downloadFile({
            url: 'https://aijuhr.com/images/xcx/gene_canvas_bg.png',
            success: function (res) {
                context.drawImage(res.tempFilePath, 0, 0, 560, 320);
                wx.downloadFile({
                    url: _this.data.quickSpQrcode,
                    success: function (res2) {
                        context.setFontSize(40);
                        context.setFillStyle("#ffffff");
                        context.fillText(str1, 32, 72);
                        if (str2) {
                            context.setFontSize(40);
                            context.setFillStyle("#ffffff");
                            context.fillText(str2, 32, 132);
                        }
                        context.setFillStyle('white');
                        context.fillRect(0, 320, 560, 270);
                        context.drawImage(res2.tempFilePath, 32, 380, 160, 160)
                        context.setFontSize(40);
                        context.setFillStyle("#ffffff");
                        context.fillText('正在招聘', 32, 256);
                        context.setFontSize(34);
                        context.setFillStyle("#333333");
                        context.fillText('长按查看招聘详情', 214, 446);
                        context.setFontSize(26);
                        context.setFillStyle("#B2B2B2");
                        context.fillText('微聘小程序提供', 214, 492);
                        context.draw(true)
                    }
                })
            },
        })
    },
    /**
     * canvas转成图片
     */
    previewQrcode: function () {
        if (!getApp().globalData.isVip) {
          utils.showTips();
          return;
        }
        var self = this;
        wx.canvasToTempFilePath({
            canvasId: 'firstCanvas',
            fileType: 'jpg',
            quality: '1',
            success: function (res) {
                console.log(res.tempFilePath)
                wx.hideTabBar();
                self.setData({
                    showImgurl: res.tempFilePath,   //生成的图片大小就是<canvas>标签设置的大小（宽高）
                    showImg: true
                })
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
    /**
     * 跳转到企业详情
     */
    linkTo: function (e) {
        let url = e.currentTarget.dataset.url;
        switch (url) {
            case '1':
                commonApi.saveFormId({
                    formId: e.detail.formId
                })
                if (getApp().globalData.hrUser) {
                    wx.navigateTo({
                        url: '../editBaseInfo/editBaseInfo',
                    })
                } else {
                    this.loginDialog.showDialog()
                }
                break;
            case '2':
                commonApi.saveFormId({
                    formId: e.detail.formId
                })
                getApp().globalData.shareCompanyInfoId = '';
                wx.navigateTo({
                  url: '../../home/newHome/newHome',
                })
                break;
            case '3':
                wx.navigateTo({
                    url: '../positionInfo/positionInfo',
                })

                break;
            default:

                break;
        }

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
        if (getApp().globalData.hrUser && getApp().globalData.hrUser.loginPhone) {
            if (this.data.companyInfo && this.data.companyInfo.companyName) {
                wx.hideTabBar()
                this.setData({
                    open: true
                })
            } else {
                wx.navigateTo({
                    url: '../editBaseInfo/editBaseInfo',
                })
            }
        } else {
            this.loginDialog.showDialog()
        }
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
                wx.navigateTo({
                    url: '../editBaseInfo/editBaseInfo',
                })
                break;
            case 'deleted':
                wx.showModal({
                    title: '提示',
                    content: '你确定删除公司信息吗？',
                    confirmText: '确定',
                    success: (res) => {
                        if (res.confirm) {
                            this.delCompanyInfo();
                        } else if (res.cancel) {
                            console.log('用户点击取消')
                        }
                    }
                })

                break;
            case 'preview':
                this.setData({
                    open: false,
                })
                getApp().globalData.shareCompanyInfoId = '';
                wx.navigateTo({
                    url: '../../home/newHome/newHome',
                })

                break;
            case 'share':
                if (!getApp().globalData.isVip) {
                  utils.showTips();
                  return;
                }
                this.setData({
                    open: false,
                    showShare: true
                })
                break;
            default:
                break;
        }
    },
    /**
     *  切换分享操作菜单
     */
    toggleShareSheet(e) {
      if (!getApp().globalData.isVip){
        utils.showTips();
        return;
      }
        this.setData({
            showShare: !this.data.showShare
        })
        if (this.data.showShare) {
            wx.hideTabBar()
        } else if (!this.data.showShare && !e.target.dataset.target) {
            wx.showTabBar();
        }
        commonApi.saveFormId({
            formId: e.detail.formId
        })
    },
    /**
     * 授权手机号成功后刷新页面
     */
    authPhoneNumberSuccess(e) {
        this.getCompanyBasicInfo();
        this.getQuickSpQrcodeNew();
        // this.getPositionList();
        wx.showTabBar();
    },
    /**
  *  获取职位列表
  */
    getPositionList: function () {
        network.post('/api.do', {
            method: 'quickSp/getPositionList',
            param: JSON.stringify({
                companyinfoId: getApp().globalData.hrUser.companyinfoId,
                pageNum: 1,
                pageSize: 1
            })
        }, (res) => {
            if (res.code == "0" && res.data.positionList && res.data.positionList.length > 0) {
                this.setData({
                    showPositionTip: false,
                })
            } else {
                this.setData({
                    showPositionTip: true,
                })
            }
        })
    },
    closePositionTip() {
        this.setData({
            showPositionTip: false,
            clickPositionClose: true
        })
    }
})