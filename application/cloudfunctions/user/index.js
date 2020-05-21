const cloud = require("wx-server-sdk");
cloud.init({
  env: 'dev-o45qm',
  traceUser: true,
})
const db = cloud.database();
const _ = db.command;
exports.main = async (event, context) => {
  switch (event.type) {
    case 'get': 
      if (event.id) {
        return await db.collection("user").doc(event.id).get();
      } else {
        return await db.collection("user").orderBy('createTime', 'desc').skip(event.page).limit(8).get();
      }
    case 'count':
      return await db.collection("user").count();
    case 'filter':
      return await db.collection('user').orderBy('createTime', 'desc').where({
        active: _.eq(event.active)
      }).skip(event.page).limit(8).get();
    case 'user-order':
      return await db.collection("user").aggregate().match({
        _openid: event.openid
      }).lookup({
        from: 'order',
        localField: '_openid',
        foreignField: '_openid',
        as: 'orderList',
      }).end();
    default: break;
  }
  
};
