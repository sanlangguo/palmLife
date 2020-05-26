
const date = new Date()
const years = []
const months = []
const days = []

for (let i = 1990; i <= date.getFullYear(); i++) {
  years.push(i)
}

for (let i = 1; i <= 12; i++) {
  months.push(i)
}

for (let i = 1; i <= 31; i++) {
  days.push(i)
}

import { formatTime } from "../../../tool.js"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    total: 0, // 总计收入
    data: [],
    active: 0,
    show: false,
    years,
    year: date.getFullYear(),
    months,
    month: 5,
    days,
    day: 26,
    value: [9999, 1, 1],
    isDaytime: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.confirm();
  },

  onChange(event) {
    this.setData({
      active: event.detail.name,
      show: false,
      date: '',
      data: [],
    })
  },

  /**
   * 选择月份
   */
  onDisplay() {
    this.setData({ show: true });
  },

  /**
   * 确认日期
   */
  onConfirm(event) {
    this.setData({
      show: false,
    });
  },

  onClose() {
    this.setData({ show: false });
  },


  /**
   * 日期选择
   */
  bindChange(e) {
    const val = e.detail.value
    const {active} = this.data;
    const year = `${this.data.years[val[0]]}`;
    const month = `${this.data.months[val[1]]}`;
    const day = `${this.data.days[val[2]]}`;
    let time = '';
    switch (active) {
      case 0:
        time = `${year}/${month}/${day}`;
        break;
      case 1:
        time = `${year}/${month}`;
        break;
      case 2:
        time = `${year}`;
        break;
    }
    this.setData({
      year: this.data.years[val[0]],
      month: this.data.months[val[1]],
      day: this.data.days[val[2]],
      date: time,
    })
  },

  /**
   * 确认查询
   */
  async confirm() {
    const { active } = this.data;
    let startTime = 0;
    let endTime = 0;
    let total = 0;
    let now = new Date();
    if (!this.data.date) {
      switch (active) {
        case 0:
          startTime = now.setHours('00','00','00','00');
          endTime = (startTime + 1000*60*60*24)-1;
          break;
        case 1:
          startTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
          endTime = new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime()-1;
          break;
        case 2:
          startTime = new Date(now.getFullYear(), 0, 1).getTime();
          endTime= new Date(now.getFullYear(), 11, 31).getTime()-1;
          break;
      }
    } else {
      switch (active) {
        case 0:
          startTime = new Date(this.data.date).getTime();
          endTime = (startTime + 1000*60*60*24)-1;
          break;
        case 1:
          const timeArr = this.data.date.split('/');
          startTime = new Date(timeArr[0], timeArr[1]-1, 1).getTime();
          endTime = new Date(timeArr[0], timeArr[1], 0).getTime()-1;
          break;
        case 2:
          startTime = new Date(this.data.date, 0, 1).getTime();
          endTime= new Date(this.data.date, 11, 31).getTime()-1;
          break;
      }
    }
    const res = (await wx.cloud.callFunction({
      name: 'orderProcessing',
      data: {
        type: 'time',
        startTime,
        endTime
      },
    })).result.data;
    
    if (res.length) {
      res.map(item => {
        item.createTime = formatTime(item.createTime);
        total += parseFloat(item.totalPrice);
      })
    }
    this.setData({
      data: res,
      total
    })
  },

  onClose() {
    this.setData({ close: false });
  },
})