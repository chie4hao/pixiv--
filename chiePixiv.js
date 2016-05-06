/**
 * Created by chie on 2016/5/6.
 */

const pixivOption = require('./pixivOption.js');
const url = require('url');
const fs = require('fs')
const cheerio = require('cheerio');
const http = require('http');
const zlib = require('zlib');
const chieRequest = require('./chieRequest.js');

chiePixiv = {
    //通过illust_id找到原图
    illustIdToOriginal: function (illustId, callback) {
        let mediumUrl = 'http://www.pixiv.net/member_illust.php?mode=medium&illust_id=' + illustId;
        let urlm = url.parse(mediumUrl);
        chieRequest('html', new pixivOption(urlm.hostname, urlm.path, 'GET', 'http://www.pixiv.net/'), {}, function (decoded) {
            let $ = cheerio.load(decoded.toString());
            if ($('.works_display img')[0] !== undefined) {

                if ($('.works_display a')[0] !== undefined) {
                    //Multi 漫画模式
                    let mangaUrl = 'http://www.pixiv.net/member_illust.php?mode=manga&illust_id=' + illustId;
                    let mangaUrlParser = url.parse(mangaUrl);
                    chieRequest('html', new pixivOption(mangaUrlParser.hostname, mangaUrlParser.path, 'GET', mediumUrl), {}, function (decoded1) {
                        let $2 = cheerio.load(decoded1.toString());
                        let count = $2('.page-menu .total')[0].children[0].data;
                        let j = 0;
                        for (let i = 0; i < count; i++) {

                            let mangaOriginalPath = originalPath.replace(/_p0/g, '_p' + i);
                            chieRequest('originalOne', new pixivOption(imageUrl.hostname, mangaOriginalPath, 'GET', mangaUrl), {
                                name: name + '_' + illustId + '_' + i + imageType,
                            }, function (a) {
                                console.log(a);
                                if (++j === count)
                                    callback('全部完成');
                            })
                        }
                    });
                } else {
                    //单图 通过_illust_modal img找到原图真实地址，看了pixiv源代码才找到
                    let imageUrl=url.parse($('._illust_modal img')[0].attribs['data-src']);
                    let imageType=imageUrl.path.match(/\.\w*$/)[0];
                    let name = $('#wrapper .title')[0].children[0].data;

                    console.log(imageUrl.hostname + ' ' + imageUrl.path);

                    chieRequest('originalOne', new pixivOption(imageUrl.hostname, imageUrl.path, 'GET', mediumUrl), {name: name + '_' + illustId + imageType}, function (a) {
                        callback(a);
                    })
                }
            } else {
                callback('图片没找到');
            }
        })
    },
    search: function (searchStr, page) {
        //http://www.pixiv.net/search.php?word=%E5%8F%A4%E6%98%8E%E5%9C%B0%201000users%E5%85%A5%E3%82%8A&order=date_d&p=6
        let searchUrl = 'http://www.pixiv.net/search.php?word=' + encodeURI(searchStr) + '&order=date_d&p=' + page;
        let searchUrlParser=url.parse(searchUrl);
        chieRequest('html', new pixivOption(searchUrlParser.hostname, searchUrlParser.path, 'GET', 'http://www.pixiv.net/'), {}, function (decoded) {
            //console.log(decoded.toString())
            let $ = cheerio.load(decoded.toString());
            var imageIdArray=[];
            Array.prototype.forEach.call($('.column-search-result .image-item .work'), function (a) {
                imageIdArray.push(a.attribs.href.match(/\d*$/)[0])
            });
            console.log(imageIdArray)
            imageIdArray.forEach(function(a){
                chiePixiv.illustIdToOriginal(a, function (b) {
                    console.log(b);
                });
            })
        });
    }
}

module.exports = chiePixiv;