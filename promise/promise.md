#### 

#### 一、什么是promise？

在MDN中，定义promise的只有一句话：promise对象用于表示一个异步操作的最终完成（或失败），及其结果值。

从这句话的定义我们可以抓住几个关键词：promise是对象、异步操作、最终状态及结果值。

在真正了解promise是什么前，我们不得不思考，promise的出现究竟是为了解决什么问题。

##### 背景

javascript是单线程语言：单线程指如果有多个任务必须先排队，前面的任务执行完成后，后面的任务再执行。

##### 同步

如果在函数返回结果的时候，调用者能够拿到预期的结果（就是函数计算的结果），那么这个函数就是同步函数。

```javascript
console.log('joseydong'); // 执行后，获得了返回结果
```

```javascript
function wait(){
    var time = (new Date()).getTime();//获取当前的unix时间戳
    while((new Date()).getTime() - time < 5000){}
    console.log('你好我的名字是');
}
wait();
console.log('josey');
console.log('说得太慢了');
```

在这段代码中，wait函数是一个需要耗时5秒的函数，在这5秒中，下面的console.log()函数只能等待。

这就是同步的缺点：如果一个函数是同步的，即使调用函数执行任务比较耗时，也会一直等待直到得到执行结果。

##### 异步

如果在函数返回的时候，调用者还不能得到预期的结果，而是将来通过一定的手段得到，这就叫异步。

当执行异步函数的时候，发出调用之后会马上返回，但不会是返回预期结果；调用者不必默默等待，当得到返回结果的时候回通过回调函数主动通知调用者。

![![3650028076-5a6f103dc9c04_articlex](file:///C:/Users/asus/Desktop/3650028076-5a6f103dc9c04_articlex.png?lastModify=1568481323)](C:\Users\asus\Desktop\3650028076-5a6f103dc9c04_articlex.png)



##### 异步的实现

异步操作是会在某个时间点触发一个函数的调用。

比如AJAX就是典型的异步操作：

```javascript
request.onreadystatechange = function () {
    if (request.readyState === 4) {
        if (request.status === 200) {
            return success(request.responseText);
        } else {
            return fail(request.status);
        }
    }
}
```

把回调函数success(request.responseText)和fail(request.status)写在一个ajax操作里，不利于维护，也不好复用。

思考一种更好的写法，比如：

```javascript
var ajax = ajaxGet('url');
ajax.ifSuccess(success)
    .ifFail(fail)
```

这种链式写法的好处在于：先统一执行ajax逻辑，不关心如何处理返回结果，然后根据返回结果是成功还是失败，在将来的某个时候调用success函数或者fail函数。



##### promise

这种承诺（promise）将来会执行的对象被称为promise对象。

Promise有各种开源实现，在ES6中被统一规范，由浏览器直接支持。



#### 二、关于promise

promise是一个对象，从这个对象中可以获取异步操作的信息。

它代表一个异步操作，有三种状态：

- pending(进行中)：初始状态
- resolved(已完成)：操作成功。又名fulfilled
- rejected(已失败)：操作失败

有了promise，就可以将异步操作以同步操作的流程表达，但它也有如下缺点：

- 一旦创建就会立即执行，无法中途取消
- 如果不设置回调函数，promise内部抛出的错误，不会反映到外部
- 当处于pending状态，无法得知是刚刚开始还全是即将结束。

#### 三、应用示例

##### 创建promise

```javascript
var promise = new Promise(
	/* executor */
	function(resolve,reject){
  		//...
	}
);
```

executor函数由Promise实例立即执行，传递resolved和reject函数。

在executor内部，promise有如下可能的变化：

- resolve被调用，promise状态由pengding变为resolved，代表该promise被成功解析
- reject被调用，promise由pengding变为rejected，代表该promise的值不能用于后续处理，被拒绝了。

*1、如果在executor方法的执行过程中抛出了任何异常，那么promise立即被拒绝，相当于reject方法被调用，executor的返回值也就被忽略。*

*2、如果一个promise对象处在resolved或者rejected状态，那么也可以被称为settled状态。*

##### 处理Promise实例

- then：Promise实例生成以后，可以用then方法分别指定resolved状态和rejected状态的回调函数。

  ```javascript
  promise.then(value => {
    // success 状态为resolved时调用
  },error => {
    // failure 状态为rejected时调用
  });
  ```

  then方法可以接受两个回调函数作为参数：

  第一个回调函数：在pending状态—>resolved状态时被调用；参数为resolve方法的返回值

  第二个回调函数：在pending状态—>rejected状态时被调用；参数为reject方法的返回值；可选。

- catch：Promise.prototype.catch方法是.then(null,rejection)的别名，用于指定发生错误时的回调函数。

  ```
  promise.then(res => {
    // ...
  }).catch(error => {
    console.log('发生错误：',error);
  });
  ```

- 扩展

  Promise.prototype.then和Promise.prototype.catch方法返回promise对象，所以它可以被链式调用。但此时返回的是以函数返回值生成的新的Promise实例，不是原来的那个Promise实例。

   ![3686716647-54c1b1b3c959d_articlex](C:\Users\asus\Desktop\3686716647-54c1b1b3c959d_articlex.png)

*1.Promise对象的错误具有冒泡性质，会一直向后传递，直到被捕获为止。也就是说错误一定会被catch语句捕获。*

##### 将多个Promise实例，包装成一个新的Promise实例

- Promise.all(iterable):当所有在可迭代参数中的promises已完成时，或者当传递过程中的任何一个promise进入rejected状态，返回promise。

  ```javascript
  var promise = Promise.all([p1,p2,p3]);
  ```

​          p1&&p2&&p3 都返回resolved => promise返回resolved

​         p1||p2||p3中任意一个返回rejected=>promise状态就变成rejected，此时第一个被reject的实例返回值会传递给p的回调函数。

#### 四、promise最佳实践

- 防止then嵌套

  因为then中return的还是promise，所以会执行完里面的promise再执行外面的then。此时最好将其展开，也是一样的结果，而且会更好读。

  ```javascript
  // ------------    不好的写法   -------------
  new Promise (resolve => {
      console.log('Step 1');
      setTimeout(()=> {
          resolve('100');
      },1000)
  }).then(value => { // value => 100
      return new Promise(resolve => {
          console.log('Step 1-1');
          setTimeout(() => {
              resolve('110');
          },1000);
      })
      .then(value => { // value => 110
          console.log('Step 1-2');
          return value;
      })
      .then(value => { // value => 110
          console.log('Step 1-3')
          return value;
      })
  })
  .then(value => {
      console.log(value); // value = 110
      console.log('Step 2')
  })
  ```


  // ------------    好的写法    ------------
  new Promise((resolve) => {
    console.log("Step 1");
    setTimeout(() => {
      resolve("100");
    }, 1000);
  })
    .then((value) => {
      // value => 100
      return new Promise((resolve) => {
        console.log("Step 1-1");
        setTimeout(() => {
          resolve("110");
        }, 1000);
      });
    })
    .then((value) => {
      // value => 110
      console.log("Step 1-2");
      return value;
    })
    .then((value) => {
      // value => 110
      console.log("Step 1-3");
      return value;
    })
    .then((value) => {
      console.log(value); // value = 110
      console.log("Step 2");
    });
  ```


- 使用.catch()捕捉错误

  通常情况下promise有如下两种处理方式：

  ```javascript
  // ------------    不好的写法   -------------
  promise.then(function(data) {
      // success
    }, function(err) {   //仅处理promise运行时发生的错误。无法处理回调中的错误
      // error
    });

  // ------------    好的写法    ------------
  promise.then(res => {
      // success
  }).catch(err => {   // 处理 promise 和 前一个回调函数运行时发生的错误
      // error 
  });
  ```

  因为promise抛出的错误不会传递到外层，当使用第一种写法时，成功回调的错误无法处理，因此建议使用catch方法。

- then方法中，永远return或throw

  ```javascript
  //------------    不好的写法    ------------------
  promise.then(function () {
    getUserInfo(userId);
  }).then(function () {
    // 在这里可能希望在这个回调中使用用户信息，但你可能会发现它根本不存在
  });
  ```

  如果要使用链式then，必须返回一个promise对象。



#### 五、async/await是什么？

async：异步，await：异步等待。

简单来说async用于声明一个function是异步的，而await用于等待一个异步方法执行完成。

语法规定await只能出现在async函数中，async函数返回的是一个Promise对象。

promise的特点是无需等待，所以在没有await的情况下执行async函数，它会立即执行，返回一个promise对象并且不会阻塞后面的语句，就和普通的promise一样。

await等待的是一个promise对象/其他值。

因为async函数返回的是一个promise对象，所以await可以用于等待一个async函数的返回值。并且，它可以等待任意表达式的结果，所以await后面可以接普通函数调用或者直接量。

```javascript
function getSomething() {
    return "something";
}

async function testAsync() {
    return Promise.resolve("hello async");
}

async function test() {
    const v1 = await getSomething(); // Promise对象
    const v2 = await testAsync(); // 普通函数
    console.log(v1, v2);
}

test();
```

await是个运算符，用于组成表达式，await表达式的运算结果取决于它等的东西。

如果等到的不是个promise对象，那么await表达式的运算结果就等于它等到的东西。

如果等到的是个promise对象，那么await就会阻塞后面的代码，等着promise对象的resolved状态，然后得到resolve的值，作为await表达式的运算结果。

*1、这就是await必须放在async函数内部的原因：async函数调用不会造成阻塞，它内部所有的阻塞都被封装在一个promise对象中异步执行。*

##### 与promise简单的比较

不使用async/await

```javascript
function takeLongTime() {
  return new Promise(resolve => {
    setTimeout(() => resolve('hahahha'),1000);
  });
}

takeLongTime().then(value => console.log('heihei',value))
```

使用async/await

```javascript
function takeLongTime() {
  return new Promise(resolve => {
    setTimeout(() => resolve('hahahha'),1000);
  });
}

async function test() {
  const value = await takeLongTime();
  console.log(value);
}

test();
```

##### async/await的优势在于处理then链

Promise通过then链来解决多层回调问题，但如果需要同时处理由多个Promise组成的then链，就可以用async/await来进一步优化。

假设一个场景，分多个步骤完成，每个步骤都是异步的，而且依赖于上一个步骤的结果。

```javascript
function takeLongTime(n) {
    return new Promise(resolve => {
        setTimeout(() => resolve(n + 200), n);
    });
}

function step1(n) {
    console.log(`step1 with ${n}`);
    return takeLongTime(n);
}

function step2(n) {
    console.log(`step2 with ${n}`);
    return takeLongTime(n);
}

function step3(n) {
    console.log(`step3 with ${n}`);
    return takeLongTime(n);
}
```

用Promise方法来实现这几个步骤的处理：

```javascript
function doIt() {
    console.time("doIt");
    const time1 = 300;
    step1(time1)
        .then(time2 => step2(time2))
        .then(time3 => step3(time3))
        .then(result => {
            console.log(`result is ${result}`);
            console.timeEnd("doIt");
        });
}

doIt();

// step1 with 300
// step2 with 500
// step3 with 700
// result is 900
// doIt: 1580.487ms
```

用async/await来实现：

```javascript
async function doIt() {
    console.time("doIt");
    const time1 = 300;
    const time2 = await step1(time1);
    const time3 = await step2(time2);
    const result = await step3(time3);
    console.log(`result is ${result}`);
    console.timeEnd("doIt");
}

doIt();
```

*1、async/await优点：代码更加简洁。*



修改下上面场景的代码，后续步骤需要多个返回值：

```javascript
function step1(n) {
    console.log(`step1 with ${n}`);
    return takeLongTime(n);
}

function step2(m, n) {
    console.log(`step2 with ${m} and ${n}`);
    return takeLongTime(m + n);
}

function step3(k, m, n) {
    console.log(`step3 with ${k}, ${m} and ${n}`);
    return takeLongTime(k + m + n);
}
```

用promise处理，就会发现处理返回值会比较麻烦：

```javascript
function doIt() {
    console.time("doIt");
    const time1 = 300;
    step1(time1)
        .then(time2 => {
            return step2(time1, time2)
                .then(time3 => [time1, time2, time3]);
        })
        .then(times => {
            const [time1, time2, time3] = times;
            return step3(time1, time2, time3);
        })
        .then(result => {
            console.log(`result is ${result}`);
            console.timeEnd("doIt");
        });
}

doIt();
```

用async/await处理：

```javascript
async function doIt() {
    console.time("doIt");
    const time1 = 300;
    const time2 = await step1(time1);
    const time3 = await step2(time1, time2);
    const result = await step3(time1, time2, time3);
    console.log(`result is ${result}`);
    console.timeEnd("doIt");
}

doIt();

// step1 with 300
// step2 with 800 = 300 + 500
// step3 with 1800 = 300 + 500 + 1000
// result is 2000
// doIt: 2907.387ms
```

*2、async/await的优点：解决promise传递参数太麻烦的问题。*



##### async/await使用try...catch处理rejected状态

```javascript
async function myFunction() {
  try {
    await somethingThatReturnsAPromise();
  } catch (err) {
    console.log(err);
  }
}

// 另一种写法

async function myFunction() {
  await somethingThatReturnsAPromise().catch(function (err){
    console.log(err);
  });
}
```