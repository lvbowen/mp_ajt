//app.js


App({
    onLaunch: function () { },
    globalData: {
        companyAddress: '',
        phoneNumber: '',
        longlat: null,         //公司地址经纬度
        shareCompanyInfoId: '',    //来自分享的公司信息主键id
        hrUser: null,      //hr 标识信息
        userInfo: null,
        shareFansId: '',   //上一级分享者的粉丝id
        shareCardId: '',    //分享的名片的id(不一定是上一级)
        cardFansId: null,
        defaultAvatar: 'https://aijuhr.com/images/xcx/default-logo.png'
    }
})