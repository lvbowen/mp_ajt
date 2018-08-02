// pages/generation/loginRegister/loginRegister.js
let utils = require("../../../utils/util.js")
let network = require("../../../utils/network.js")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loginMode: 'vcode',  //vcode:验证码登录，pwd:密码登录
        formMode: '注册',  //注册模式 或 登录模式
        phone: '',
        vcode: '',
        phone2: '',    //密码登录时的手机号
        password: '',
        verificationCode: '获取验证码',
        btnDisabled: true,
        showApiMessage: false,
        apiMessage: {
            message: '',
            code: 0,
        }

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options.loginType == 'other') {
            this.setData({
                loginMode: 'pwd',
                formMode: '登录'
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
     * 提示
     */
    toggleApiMessage: function (obj) {
        this.setData({
            showApiMessage: true,
            apiMessage: {
                code: obj.code,
                message: obj.message
            }
        })
        setTimeout(() => {
            this.setData({
                showApiMessage: false,
                apiMessage: {
                    code: 0,
                    message: ''
                }
            })
        }, 3000)
    },
    /**
    * 监听input事件
    */
    operateInput: function (e) {
        let prop = e.currentTarget.dataset.prop
        let value = e.detail.value.trim()
        this.setData({
            [prop]: value
        })
        if ((this.data.loginMode == 'pwd' && this.data.phone2 && this.data.password) || (this.data.phone && this.data.vcode)) {
            this.setData({
                btnDisabled: false
            })
        } else {
            this.setData({
                btnDisabled: true
            })
        }
    },
    /**
   * 发送验证码
   */
    sendCheckCode: function () {
        let _this = this
        if (this.data.verificationCode.indexOf('重') > -1) {
            return;
        } else if (!_this.data.phone.trim()) {
            this.toggleApiMessage({
                code: 403,
                message: '请先输入手机号码',
            })
            return false;
        } else if (!utils.PregRule.Tel.test(_this.data.phone)) {
            this.toggleApiMessage({
                code: 403,
                message: '请先输入正确的手机号码',
            })
            return false;
        }
        network.post("/api.do", {
            method: "quickSp/sendCheckCodeNew",
            param: JSON.stringify({
                loginPhone: _this.data.phone,
                smsType: _this.data.formMode == '注册' ? 1 : 2
            })
        }, function (res) {
            if (res.code == "0") {
                let t = 60;
                let timer = setInterval(() => {
                    if (t <= 0) {
                        _this.setData({
                            verificationCode: '获取验证码',
                            isCountdown: false
                        })
                        clearInterval(timer);
                        return false;
                    }
                    _this.setData({
                        verificationCode: t + 's后重获取',
                        isCountdown: true
                    })
                    t--;
                }, 1000);
                _this.toggleApiMessage({
                    code: 0,
                    message: res.data,
                })
            } else if (res.message) {
                _this.toggleApiMessage({
                    code: res.code,
                    message: res.message,
                })
            }
        })

    },
    /**
     * 切换注册/登录模式
     */
    switchFormMode: function () {
        if (this.data.formMode == '注册') {
            this.setData({
                formMode: '登录',
                loginMode: 'vcode'
            })
            wx.setNavigationBarTitle({
                title: '登录'
            })
        } else {
            this.setData({
                formMode: '注册',
                loginMode: 'vcode'
            })
            wx.setNavigationBarTitle({
                title: '注册'
            })
        }
        this.setData({
            phone: '',
            vcode: '',
            phone2: '',
            password: '',
            btnDisabled: true
        })
    },
    /**
     * 切换登录方式
     */
    switchLoginMode: function () {
        if (this.data.loginMode == 'vcode') {
            this.setData({
                loginMode: 'pwd'
            })
        } else {
            this.setData({
                loginMode: 'vcode'
            })
        }
        this.setData({
            phone: '',
            vcode: '',
            phone2: '',
            password: '',
            btnDisabled: true
        })
    },
    /**
     * 登录或注册
     */
    registerOrLogin: function () {
        let param = {}, _data = this.data;
        if (_data.formMode == '注册') {
            param = { loginType: 4, loginPhone: _data.phone, checkCode: _data.vcode }
        } else {
            if (_data.loginMode == 'vcode') {
                param = { loginType: 2, loginPhone: _data.phone, checkCode: _data.vcode }
            } else {
                param = { loginType: 3, loginPhone: _data.phone2, password: _data.password }
            }
        }
        param.sessionId = wx.getStorageSync('sessionId');
        network.post("/api.do", {
            method: "quickSp/registerOrLoginNew",
            param: JSON.stringify(param)
        }, (res) => {
            if (res.code == 0) {
                getApp().globalData.hrUser = res.data;
                wx.setStorageSync('hrUser', res.data)
                wx.navigateBack();
            } else {
                this.toggleApiMessage({
                    code: res.code,
                    message: res.message,
                })
            }
        })

    },
    linkTo: function () {
        wx.navigateTo({
            url: '../agreement/agreement',
        })
    }
})