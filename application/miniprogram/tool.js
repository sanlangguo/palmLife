/**
 * 检测手机号
 * @param {*} phone
 * @returns true 不符合规则
 */
export function checkPhone(phone){ 
  if(!(/^1[3456789]\d{9}$/.test(phone))){
    return true; 
  } 
}

/**
 * 订单号
 */
export function orderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day= date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();
  return `E${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
}
