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
   * 购物车商品列表
   */
  async getGoodsList () {
    const card = await this.getUserCardList(userInfo.openid);
    console.log(card, 'card');
    if (card.data && card.data.length) {
      const data = JSON.parse(JSON.stringify(card.data[0]));
      delete data._openid;
      delete data.openid;
      delete data._id;
      const goods = data.goods;
      const ids = [];
      goods.map((item) => {
        ids.push(item.id)
      });
      const goodList = await API.getGoodsList(ids);
      if (goodList.data && goodList.data.length) {
        const fileList = [];
        goodList.data.map(item => fileList.push(item.fileId));
        const fileUrl = await API.getTempFileURL(fileList);
        if (fileUrl.fileList && fileUrl.fileList.length) {
          goodList.data.map((item, index) => {
            goods[index].coverImg = fileUrl.fileList[index].tempFileURL;
            goods[index].name = item.name;
            goods[index].price = item.price;
            goods[index].originPrice = item.originPrice;
            goods[index].desc = item.desc;
            goods[index].unit = item.unit;
            goods[index].num = item.num;
          })
        }
        console.log(fileUrl, 'fileUrl')
        console.log(goods, 'goods----')
      }
    }
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