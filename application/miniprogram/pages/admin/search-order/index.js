import API from '../../../api/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order: [],
  },
  /**
   * 确认搜索
   */
  async onSearch(e) {
    if (e.detail) {
      const res = (await wx.cloud.callFunction({
        name: 'orderProcessing',
        data: {
          type: 'number',
          orderNumber: e.detail
        },
      })).result;
      this.fileIdFormat(res)
    }
  },
  /**
   * 图片地址渲染
   */
  async fileIdFormat(res) {
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
        order: res.data
      })
    } else {
      this.setData({
        order: [],
      })
    }
    wx.hideLoading();
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
})