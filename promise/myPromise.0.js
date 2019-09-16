// 功能点：promise有resolve和reject两个参数，函数同步执行要放在try...catch中，不然无法进行错误捕获
// resolve接收成功值value，reject时接收失败值reason
function myPromise(executor){
    function resolve(value){
    }
    function reject(reason){}
    try{
        executor(resolve,reject);
    }catch(reason){
        reject(reason);
    }
}
