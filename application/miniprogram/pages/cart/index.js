import API from '../../api/index';
const userInfo = getApp().globalData.userInfo;
Page({
  data: {
    checkedGoods: ['1', '2', '3'],
    goods: [
      {
        id: '1',
        title: '进口香蕉',
        desc: '约250g，2根',
        price: 200,
        num: 1,
        thumb:
          'https://img.yzcdn.cn/public_files/2017/10/24/2f9a36046449dafb8608e99990b3c205.jpeg',
      },
      {
        id: '2',
        title: '陕西蜜梨',
        desc: '约600g',
        price: 690,
        num: 10,
        thumb:
          'https://img.yzcdn.cn/public_files/2017/10/24/f6aabd6ac5521195e01e8e89ee9fc63f.jpeg',
      },
      {
        id: '3',
        title: '美国伽力果',
        desc: '约680g/3个',
        price: 2680,
        num: 1,
        thumb:
          'https://img.yzcdn.cn/public_files/2017/10/24/320454216bbe9e25c7651e1fa51b31fd.jpeg',
      },
    ],
    totalPrice: 0,

  },
  async onLoad() {
    const card = await this.getUserCardList(userInfo.openid);
    console.log(card, 'card');
    if (card.data && card.data.length) {
      const data = JSON.parse(JSON.stringify(card.data[0]));
      delete data._openid;
      delete data.openid;
      delete data._id;
      const goods = data.goods;
      goods.map((item) => {
        
      });
    }
    this.getGoodsList();

    const { checkedGoods, goods } = this.data;
    const submitBarText = `结算`;
    const totalPrice = goods.reduce(
      (total, item) =>
        total + (checkedGoods.indexOf(item.id) !== -1 ? item.price : 0),
      0,
    );
    goods.forEach(item => {
      item.formatPrice = (item.price / 100).toFixed(2);
    });
    this.setData({
      totalPrice,
      submitBarText,
      goods,
    });
  },


  /**
   * 商品列表
   */
  async getGoodsList () {
    const data = await API.getGoodsList();
    console.log(data, 'data')
    return false
    const db = wx.cloud.database();
    if (this.data.page === this.data.batchTimes) {
      return false;
    }
    db.collection('goods-list').skip(this.data.page).limit(6).get({ 
      success: res => {
        const fileIds = [];
        if (res.data && res.data.length) {
          const goodList = res.data;
          goodList.map(item => {
            fileIds.push(item.fileId)
          })
          wx.cloud.getTempFileURL({
            fileList: fileIds,
            success: res => {
              res.fileList.map(item => {
                goodList.map(good => {
                  good.coverImg = item.tempFileURL;
                })
              })
              wx.hideLoading();
              this.setData({
                goodList: this.data.goodList.concat(goodList),
                page: this.data.page+1,
              })
            },
          })
        }
      }
    })
  },


  /**
   * 查询用户购物车
   */
  async getUserCardList(openid) {
    return await API.getCardList(openid);
  },


  onChange(event) {
    const { goods } = this.data;
    const checkedGoods = event.detail;
    const totalPrice = goods.reduce(
      (total, item) =>
        total + (checkedGoods.indexOf(item.id) !== -1 ? item.price : 0),
      0,
    );
    const submitBarText = checkedGoods.length ? `结算` : '结算';
    this.setData({
      checkedGoods,
      totalPrice,
      submitBarText,
    });
  },

  onSubmit() {
    wx.showToast({
      title: '点击结算',
      icon: 'none'
    });
  },

  /**
   * 减少
   */
  reduce() {
    console.log('2')
  },

  /**
   * 增加
   */
  increase() {
    console.log('1')
  },


  deleteGood(e) {
    console.log('2222', e)
  }
});