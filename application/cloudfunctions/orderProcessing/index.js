const cloud = require("wx-server-sdk");
cloud.init({
  env: 'dev-o45qm',
  traceUser: true,
})
const db = cloud.database();
const _ = db.command;
exports.main = async (event, context) => {
  switch (event.type) {
    // 更新订单状态 (删除，快递状态)
    case 'update': 
      return await db.collection("order").doc(event.id).update({
        data: {
          ...event.data
        }
      })
    // 获取所有用户订单列表
    case 'get': 
      if (event.id) {
        return await db.collection("order").doc(event.id).get();
      } else {
        return await db.collection("order").orderBy('createTime', 'desc').skip(event.page).limit(8).get();
      }
    case 'count':
      return await db.collection("order").count();
    case 'filterCount':
      return await db.collection("order").where({
        active: _.eq(event.active)
      }).count();
    // 获取不同状态的用户订单
    case 'filter':
      return await db.collection('order').orderBy('createTime', 'desc').where({
        active: _.eq(event.active)
      }).skip(event.page).limit(8).get();
    case 'number': 
      return await db.collection("order").where({orderNumber: event.orderNumber}).get();
    case 'time': 
      return await db.collection("order").where({
        active: 4,
        createTime: _.gte(event.startTime).and(_.lte(event.endTime))
      }).get();
    default: break;
  }
  
};
