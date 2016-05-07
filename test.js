/**
 * Created by chie on 2016/5/5.
 */
const http = require('http');
const fs = require('fs');
const zlib = require('zlib');
const cheerio = require('cheerio');
const url = require('url');
const pixiv = require('./chiePixiv')


/*pixiv.illustIdToOriginal('55228474', function (a) {
 console.log(a);
 });*/

pixiv.search('古明地 1000users入り', 13, function (a) {
    console.log(a);
});