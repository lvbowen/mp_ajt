let config = require('../../config.js')
import WeCropper from '../we-cropper/we-cropper.js'

const device = wx.getSystemInfoSync()
const width = device.windowWidth
const height = device.windowHeight-70

Page({
    data: {
        fromPage:'',    //页面来源
        cropperOpt: {
            id: 'cropper',
            width,
            height,
            scale: 2.5,
            zoom: 8,
            cut: {
                x: (width - 130) / 2,
                y: (height - 130) / 2,
                width: 130,
                height: 130
            }
        }
    },
    touchStart(e) {
        this.wecropper.touchStart(e)
    },
    touchMove(e) {
        this.wecropper.touchMove(e)
    },
    touchEnd(e) {
        this.wecropper.touchEnd(e)
    },
    getCropperImage() {
        let self = this;
        this.wecropper.getCropperImage((avatar) => {
            if (avatar) {
                //  获取到裁剪后的图片
                var tempFilePaths = avatar
                wx.showLoading({
                    title: '图片正在上传',
                })
                //上传
                wx.uploadFile({
                  url: config.host + '/weixin/uploadImg.do',
                    filePath: tempFilePaths,
                    name: 'imageFile',
                    header: {
                        "Content-Type": "multipart/form-data"
                    },
                    success: function (res2) {
                        let data = JSON.parse(JSON.parse(res2.data).data)
                        // console.log('uploadfile', data)
                        wx.hideLoading()
                        if (self.data.fromPage === 'micro'){
                          getApp().globalData.companyLogo = { src: data.url, id: data.id}
                        }else{
                          getApp().globalData.avatar = data.url
                        }
                        wx.navigateBack()
                    },
                    fail: function (err) {
                        // console.log(err)
                        wx.hideLoading();

                        if (err.errMsg.indexOf('请求超时') > -1) {
                            wx.showToast({
                                icon: 'none',
                                title: '上传超时，请重新上传图片',
                            })
                        } else {
                            wx.showToast({
                                icon: 'none',
                                title: err.errMsg,
                            })
                        }
                    }
                })

            } else {
                console.log('获取图片失败，请稍后重试')
            }
        })
    },
    uploadTap() {
        const self = this

        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success(res) {
                const src = res.tempFilePaths[0]
                //  获取裁剪图片资源后，给data添加src属性及其值

                self.wecropper.pushOrign(src)
            }
        })
    },
    onLoad(option) {
        const {
            cropperOpt
        } = this.data
        if (option.fromPage){
          console.log(option.fromPage + '--------')
          this.setData({
            fromPage: option.fromPage
          })
        }
        if (option.src) {
            cropperOpt.src = option.src
            new WeCropper(cropperOpt)
                .on('ready', (ctx) => {
                    console.log(`wecropper is ready for work!`)
                })
                .on('beforeImageLoad', (ctx) => {
                    console.log(`before picture loaded, i can do something`)
                    console.log(`current canvas context:`, ctx)
                    wx.showToast({
                        title: '上传中',
                        icon: 'loading',
                        duration: 20000
                    })
                })
                .on('imageLoad', (ctx) => {
                    console.log(`picture loaded`)
                    console.log(`current canvas context:`, ctx)
                    wx.hideToast()
                })
                .on('beforeDraw', (ctx, instance) => {
                    console.log(`before canvas draw,i can do something`)
                    console.log(`current canvas context:`, ctx)
                })
                .updateCanvas()
        }
    },
    goBack() {
      if (this.data.fromPage !== 'micro'){
        getApp().globalData.avatar = true
      }
    },
})