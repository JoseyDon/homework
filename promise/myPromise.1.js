// 功能点：promise有三种状态：初始状态pending、成功状态fulfilled、失败状态rejected
// 功能点：状态只能由 pending -> fulfilled 或者 pending -> rejected 并且不可再变
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function myPromise(executor){
    let self = this;
    self.state = PENDING;

    function resolve(value){
        self.state === PENDING ? self.state = FULFILLED:'';
    }
    function reject(reason){
        self.state === PENDING ? self.state = REJECTED :'';
    }
    try{
        executor(resolve,reject);
    }catch(reason){
        reject(reason);
    }
}

module.exports = myPromise;