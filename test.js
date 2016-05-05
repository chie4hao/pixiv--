/**
 * Created by chie on 2016/5/5.
 */
var http = require('http');
var fs = require('fs');
var zlib = require('zlib');
var cheerio = require('cheerio');

var indexImageOptions = {
    hostname: 'i3.pixiv.net',
    path: '/img03/profile/kotocc/8007234.jpg',
    method: 'GET',
    headers: {
        'Accept': 'image/webp,image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, sdch',
        'Accept-Language': 'zh-CN,zh;q=0.8',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Cookie': 'p_ab_id=6; device_token=16bfb2fa262d6a8a529918865677d188; ' +
        'PHPSESSID=8318723_06a7561cbe9fcc2ee5799e4960f71476; ' +
        /*
         '__utmt=1; __utma=235335808.1494775107.1459338049.1462429185.1462433443.6; ' +
         '__utmb=235335808.1.10.1462433443; __utmc=235335808; ' +
         '__utmz=235335808.1462433443.6.4.utmcsr=baidu|utmccn=(organic)|utmcmd=organic; ' +
         '__utmv=235335808.|2=login%20ever=yes=1^3=plan=normal=1^5=gender=male=1^6=user_id=8318723=1; ' +
         '_ga=GA1.2.1494775107.1459338049; ' +
         '_gat_UA-77039608-4=1; ' +
         */
        'module_orders_mypage=%5B%7B%22name%22%3A%22everyone_new_illusts%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22spotlight%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22featured_tags%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22contests%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22following_new_illusts%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22mypixiv_new_illusts%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22booth_follow_items%22%2C%22visible%22%3Atrue%7D%5D',

        'Host': 'i3.pixiv.net',
        'Referer': 'http://www.pixiv.net/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36'
    }
};

var indexOptions = {
    hostname: 'www.pixiv.net',
    path: '/',
    method: 'GET',
    headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, sdch',
        'Accept-Language': 'zh-CN,zh;q=0.8',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Cookie': 'p_ab_id=6; login_ever=yes; device_token=16bfb2fa262d6a8a529918865677d188; a_type=0; ' +
        'PHPSESSID=8318723_06a7561cbe9fcc2ee5799e4960f71476; ' +
        /*
         '__utmt=1; __utma=235335808.1494775107.1459338049.1462429185.1462433443.6; ' +
         '__utmb=235335808.1.10.1462433443; __utmc=235335808; ' +
         '__utmz=235335808.1462433443.6.4.utmcsr=baidu|utmccn=(organic)|utmcmd=organic; ' +
         '__utmv=235335808.|2=login%20ever=yes=1^3=plan=normal=1^5=gender=male=1^6=user_id=8318723=1; ' +
         '_ga=GA1.2.1494775107.1459338049; ' +
         '_gat_UA-77039608-4=1; ' +
         */
        'module_orders_mypage=%5B%7B%22name%22%3A%22everyone_new_illusts%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22spotlight%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22featured_tags%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22contests%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22following_new_illusts%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22mypixiv_new_illusts%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22booth_follow_items%22%2C%22visible%22%3Atrue%7D%5D',

        'Host': 'www.pixiv.net',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36'
    }
};
var indexDownloadOptions = {
    hostname: 'www.pixiv.net',
    path: '/member_illust.php?mode=medium&illust_id=56726446',
    method: 'GET',
    headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, sdch',
        'Accept-Language': 'zh-CN,zh;q=0.8',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Cookie': 'p_ab_id=6; login_ever=yes; device_token=16bfb2fa262d6a8a529918865677d188; a_type=0; ' +
        'PHPSESSID=8318723_06a7561cbe9fcc2ee5799e4960f71476; ' +
        /*
         '__utmt=1; __utma=235335808.1494775107.1459338049.1462429185.1462433443.6; ' +
         '__utmb=235335808.1.10.1462433443; __utmc=235335808; ' +
         '__utmz=235335808.1462433443.6.4.utmcsr=baidu|utmccn=(organic)|utmcmd=organic; ' +
         '__utmv=235335808.|2=login%20ever=yes=1^3=plan=normal=1^5=gender=male=1^6=user_id=8318723=1; ' +
         '_ga=GA1.2.1494775107.1459338049; ' +
         '_gat_UA-77039608-4=1; ' +
         */
        'module_orders_mypage=%5B%7B%22name%22%3A%22everyone_new_illusts%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22spotlight%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22featured_tags%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22contests%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22following_new_illusts%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22mypixiv_new_illusts%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22booth_follow_items%22%2C%22visible%22%3Atrue%7D%5D',
        'Host': 'www.pixiv.net',
        'Referer':'http://www.pixiv.net/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36'
    }
};

var req = http.request(indexDownloadOptions, function (res) {
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
                $=cheerio.load(decoded.toString());
                console.log($('.works_display img')[0].attribs.src)
                data = decoded.toString();
                //console.log(data);
                //callback( err, args, res.headers, data);
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