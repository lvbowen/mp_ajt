// pages/mine/buy/buy.js

let commonApi = require("../../../utils/commonApi.js")
let network = require("../../../utils/network.js")
let utils = require("../../../utils/util.js")

Page({

    /**
     * 页面的初始数据
     */
    data: {
        packages: [
            { id: 1, pka: '1年', money: 1 },
            { id: 2, pka: '终身', money: 2680 },
        ],
        selectedPackageId: 1
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options.pid) {
            this.setData({
                selectedPackageId: options.pid * 1
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
     * 跳转
     */
    linkTo() {
        let fun = (item) => {
            return item.route === 'pages/mine/memberPrivileges/memberPrivileges'
        }
        let url = '../memberPrivileges/memberPrivileges';
        utils.navigateBack(fun, url);
    },
    /**
     * 选择套餐 
     */
    selectPackage(e) {
        let { pid } = e.currentTarget.dataset;
        this.setData({
            selectedPackageId: pid * 1
        })
    },
    /**
     * 确认支付
     */
    goPay(e) {
        commonApi.saveFormId({
            formId: e.detail.formId
        })
        let _this = this;
        network.post('/ajtPay/createOrder.do', {
            buyerFansId: getApp().globalData.cardFansId,
            versionType: 1,
            vipType: this.data.selectedPackageId,
            shareFansId: getApp().globalData.shareFansId,
            nameCardId: getApp().globalData.shareCardId
        }, (res) => {
            if (res.code == '0') {
                let _data = res.data;
                wx.requestPayment({
                    'timeStamp': _data.timeStamp,
                    'nonceStr': _data.nonceStr,
                    'package': _data.package,
                    'signType': _data.signType,
                    'paySign': _data.paySign,
                    'success': function (res) {
                        if (res.errMsg === 'requestPayment:ok') {
                            getApp().globalData.isVip = 1;
                            if (_this.data.selectedPackageId == 1) {
                                //普通会员：1年vip
                                wx.navigateTo({
                                    url: '../vipMember/vipMember',
                                })
                            }else if (_this.data.selectedPackageId == 2){
                              //创客
                              wx.navigateTo({
                                url: '../maker/maker',
                              })
                            }
                        }
                    },
                    "fail":function(res){
                      if (res.errMsg === 'requestPayment:fail cancel'){
                        wx.showToast({
                          icon: 'none',
                          title: '您取消了支付',
                        })
                      }else{
                        wx.showToast({
                          icon: 'none',
                          title:'支付失败，请重试！',
                        })
                      }
                    }
                })
            }else{
              wx.showToast({
                icon: 'none',
                title: res.message || '下单失败，请重试！',
              })
            }
        })
    }
})