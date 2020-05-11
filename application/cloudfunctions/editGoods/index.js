const cloud = require("wx-server-sdk");
cloud.init({
  env: 'dev-o45qm',
  traceUser: true,
})
const db = cloud.database();
exports.main = async (event, context) => {
  return await db
    .collection("goods-list")
    .where({
      _id: event._id,
    })
    .update({
      data: event.data,
    });
};
