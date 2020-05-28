import API from '../../../api/index';
import Dialog from '../../../miniprogram_npm/@vant/weapp/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sort: 0,
    goodList: [],
    page: 0,
    batchTimes: 0,
    cart: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const { sort } = this.data;
    if (options && options.sort) {
      this.setData({
        sort: options.sort
      })
    }
    this.pagination(options && options.sort ? options.sort : sort);
  },

  /**
   * 分页
   */
  async pagination(sort) {
    const countResult = await API.getGoodsCount(parseInt(sort));
    const batchTimes = Math.ceil(countResult.total / 6);
    this.setData({
      batchTimes,
    }, () => {
      this.getGoodsList()
    })
  },


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    const { page , batchTimes, sort} = this.data;
    if (page < batchTimes) {
      this.getGoodsList();
    } else {
      if (sort == 3) {
        wx.showToast({
          title: '没有更多',
          icon: 'none',
          mask: true
        })
      } else {
        this.setData({
          sort: sort+1,
          page: 0,
        }, () => {
          this.pagination(sort+1);
        })
      }
    }
  },

  /**
   * 删除商品
   */
  async delete(e) {
    const gid = e.currentTarget.dataset.id;
    const that = this;
    Dialog.confirm({
      title: '删除',
      message: '是否要删除该商品?'
    }).then(async () => {
      const res = (await wx.cloud.callFunction({
        name: 'editGoods',
        data: {
          type: 'delete',
          id: gid,
        },
      })).result;
      if (res.stats && res.stats.removed) {
        wx.showToast({
          title: '删除成功',
          mask: true,
        })
      } else {
        wx.showToast({
          title: '删除失败，请重试！',
          mask: true,
          icon: 'none'
        })
      }
      that.getGoodsList();
    }).catch(() => {});
  },

  /**
   * 商品列表
   */
  async getGoodsList() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    if (this.data.page !=0 && this.data.page === this.data.batchTimes) {
      wx.hideLoading();
      return false;
    }
    const res = await API.filterBySortGoodsList(parseInt(this.data.sort), this.data.page * 6);
    const fileIds = [];
    if (res.data && res.data.length) {
      const goodList = res.data;
      goodList.map((item, index) => {
        if (item.num <= 0) {
          goodList.splice(index ,1)
        }
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
          this.setData({
            goodList: this.data.goodList.concat(goodList),
            page: this.data.page + 1,
          })
        },
      })
    }
    wx.hideLoading();
  },

  /**
   * 商品分类切换
   * @param {0-惠选，1-卤菜, 2-生鲜, 3-居家}
   */
  switchSort(e) {
    const {
      detail
    } = e;
    this.setData({
      sort: detail,
      page: 0,
      goodList: []
    }, () => {
      this.pagination(detail)
    })
  },
})