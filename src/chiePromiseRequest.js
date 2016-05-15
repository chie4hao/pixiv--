/**
 * Created by chie on 2016/5/13.
 */

const htmlGetQueue = async.queue(function (task, callback) {
    task(callback)
}, config.HtmlGetCount);

const originalQueue = async.queue(function (task, callback) {
    task(callback)
}, config.OriginalGetCount);

const request = function (method, options, parameters, uploadcount) {
    uploadcount = uploadcount || 0;
    switch (method) {
        case 'html':
            return new Promise(function (resolve, reject) {
                htmlGetQueue.push(function (cb) {
                    htmlGetPromise(options).then(function (a) {
                        cb();
                        resolve(a)
                    }, function (a) {
                        cb();
                        if (a === 'htmlGet超时' || a.indexOf('problem with request htmlGet') !== -1) {
                            if (uploadcount < config.htmlGetRetransmissionCount) {
                                console.log('htmlGet超时');
                                //重传,重传次数为uploadcount
                                request(method, options, parameters, ++uploadcount).then(function (a) {
                                    resolve(a)
                                }, function (a) {
                                    reject(a)
                                })
                            } else {
                                reject(config.htmlGetRetransmissionCount + '次htmlGet重传失败,网络问题');
                            }
                        } else {
                            reject(a);
                        }
                    });
                }, function () {
                    //判断执行完毕的回调
                })
            })
            break;
        case 'originalOne':
            return new Promise(function (resolve, reject) {
                originalQueue.push(function (cb) {
                    originalPromise(options, parameters).then(function (a) {
                        cb();
                        resolve(a);
                    }, function (a) {
                        cb();
                        if (a.indexOf('重传') !== -1) {
                            if (uploadcount < config.originalOneRetransmissionCount) {
                                console.log('originalGet重传');
                                request(method, options, parameters, ++uploadcount).then(function (a) {
                                    resolve(a)
                                }, function (b) {
                                    reject(b);
                                })
                            }
                            else {
                                //返回结果数组,不reject
                                resolve(config.originalOneRetransmissionCount+'次originalOne重传失败,网络问题');
                            }
                        } else {                        //其他未知错误
                            reject(a)
                        }
                    });
                }, function () {
                    //判断执行完毕的回调
                })
            })
    }
};

let originalPromise = function (options, parameters) {
    return new Promise(function (resolve, reject) {
        let req = http.request(options, function (res) {
            res.setEncoding("base64");
            res.on('end', function () {
                resolve('写完');
            })
        });

        req.on('response', function (response) {
            let output = fs.createWriteStream('./resources/' + parameters.name.replace(/\\|\/|\?|\*|:|"|<|>/g, ''), {encoding: 'base64'});
            response.pipe(output);
        });

        req.on('error', function (e) {
            reject('需重传2');
        });

        req.setTimeout(config.originalOneGetTimeOut, function (a) {
            req.abort();
            reject('需重传1');
        });
        req.end();
    })
}

let htmlGetPromise = function (options) {
    return new Promise(function (resolve, reject) {
        let req = http.request(options, function (res) {
            //console.log('STATUS: ' + res.statusCode);
            //console.log('HEADERS: ' + JSON.stringify(res.headers));
            let size = 0;
            let chunks = [];
            //res.setEncoding("utf8");
            
            res.on('data', function (chunk) {
                size += chunk.length;
                chunks.push(chunk);
            });
            
            res.on('end', function () {
                let data = Buffer.concat(chunks, size);
                //Content-Encoding为gzip
                if (res.headers['content-encoding'] === 'gzip') {
                    zlib.gunzip(data, function (err, decoded) {
                        resolve(decoded);
                    })
                }
                else {
                    reject('htmlGet error content encoding')
                }
            })
        })

        req.on('error', function (e) {
            reject('problem with request htmlGet: ' + e.message);
        });
        
        req.setTimeout(config.htmlGetTimeout, function (a) {
            req.abort();
            reject('htmlGet超时')
        });
        
        req.end();
    })
}
module.exports = request;