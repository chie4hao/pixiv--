/**
 * Created by chie on 2016/5/5.
 */
const http = require('http');
const fs = require('fs');
const zlib = require('zlib');
const cheerio = require('cheerio');
const url = require('url');
const pixiv = require('./chiePixiv')

pixiv.illustIdToOriginal('46060002', function (a) {
    console.log(a);
});

/*
 pixiv.searchIllust('博麗霊夢 10000users入り', 1, function (a) {
 console.log(a);
 });
*/
/*
pixiv.authorIdIllust(915945, 1, function (a) {
    console.log(a);
});*/
/*
pixiv.searchAllIllust('3000users入り',function(a){
    console.log(a);
})*/

//热度搜索，大概需要会员吧，这个没会员真没办法，不过按收藏数量搜也还凑合 http://www.pixiv.net/search.php?word=%E9%9C%8A%E5%A4%A2&order=popular_d&p=2

//搜作者id插画 http://www.pixiv.net/member_illust.php?type=illust&id=18656&p=1
//搜作者id漫画 http://www.pixiv.net/member_illust.php?type=manga&id=18656&p=1