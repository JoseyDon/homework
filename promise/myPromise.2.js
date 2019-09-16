// 功能点：promise的then方法，接收两个函数作为参数：onFulfilled和onRejected，分别作为promise成功和失败的回调
// 功能点：promise中resolve和reject的参数value和reason是由executor传进来的，所以需要一个全局值供使用
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function myPromise(executor){
    let self = this;
    self.state = PENDING;
    self.value = null;
    self.reason = null;

    function resolve(value){
        self.state === PENDING ? (self.state = FULFILLED) && (self.value = value):'';
    }
    function reject(reason){
        self.state === PENDING ? (self.state = REJECTED) && (self.reason = reason) :'';
    }
    try{
        executor(resolve,reject);
    }catch(reason){
        reject(reason);
    }
}

myPromise.prototype.then = function(onFuifilled,onRejected) {
    let self = this;
    self.state === FULFILLED ? onFuifilled(self.value):'';
    self.state === REJECTED ? onRejected(self.reason):'';

}

module.exports = myPromise;