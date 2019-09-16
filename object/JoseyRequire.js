(function(){
    // 存储已经加载好了的模块
    var moduleCache = {};

    // 得到模块地址
    var getPathUrl = function(moduleName){
        var url = moduleName;
        url.indexOf('.js' == -1)?url = url + '.js':url;
        return url;
    }

    //  加载模块
    var loadModule = function(moduleName,callback){
        var url = getPathUrl(moduleName),fs,mod;

        // 先判断模块是否已经被加载
        if(moduleCache[moduleName]){
            mod = moduleCache[moduleName];
            mod.status == 'loaded'?setTimeout(callback(this.param),0):mod.onload.push(callback);
        }else{
            mod = moduleCache[moduleName] = {
                moduleName:moduleName,
                status:'loading',
                export:null,
                onload:[callback]
            };

            _script = document.createElement('script');
            _script.id = moduleName;
            _script.type = 'text/javascript';
            _script.charset = 'utf-8';
            _script.async = true;
            _script.src = url;

            fs = document.getElementsByTagName('script')[0];
            fs.parentNode.insertBefore(_script,fs);
        }
    }

    //  保存模块
    var saveModule = function(moduleName,param,callback){
        var mod,fn;

        // 判断模块是否加载
        if(moduleCache.hasOwnProperty(moduleName)){
            mod = moduleCache[moduleName];
            mod.status = 'loaded';
            mod.export = callback?callback(param):null;
            //  解除父类依赖
            while(fn = mod.onload.shift()){fn(mod.export)};
        }else{
            callback && callback.apply(window,param);
        }
    };

    var require = function(deps,callback){
        var params = [];
        var depCount = 0;//初始值为该模块依赖模块数组的长度
        var i,len,isEmpty= false,moduleName;
        moduleName = document.currentScript && document.currentScript.id || 'REQUIRE_MAIN';
        if(deps.length){
            for(i = 0, len = deps.length; i < len; i++){
                (function(i){
                    depCount++;
                    loadModule(deps[i],function(param){
                        params[i] =param;
                        depCount--;
                        if (depCount == 0) {
                            saveModule(moduleName, params, callback);
                        }
                    })
                })(i)
            }
        }else{
            isEmpty = true;
        }
        if(isEmpty){
            setTimeout(function () {
                saveModule(moduleName, null, callback);
            }, 0);
        }
    }

    window.require = require;
    window.define = require;
})()