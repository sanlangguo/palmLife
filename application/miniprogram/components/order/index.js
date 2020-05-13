import API from '../../api/index';
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import {
  orderNumber
} from '../../tool.js';
Component({
  properties: {
    active: {
      type: Number,
      value: 0
    }
  },
  lifetimes: {
    async attached() {
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
        mask: true
      })
      const count = await API.getOrderCount();
      console.log(count, '0count')
      const batchTimes = Math.ceil(count.total / 4);
      if (this.data.page === batchTimes || count.total == 0) {
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
    async buyAgainOrder(e) {
      const {
        id
      } = e.currentTarget.dataset;
      const {
        order
      } = this.data;
      let data = {};
      order.map(item => {
        if (item._id == id) {
          data.orderNumber = orderNumber()
          data.active = 1;
          data.goods = item.goods;
          data.totalPrice = item.totalPrice;
          data.name = item.name;
          data.phone = item.phone;
          data.receiveCity = item.receiveCity;
          data.receiveDetailedAddress = item.receiveDetailedAddress;
          data.createTime = new Date().getTime();
        }
      });
      const res = await API.orderTotal(data);
      wx.navigateTo({
        url: '/pages/order-detail/index?id=' + res._id,
      })
    },

    /**
     * 删除订单
     * @param { 0不删除 1 删除}
     */
    async deletOrder(e) {
      Dialog.confirm({
        title: '取消订单',
        message: '你确定取消订单吗'
      }).then(async() => {
        const that = this;
        const {
          id
        } = e.currentTarget.dataset;
        if (id) {
          await API.updateOrder(id, {
            delete: 1
          });
          wx.showToast({
            title: '删除成功',
            icon: 'none',
            mask: true,
            duration: 2000,
            success() {
              that.setData({
                page: 0,
                order: [],
              }, () => {
                if (that.data.active == 0) {
                  that.getAllOrderList();
                } else {
                  that.filterOrderActive(that.data.active);
                }
              })
            }
          })
        }
      }).catch(() => {});
    },

    /**
     * 查看订单详情
     */
    viewOrderDetails(e) {
      const {
        id,
        groupid
      } = e.currentTarget.dataset;
      if (groupid) {
        wx.navigateTo({
          url: '/pages/group-details/index?id=' + groupid,
        })
      } else {
        wx.navigateTo({
          url: '/pages/order-detail/index?id=' + id,
        })
      }
    },

    /**
     * 筛选 active 订单
     * @param { 1 待下单 2 待成团 3 待发货 4 已收货订单}
     */
    async filterOrderActive(active) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      const count = await API.getOrderActiveCount(active);
      const batchTimes = Math.ceil(count.total / 4);
      if (this.data.page === batchTimes || count.total == 0) {
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
          switch (item.active) {
            case 1:
              item.status = '待下单';
              break;
            case 2:
              item.status = '待成团';
              break;
            case 3:
              item.status = '待发货';
              break;
            case 4:
              item.status = '已收货';
              break;
            case 5:
              item.status = '拼团失败';
              break;
            default:
              break;
          }

          item.goods.map(async goods => {
            const data = [goods.fileId];
            const fileRes = await API.getTempFileURL(data);
            goods.coverImg = fileRes.fileList[0].tempFileURL;
            item.totalPrice = goods.count * goods.originPrice;
          })
        })
        res.data.map(item => {
          if (!item.delete) {
            resouceData.push(item)
          }
        })
        console.log(resouceData, 'resouceData')
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