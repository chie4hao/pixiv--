/**
 * Created by chie on 2016/5/5.
 */
var http = require('http');
var fs = require('fs');
var zlib = require('zlib');
var cheerio = require('cheerio');
var url = require('url');
var pixivOption = require('./pixivOption.js');

var chieUrl = 'http://www.pixiv.net/member_illust.php?mode=medium&illust_id=56671889';
var urlp = url.parse(chieUrl)
//console.log(urlp.host)
var req = http.request(new pixivOption(urlp.hostname, urlp.path, 'GET', 'http://www.pixiv.net/'), function (res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    var imgData = '';
    var size = 0;
    var chunks = [];
    //res.setEncoding("utf8");
    res.on('data', function (chunk) {
        imgData += chunk;
        size += chunk.length;
        chunks.push(chunk);
    });
    res.on('end', function () {
        var data = Buffer.concat(chunks, size);
        //Content-Encoding为gzip,也可采用管道方式，http://www.jb51.net/article/61721.htm
        if (res.headers['content-encoding'] === 'gzip') {
            zlib.gunzip(data, function (err, decoded) {
                $ = cheerio.load(decoded.toString());
                console.log($('#wrapper .title')[0].children[0].data)
                if ($('.works_display img')[0] !== undefined) {
                    //i2.pixiv.net /c/600x600/img-master/img/2016/05/05/23/41/22/56732041_p0_master1200.jpg
                    //http://i2.pixiv.net/img-original/img/2016/05/05/23/41/22/56732041_p0.jpg
                    var imageUrl = url.parse(($('.works_display img')[0].attribs.src))
                    console.log(imageUrl.hostname + ' ' + imageUrl.path);
                    var originalPath = imageUrl.path.replace(/^.*\/img-master/, '/img-original').replace(/_master1200/, '');
                    var imageReq = http.request(new pixivOption(imageUrl.hostname, originalPath, 'GET', chieUrl), function (res) {
                        res.setEncoding("base64");
                        res.on('end', function () {
                            console.log('写完');
                        })
                    });
                    imageReq.on('response', function (response) {
                        var output = fs.createWriteStream('./resources/hehe.png', {encoding: 'base64'});
                        response.pipe(output);
                    });
                    imageReq.on('error', function (e) {
                        console.log('problem with request: ' + e.message);
                    });
                    imageReq.end();
                }
            });
        }
    });
});

/*
 var req = http.request(indexImageOptions, function (res) {
 console.log('STATUS: ' + res.statusCode);
 console.log('HEADERS: ' + JSON.stringify(res.headers));
 var imgData = '';
 res.setEncoding("base64");

 //200后写入，不推荐
 res.on('data', function (chunk) {
 imgData += chunk;
 });
 res.on('end', function () {
 fs.writeFile("./resources/logonew.png", imgData, "base64", function (err) {
 if (err) {
 console.log("down fail");
 }
 console.log("down success");
 });
 });

 res.on('end', function () {
 console.log('sdlfkj');
 });
 });

 req.on('response',function(response){
 var output=fs.createWriteStream('./resources/logo1.png',{encoding:'base64'});
 response.pipe(output);
 });*/

req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
});

// write data to request body
req.end();