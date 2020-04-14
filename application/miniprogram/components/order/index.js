import API from '../../api/index';
Component({
  properties: {
    active: {
      type: Number,
      value: 0
    }
  },
  lifetimes: {
    async created () {
      wx.showLoading({
        title: '加载中',
      })
      const count = await API.getOrderCount();
      const batchTimes = Math.ceil(count.total / 3);
      // console.log(batchTimes, 'batchTimes')
      this.setData({
        batchTimes,
      }, () => {
        this.getOrderList()
      })
    },
  },
  data: {
    batchTimes: 0,
    page: 0,
    order: []
  },
  methods: {
    /**
     * 获取订单列表
     */
    async getOrderList() {
      console.log(this.data.active, '----')
      if (this.data.page === this.data.batchTimes) {
        return false;
      }
      const res = await API.getOrderList(this.data.page);
      if (res.data && res.data.length) {
        const resouceData = [];
        res.data.map(async item => {
          item.goods.map(async goods => {
            const data = [goods.fileId];
            const fileRes = await API.getTempFileURL(data);
            goods.coverImg = fileRes.fileList[0].tempFileURL;
            item.totalPrice = goods.count * goods.originPrice;
          })
        })
        // 筛选订单状态
        res.data.map(item => {
          if (this.data.active == 0) {
            resouceData.push(item);
          } else if (this.data.active == 1 && item.active ===1) {
            resouceData.push(item);
          } else if (this.data.active == 2 && item.active ===2) {
            resouceData.push(item);
          }
        })
        this.setData({
          page: this.data.page + 1,
          order: this.data.order.concat(resouceData),
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
      console.log(this.data.page, 'pp')
      console.log(this.data.batchTimes, 'batchTimes')
      if (this.data.page < this.data.batchTimes) {
        wx.showLoading({
          title: '加载中',
        })
        this.getOrderList();
      }
    }
  }
})