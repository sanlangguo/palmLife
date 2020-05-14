const cloud = require("wx-server-sdk");
cloud.init({
  env: 'dev-o45qm',
  traceUser: true,
})
const db = cloud.database();
exports.main = async (event, context) => {
  const time = new Date().getTime();
  const res = await db.collection('order').where({expireTime: _.gt(time)}).skip(0).limit(100).get();

};
