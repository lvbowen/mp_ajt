// pages/mine/cash/cash.js
let commonApi = require("../../../utils/commonApi.js")
let network = require("../../../utils/network.js")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        payMethod: 'wechat',   //wechat:微信支付，alipay：支付宝
        cashMoney: 0,      //提现金额
        balance: '0.00',    //余额  
        alipayNum: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      if (options.balance !== "0" && options.balance !== "undefined"){
        this.setData({
          balance: options.balance
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
     * 获取提现金额
     */
    blurAmount(e) {
        let val = e.detail.value.trim();
        this.setData({
            cashMoney: Number(val)
        })
        console.log(this.data.cashMoney)
    },
    /**
     * 获取支付宝账号
     */
    blurAlipay(e) {
        let val = e.detail.value.trim();
        this.setData({
            alipayNum: val
        })
    },
    /**
     * 跳转
     */
    linkTo(e) {
        let { url } = e.target.dataset;
        switch (url) {
            case '1':
                wx.navigateTo({
                    url: '../cashRecord/cashRecord',
                })
                break;
            case '2':
                wx.navigateTo({
                    url: '../moneyRecord/moneyRecord',
                })
                break;
            default:
                break;
        }
    },
    /**
     * 选择支付方式
     */
    selectMethod(e) {
        let { method } = e.currentTarget.dataset;
        if (method === '1') {
            this.setData({
                payMethod: 'wechat'
            })
        } else {
            this.setData({
                payMethod: 'alipay'
            })
        }
    },
    /**
     * 检查数据合法性
     */
    checkForm() {
        if (this.data.cashMoney < 30) {
            wx.showModal({
                title: '温馨提示',
                content: '提现金额不能小于30元！',
                showCancel: false
            })
            return false;
        }
        if (this.data.cashMoney > this.data.balance) {
            wx.showModal({
                title: '温馨提示',
                content: '提现金额不能大于账户余额！',
                showCancel: false
            })
            return false;
        }
        if (this.data.payMethod === 'alipay' && !this.data.alipayNum){
          wx.showModal({
            title: '温馨提示',
            content: '请输入支付宝账号',
            showCancel: false
          })
          return false;
        }
        return true;
    },
    /**
     * 完成（提现）
     */
    submitCash() {
        if (!this.checkForm()) {
            return;
        }
        let param = {
            ajtFansId: getApp().globalData.cardFansId,
            applyMoney: this.data.cashMoney,
        }
        if (this.data.payMethod === 'wechat') {
            param.applyType = 1;
        } else {
            param.applyType = 2;
            param.alipayNum = this.data.alipayNum;
        }
        network.post('/api.do', {
            method: 'applyMoney/requestApplyMoney',
            param: JSON.stringify(param)
        }, (res) => {
            if (res.code == '0') {
                wx.showModal({
                    title: '提示',
                    content: '提现申请已成功提交！',
                    showCancel: false,
                    success: (res2) => {
                        if (res2.confirm) {
                            this.getMyTotalRewardMoney()
                        }
                    }
                })
            } else {
                wx.showToast({
                    title: res.message || '提现申请失败',
                    icon: 'none'
                })
            }
        })
    },
    /**
     * 刷新当前余额
     */
    getMyTotalRewardMoney(){
       network.post('/api.do',{
         method:'vipUser/getMyTotalRewardMoney',
          param:JSON.stringify({
            ajtFansId: getApp().globalData.cardFansId
          })
       },(res)=>{
          this.setData({
            cashMoney:0,
            balance: res.data.totalRewardMoney || '0.00'
          })
       })
    }
})