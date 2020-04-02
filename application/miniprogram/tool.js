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

