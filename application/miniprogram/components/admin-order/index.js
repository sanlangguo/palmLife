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

      const count = (await wx.cloud.callFunction({
        name: 'orderProcessing',
        data: {
          type: 'count',
        },
      })).result;
      const batchTimes = Math.ceil(count.total / 8);
      if (this.data.page === batchTimes || count.total == 0) {
        wx.hideLoading();
        return false;
      }
      const res = (await wx.cloud.callFunction({
        name: 'orderProcessing',
        data: {
          type: 'get',
          page: this.data.page * 8
        },
      })).result;
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
     * 确认收货
     */
    async confirmReceipt(e) {
      Dialog.confirm({
        title: '确认送货',
        message: '确认送货上门?'
      }).then(async() => {
        const that = this;
        const {
          id
        } = e.currentTarget.dataset;
        if (id) {
          await wx.cloud.callFunction({
            name: 'orderProcessing',
            data: {
              type: 'update',
              id,
              data: {
                active: 4,
              }
            },
          }).catch((error) => {
            console.log(error, 'error')
          });
          wx.showToast({
            title: '送货成功',
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
          url: '/pages/admin/user-order/index?id=' + id,
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
      const count = (await wx.cloud.callFunction({
        name: 'orderProcessing',
        data: {
          type: 'filterCount',
          active
        },
      })).result;

      const batchTimes = Math.ceil(count.total / 8);
      if (this.data.page === batchTimes || count.total == 0) {
        wx.hideLoading();
        return false;
      }
      const res = (await wx.cloud.callFunction({
        name: 'orderProcessing',
        data: {
          type: 'filter',
          page: this.data.page * 8,
          active,
        },
      })).result;

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