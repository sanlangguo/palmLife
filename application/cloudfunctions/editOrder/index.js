const cloud = require("wx-server-sdk");
cloud.init({
  env: 'dev-o45qm',
  traceUser: true,
})
const db = cloud.database();
exports.main = async (event, context) => {
  const data = {
    groupId: event.id
  }
  if (event.active == 5) {
    data.active = 2;
  }
  return await db.collection('order').where({
    ...data
  }).update({
    data: {
      active: event.active,
      updateTime: event.updateTime
    }
  })
};