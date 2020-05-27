const cloud = require("wx-server-sdk");
cloud.init({
  env: 'dev-o45qm',
  traceUser: true,
})
const db = cloud.database();
exports.main = async (event, context) => {
  switch (event.type) {
    case 'delete': 
      return await db.collection('goods-list').doc(event.id).remove();
    case 'add': 
      return await db.collection('goods-list').add({data: event.data});
  }
};
