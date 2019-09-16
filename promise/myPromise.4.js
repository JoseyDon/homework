// 功能点：then返回的仍是promise，新的promise的resolve的值是上一个promise的onFulfilled()函数或onRejected()函数的返回值
// 方法：新增promise2作为then()方法的返回值；将回调函数的返回值、promise2对象、resolve和reject方法作为参数传入一个resolvePromise的新方法中
// resolvePromise():用来解析then()回调函数中返回的仍是一个promise —— 自己的；别的库实现的；其他具有then()方法的对象
// A+规范要求：
/** 
 * Promise 解决过程是一个抽象的操作，其需输入一个 promise 和一个值，我们表示为 [[Resolve]](promise, x),
 * 如果 x 有 then 方法且看上去像一个 Promise ，解决程序即尝试使 promise 接受 x 的状态；否则其用 x 的值来执行 promise 。
 * 运行 [[Resolve]](promise, x) 需遵循以下步骤：

    x 与 promise 相等
      如果 promise 和 x 指向同一对象，以 TypeError 为据因拒绝执行 promise
    x 为 Promise
      如果 x 为 Promise ，则使 promise 接受 x 的状态:
      如果 x 处于等待态， promise 需保持为等待态直至 x 被执行或拒绝
      如果 x 处于执行态，用相同的值执行 promise
      如果 x 处于拒绝态，用相同的据因拒绝 promise
    x 为对象或函数
      如果 x 为对象或者函数：
        把 x.then 赋值给 then
      如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
      如果 then 是函数，将 x 作为函数的作用域 this 调用之。传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise:
        如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
        如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
        如果 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
        如果调用 then 方法抛出了异常 e：
          如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之
          否则以 e 为据因拒绝 promise
        如果 then 不是函数，以 x 为参数执行 promise
      如果 x 不为对象或者函数，以 x 为参数执行 promise

如果一个 promise 被一个循环的 thenable 链中的对象解决，而 [[Resolve]](promise, thenable) 的递归性质又使得其被再次调用，根据上述的算法将会陷入无限递归之中。算法虽不强制要求，但也鼓励施者检测这样的递归是否存在，若检测到存在则以一个可识别的 TypeError 为据因来拒绝 promise。

*/

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
        try {
          let x = onFuifilled(self.value);
          self.resolvePromise(promise2, x, resolve, reject);
        } catch(reason) {
          reject(reason);
        }
      });
      self.onRejectedCallbacks.push(() => {
        try {
          let x = onRejected(self.reason);
          self.resolvePromise(promise2, x, resolve, reject);
        } catch(reason) {
          reject(reason);
        }
      });
    }
  
    if (self.state === FULFILLED) {
      try {
        let x = onFuifilled(self.value);
        self.resolvePromise(promise2, x, resolve, reject);
      } catch (reason) {
        reject(reason);
      }
    }
  
    if (self.state === REJECTED) {
      try {
        let x = onRejected(self.reason);
        self.resolvePromise(promise2, x, resolve, reject);
      } catch (reason) {
        reject(reason);
      }
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
