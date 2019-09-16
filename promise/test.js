let MyPromise = require('./myPromise.5.js');

console.log('start');

let promise = new MyPromise((resolve, reject) => {
  console.log('step-');
  setTimeout(() => {
    resolve(123);
  }, 1000);
});

promise.then((value) => {
  console.log('step--');
  console.log('value', value);
});

console.log('end');