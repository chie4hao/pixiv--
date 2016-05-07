/**
 * Created by chie on 2016/5/6.
 */

const http = require('http');
const zlib = require('zlib');
const fs = require('fs');

const ChieRequest = function () {
    
};

ChieRequest.prototype.init = function (callback) {
    let that = this;
    this.req = http.request(this.options, function (res) {
        //console.log('STATUS: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        that.res = res;
        that.receive(that);
    }).on('error', function (e) {
        that.callback('problem with request: ' + e.message);
    });
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
    var that=this;
    this.req.on('error', function (e) {
        that.callback('problem with request1: ' + e.message);
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
        that.callback('写完');
    })
};

OriginalOneGet.prototype.send = function () {
    let parameters = this.parameters;
    let callback=this.callback;
    this.req.on('response', function (response) {
        let output = fs.createWriteStream('./resources/' + parameters.name, {encoding: 'base64'});
        response.pipe(output);
    });
    this.req.on('error', function (e) {
        callback('problem with request: ' + e.message);
    });
    this.req.end();
};


const request = function (method, options, parameters, callback) {
    switch (method) {
        case 'html':
            let a = new HtmlGet(options);
            a.callback = callback;
            a.request();
            break;
        case 'originalOne':
            let b = new OriginalOneGet(options, parameters);
            b.callback = callback;
            b.request();
            break;
        default:
            throw new Error('method不对');
    }
}

module.exports = request;