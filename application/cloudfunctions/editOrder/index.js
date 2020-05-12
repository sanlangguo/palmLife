const cloud = require("wx-server-sdk");
cloud.init({
  env: 'dev-o45qm',
  traceUser: true,
})
const db = cloud.database();
exports.main = async (event, context) => {
  return await db.collection('order').where({
    groupId: event.id
  }).update({
    data: {
      active: event.active,
      updateTime: event.updateTime
    }
  })
};