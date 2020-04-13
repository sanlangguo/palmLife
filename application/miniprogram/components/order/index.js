import API from '../../api/index';
Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    innerText: {
      type: String,
      value: 'default value',
    }
  },
  lifetimes: {
    async created () {
      wx.showLoading({
        title: '加载中',
      })
      const count = await API.getOrderCount();
      const batchTimes = Math.ceil(count.total / 3);
      console.log(batchTimes, 'batchTimes')
      this.setData({
        batchTimes,
      }, () => {
        this.getOrderList()
      })
    },
  },
  data: {
    index: 0,
    batchTimes: 0,
    page: 0,
    order: []
  },
  methods: {
    /**
     * 获取订单列表
     */
    async getOrderList() {
      if (this.data.page === this.data.batchTimes) {
        return false;
      }
      const res = await API.getOrderList(this.data.page);
      if (res.data && res.data.length) {
        res.data.map(async item => {
          item.goods.map(async goods => {
            const data = [goods.fileId];
            const fileRes = await API.getTempFileURL(data);
            goods.coverImg = fileRes.fileList[0].tempFileURL;
            item.totalPrice = goods.count * goods.originPrice;
          })
        })
        this.setData({
          batchTimes: 0,
          page: this.data.page + 1,
          order: res.data,
        })
      } else {
        this.setData({
          batchTimes: 0,
          page: 0,
          order: [],
          active: 0,
        })
      }
      wx.hideLoading();
    },
    /**
     * 翻页
     */
    turnPage() {
      if (this.data.page < this.data.batchTimes) {
        wx.showLoading({
          title: '加载中',
        })
        this.getOrderList();
      }
    }
  }
})