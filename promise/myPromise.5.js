// 功能点：让then()方法的回调函数总是异步调用
// 方法：使用setTimeout()

const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

function myPromise(executor) {
  let self = this;
  self.state = PENDING;
  self.value = null;
  self.reason = null;
  self.onFulfilledCallbacks = []; // then方法中onFuifilled的回调函数
  self.onRejectedCallbacks = []; // then方法中onRejected的回调函数

  function resolve(value) {
    if (self.state === PENDING) {
      self.state = FULFILLED;
      self.value = value;
      // 执行回调数组中的每个回调函数
      self.onFulfilledCallbacks.forEach((fulfilledCallback) =>
        fulfilledCallback()
      );
    }
  }
  function reject(reason) {
    if (self.state === PENDING) {
      self.state = REJECTED;
      self.reason = reason;
      // 执行回调数组中的每个回调函数
      self.onRejectedCallbacks.forEach(function(rejectedCallback) {
        rejectedCallback();
      });
    }
  }
  try {
    executor(resolve, reject);
  } catch (reason) {
    reject(reason);
  }
}

myPromise.prototype.then = function(onFuifilled, onRejected) {
  let self = this;
  let promise2 = null;

  promise2 = new myPromise((resolve, reject) => {
    if (self.state === PENDING) {
      self.onFulfilledCallbacks.push(() => {
        setTimeout(() => {
          try {
            let x = onFuifilled(self.value);
            self.resolvePromise(promise2, x, resolve, reject);
          } catch (reason) {
            reject(reason);
          }
        }, 0);
      });
      self.onRejectedCallbacks.push(() => {
        setTimeout(() => {
          try {
            let x = onRejected(self.reason);
            self.resolvePromise(promise2, x, resolve, reject);
          } catch (reason) {
            reject(reason);
          }
        }, 0);
      });
    }
  
    if (self.state === FULFILLED) {
      setTimeout(() => {
        try {
          let x = onFuifilled(self.value);
          self.resolvePromise(promise2, x, resolve, reject);
        } catch (reason) {
          reject(reason);
        }
      }, 0);
    }
  
    if (self.state === REJECTED) {
      setTimeout(() => {
        try {
          let x = onRejected(self.reason);
          self.resolvePromise(promise2, x, resolve, reject);
        } catch (reason) {
          reject(reason);
        }
      }, 0);
    }
  });

  return promise2;
};

myPromise.prototype.resolvePromise = function(promise2, x, resolve, reject) {
  let self = this;
  let called = false;   // called 防止多次调用

  if (promise2 === x) {
    return reject(new TypeError('循环引用'));
  }

  if (x !== null && (Object.prototype.toString.call(x) === '[object Object]' || Object.prototype.toString.call(x) === '[object Function]')) {
    // x是对象或者函数
    try {
      let then = x.then;

      if (typeof then === 'function') {
        then.call(x, (y) => {
          // 别人的Promise的then方法可能设置了getter等，使用called防止多次调用then方法
          if (called) return ;
          called = true;
          // 成功值y有可能还是promise或者是具有then方法等，再次resolvePromise，直到成功值为基本类型或者非thenable
          self.resolvePromise(promise2, y, resolve, reject);
        }, (reason) => {
          if (called) return ;
          called = true;
          reject(reason);
        });
      } else {
        if (called) return ;
        called = true;
        resolve(x);
      }
    } catch (reason) {
      if (called) return ;
      called = true;
      reject(reason);
    }
  } else {
    // x是普通值，直接resolve
    resolve(x);
  }
};

module.exports = myPromise;
