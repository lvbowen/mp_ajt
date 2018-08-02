const config = require("../config.js")
let util = require("./util.js")

let user = {
    _cb: null,
    _cb2: null,
    // 登录
    cardLogin: function (cb, cb2) {
        wx.showLoading();
        this._cb = cb;
        this._cb2 = cb2;
        let _this = this;
        let _globalData;
        if (getApp()) {
            _globalData = getApp().globalData;
        }
        let sessionId = wx.getStorageSync("cardSessionId");
        wx.login({
            success: response => {
                console.log('response.code', response.code)
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
                if (response.code) {
                    wx.request({
                        url: config.host + '/ajtLogin/ajtSpLogin.do',                        
                        method: "POST",
                        header: {
                            "lversion": `${config.lversion}`,
                            "content-type": "application/x-www-form-urlencoded"
                        },
                        data: {
                            code: response.code,
                            sessionId: sessionId
                        },
                        success: function(res) {
                            wx.hideLoading();
                            let _data = res.data
                            if (_data.code == "0") {
                                _globalData.cardFansId = _data.data.ajtSpFansId;
                                if (_data.data.isSystemUser == 1 && !_globalData.hrUser) {
                                  //第一次手机注册或登录后，下次直接登录（微官网）
                                  _globalData.hrUser = { companyinfoId: _data.data.companyinfoId, loginPhone: _data.data.loginPhone }
                                }
                                if (sessionId !== _data.data.sessionId) {     //不同则更新，后台设置5个小时过期
                                    wx.setStorageSync('cardSessionId', _data.data.sessionId);
                                }
                                if (!getApp().globalData.userInfo && !getApp().globalData.userCancel) {                               
                                    if (_data.data.nameCardId == 0) {
                                        _this._authUserInfo(_data.data.ajtSpFansId, cb, _data.data);
                                        return;
                                    }                               
                                    _this._authUserInfo(_data.data.ajtSpFansId);
                                }else{
                                  cb2 && cb2();
                                }
                                cb && cb(_data.data);
                            }
                        },
                        fail:function(err){
                           util.toast("服务器开小差了！")
                        }
                    })
                }
            },
            fail: err => {
                wx.hideLoading();
            }
        })
    },
    /**
     * 授权用户信息
     */
    _authUserInfo(fansId, cb, loginRes) {
        let _this = this;
        wx.getUserInfo({
            success: response => {
                // 允许授权，保存用户信息
                if (cb) {
                    _this._saveUserInfo(response.userInfo, fansId, cb, loginRes)
                    return;
                }
                _this._saveUserInfo(response.userInfo, fansId)
            },
            fail: (err) => {
                //拒绝授权
                wx.showModal({
                    title: '提示',
                    content: '您拒绝了授权,小程序部分功能将无法正常使用。如需正常，请按确定并在【设置】页面中授权用户信息',
                    success: function(res) {
                        if (res.confirm) {
                            wx.openSetting({
                                success: (res) => {
                                    if (res.authSetting['scope.userInfo']) {
                                        setTimeout(() => { //增加延时确保授权已生效                     
                                            wx.getUserInfo({
                                                success: (res2) => {
                                                    if (cb) {
                                                        _this._saveUserInfo(res2.userInfo, fansId, cb, loginRes)
                                                        return;
                                                    }
                                                    _this._saveUserInfo(res2.userInfo, fansId)
                                                    //保存用户信息
                                                }
                                            })
                                        }, 100)
                                    } else {
                                        if (_this._cb2) {
                                            _this._cb2()
                                        }
                                        console.log('未允许授权用户信息')
                                    }
                                },
                                fail: () => {
                                    if (_this._cb2) {
                                        _this._cb2()
                                    }
                                    if (cb) {
                                        cb(loginRes)
                                    }
                                }
                            })
                        } else if (res.cancel) {

                            getApp().globalData.userCancel = true;
                            if (_this._cb2) {
                                _this._cb2()
                            }
                            if (cb) {
                                cb(loginRes)
                            }
                        }
                    }
                });
            }
        })
    },
    /**
     * 保存用户信息
     */
    _saveUserInfo(userInfo, fansId, cb, loginRes) {
        let _this = this;
        let _userInfo = Object.assign({}, userInfo, {
            id: fansId
        })
        wx.request({
            url: config.host + '/ajtLogin/saveAjtSpFans.do',
            method: "POST",
            header: {
                "lversion": `${config.lversion}`,
                "content-type": "application/x-www-form-urlencoded"
            },
            data: {
                userInfo: JSON.stringify(_userInfo)
            },
            success: function(res) {
                if (res.data.code == '0') {
                    getApp().globalData.userInfo = userInfo
                    if (cb) {
                        cb(loginRes)
                    }
                }
                if (_this._cb2) {
                    _this._cb2()
                }
            },
        })
    }
}

module.exports = user