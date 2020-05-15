const cloud = require("wx-server-sdk");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
  traceUser: true,
})
exports.main = async (event, context) => {
  const db = cloud.database();
  const _ = db.command;
  try {
    const res = await db.collection('order').where({active: _.eq(2)}).skip(0).limit(100).get();
    if (res.data && res.data.length) {
      res.data.map(async item => {
        const group = (await db.collection('group').doc(item.groupId).get()).data;
        if (group.groupExpireTime - new Date().getTime() <= 0 || group.expireTime - new Date().getTime() <= 0) {
          await db.collection('order').doc(item._id).update({
            data: {
              active: 5
            }
          });
        }
      })
    }
  } catch (e) {
    throw new Error(`数据库更新异常：${e.message}`);
  }
  return false
  console.log(111, 'res--------')
  console.log(res, 'res--------')
  
  console.log(res, 'res')
};
