import API from '../../api/index';
Component({
  properties: {
    active: {
      type: Number,
      value: 0
    }
  },
  lifetimes: {
    async attached () {
      console.log(this.data.active, 'this.data.active')
      if (this.data.active == 0) {
        this.getAllOrderList();
      } else {
        this.setData({
          order: [],
        }, () => {
          this.filterOrderActive(this.data.active)
        })
      }
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
    async getAllOrderList() {
      wx.showLoading({
        title: '加载中',
      })
      const count = await API.getOrderCount();
      const batchTimes = Math.ceil(count.total / 4);
      if (this.data.page === batchTimes ) {
        wx.hideLoading();
        return false;
      }
      const res = await API.getAllOrderList(this.data.page * 4);
      this.fileIdFormat(res, batchTimes);
    },

    /**
     * 翻页
     */
    turnPage() {
      if (this.data.page < this.data.batchTimes) {
        if (this.data.active == 0) {
          this.getAllOrderList();
        } else {
          this.filterOrderActive(this.data.active);
        }
      }
    },

    /**
     * 再次购买
     */
    buyAgainOrder(e) {
      const { id } = e.currentTarget.dataset;
      console.log(id, '---')
    },

    /**
     * 删除订单
     */
    async deletOrder(e) {
      const { id } = e.currentTarget.dataset;
      if (id) {
        await API.deletOrder(id);
        wx.showLoading({
          title: '删除成功',
          icon: 'none'
        })
        if (this.data.active == 0) {
          this.getAllOrderList();
        } else {
          this.filterOrderActive(this.data.active);
        }
      }
    },

    /**
     * 查看订单详情
     */
    viewOrderDetails(e) {

    },

    /**
     * 筛选 active 订单
     * @param { 1 待发货， 2 已收货订单}
     */
    async filterOrderActive(active) {
      wx.showLoading({
        title: '加载中',
      })
      const count = await API.getOrderActiveCount(active);
      const batchTimes = Math.ceil(count.total / 4);
      if (this.data.page === batchTimes ) {
        wx.hideLoading();
        return false;
      }
      const res = await API.filterOrder(active, this.data.page * 4);
      this.fileIdFormat(res, batchTimes);
    },

    /**
     * 图片地址渲染
     */
    async fileIdFormat(res, batchTimes) {
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
      res.data.map(item => {
        resouceData.push(item)
      })
        this.setData({
          batchTimes,
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
    }

  }
})