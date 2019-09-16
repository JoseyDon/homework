// 问题：能够同步调用resolve()，但是如果异步调用，then()方法中state状态仍是pending，就无法调用onFulfilled()了
// 功能点：异步调用resolve
// 方法：注册回调函数数组，用于存储then()方法中传入的回调函数；当调用resolve()或者reject()的时候，修改state状态并从回调数组中依次取出回调函数执行

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
  if (self.state === PENDING) {
    self.onFulfilledCallbacks.push(() => {
      onFuifilled(self.value);
    });
    self.onRejectedCallbacks.push(() => {
      onRejected(self.reason);
    });
  }

  // 更改state值
  if (self.state === FULFILLED) {
    onFuifilled(self.value);
  }

  if (self.state === REJECTED) {
    onRejected(self.reason);
  }
};

module.exports = myPromise;
