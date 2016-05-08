/**
 * Created by chie on 2016/5/6.
 */


const ChieRequest = function () {

};

ChieRequest.prototype.init = function (callback) {
    let that = this;
    this.req = http.request(this.options, function (res) {
        //console.log('STATUS: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        that.res = res;
        that.receive(that);
    })
}

ChieRequest.prototype.receive = function () {
    throw new Error('receive');
}

ChieRequest.prototype.send = function () {
    throw new Error('send');
}

ChieRequest.prototype.request = function () {
    this.init();
    this.send();
}


const HtmlGet = function (options) {
    this.options = options;
}

HtmlGet.prototype = new ChieRequest();

HtmlGet.prototype.receive = function (that) {
    let size = 0;
    let chunks = [];
    //res.setEncoding("utf8");
    that.res.on('data', function (chunk) {
        size += chunk.length;
        chunks.push(chunk);
    });
    that.res.on('end', function () {
        let data = Buffer.concat(chunks, size);
        //Content-Encoding为gzip
        if (that.res.headers['content-encoding'] === 'gzip') {
            zlib.gunzip(data, function (err, decoded) {
                that.callback(decoded);
            })
        }
        else {
            that.callback('error content encoding')
        }
    })
}

HtmlGet.prototype.send = function () {
    let that = this;
    this.req.on('error', function (e) {
        that.callback('problem with request html: ' + e.message);
    });
    this.req.setTimeout(config.htmlGetTimeout, function (a) {
        console.log('htmlGet超时')
        that.status = 'timeOut';
        that.req.abort();
    });
    this.req.end();
};


const OriginalOneGet = function (options, parameters) {
    this.options = options;
    this.parameters = parameters;
};

OriginalOneGet.prototype = new ChieRequest();

OriginalOneGet.prototype.receive = function (that) {
    that.res.setEncoding("base64");

    that.res.on('end', function () {

        if (that.status === 'timeOut') {
            that.status = 'end';
            that.callback('需重传1');
        }
        else if (that.status !== 'error') {
            that.callback('写完');
        }
    })
};

OriginalOneGet.prototype.send = function () {
    let parameters = this.parameters;
    let that = this;
    this.req.on('response', function (response) {
        let output = fs.createWriteStream('./resources/' + parameters.name.replace(/\\|\/|\?|\*|:|"|<|>/g, ''), {encoding: 'base64'});
        response.pipe(output);
    });
    this.req.on('error', function (e) {
        if (that.status !== 'end') {
            that.status = 'error';
            that.callback('需重传2');
        }
    });

    this.req.setTimeout(config.originalOneGetTimeOut, function (a) {
        that.status = 'timeOut';
        that.req.abort();
    });
    this.req.end();
};

const originalQueue = async.queue(function (task, callback) {
    task(callback);
}, config.OriginalGetCount);

const htmlGetQueue = async.queue(function (task, callback) {
    task(callback)
}, config.HtmlGetCount);

const request = function (method, options, parameters, callback) {
    switch (method) {
        case 'html':
            htmlGetQueue.push(function (cb) {
                //console.log('htmlGet begin');
                let b = new HtmlGet(options, parameters);
                b.callback = function (msg) {
                    cb();
                    callback(msg);
                };
                b.request();
            }, function () {
                //console.log('htmlGet done')
            })
            break;
        case 'originalOne':
            originalQueue.push(function (cb) {
                //console.log('original begin');
                let b = new OriginalOneGet(options, parameters);
                b.callback = function (msg) {
                    cb();
                    callback(msg);
                };
                b.request();
            }, function () {
                //console.log('original done')
            })
            break;
        default:
            throw new Error('method不对');
    }
}

module.exports = request;