import API from '../../api/index';
const userInfo = getApp().globalData.userInfo;
Page({
  data: {
    checkedGoods: [],
    goods: [],
    totalPrice: 0,
  },

  onShow() {
    this.getGoodsList();
  },

  /**
   * 购物车商品列表
   */
  async getGoodsList () {
    const card = await this.getUserCardList(userInfo.openid);
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
        this.setData({
          goods
        })
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
    console.log(event, 'event')
    const { goods, checkedGoods } = this.data;
    const { id } = event.currentTarget.dataset;
    if (checkedGoods.includes(id)) {
      checkedGoods.splice(checkedGoods.findIndex(item => item == id),1);
    } else {
      checkedGoods.push(id);
    }
    let totalPrice = goods.reduce(
      (total, item) =>
        total + (checkedGoods.includes(item.id) ? item.originPrice * item.count : 0),
      0,
    );
    this.setData({
      checkedGoods,
      totalPrice: totalPrice.toFixed(2)*100,
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