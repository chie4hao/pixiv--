/**
 * Created by chie on 2016/5/6.
 */

const pixivOption = require('./pixivOption.js');
const url = require('url');
const fs = require('fs')
const $ = require('cheerio');
const http = require('http');
const zlib = require('zlib');
const chieRequest = require('./chieRequest.js');

chiePixiv = {
    //通过illust_id找到原图
    illustIdToOriginal: function (illustId, callback) {
        let mediumUrl = 'http://www.pixiv.net/member_illust.php?mode=medium&illust_id=' + illustId;
        let urlm = url.parse(mediumUrl);
        chieRequest('html', new pixivOption(urlm.hostname, urlm.path, 'GET', 'http://www.pixiv.net/'), {}, function (decoded) {
            let wrapper = $('#wrapper', decoded.toString());
            let worksDisplay = $('.works_display', wrapper);

            if ($('img',worksDisplay).length!==0) {
                if ($('.player',worksDisplay).length!==0) {
                    callback('a player');
                }
                else if ($('a',worksDisplay).length!==0) {
                    //Multi 漫画模式
                    let mangaUrl = 'http://www.pixiv.net/member_illust.php?mode=manga&illust_id=' + illustId;
                    let mangaUrlParser = url.parse(mangaUrl);
                    chieRequest('html', new pixivOption(mangaUrlParser.hostname, mangaUrlParser.path, 'GET', mediumUrl), {}, function (decoded1) {
                        let count=parseInt($('.page-menu .total',decoded1.toString()).text());

                        let j = 0;
                        let errorcount = 0;

                        for (let i = 0; i < count; i++) {
                            let mangaBigUrl = 'http://www.pixiv.net/member_illust.php?mode=manga_big&illust_id=' + illustId + '&page=' + i
                            let mangaBigUrlParser = url.parse(mangaBigUrl);
                            chieRequest('html', new pixivOption(mangaBigUrlParser.hostname, mangaBigUrlParser.path, 'GET', mangaUrl), {}, function (decoded2) {
                                let imgsrc=$('img',decoded2.toString());

                                if (imgsrc.length !== 0) {
                                    let imageBigUrl = url.parse(imgsrc.attr('src'));
                                    let imageBigType = imageBigUrl.path.match(/\.\w*$/)[0];
                                    let name = $('.ui-expander-target title',wrapper).text();

                                    chieRequest('originalOne', new pixivOption(imageBigUrl.hostname, imageBigUrl.path, 'GET', mangaBigUrl), {
                                        name: illustId + '_' + i + '_' + name + imageBigType,
                                    }, function (a) {
                                        if (++j + errorcount === count)
                                            callback('全部完成 errorcount:' + errorcount + ' successcount:' + j + ' count:' + count);
                                    })
                                } else {
                                    if (++errorcount + j === count) {
                                        callback('全部完成 errorcount:' + errorcount + ' successcount:' + j + ' count:' + count);
                                    }
                                }

                            });
                        }
                    });
                } else {
                    //单图 通过_illust_modal img找到原图真实地址，看了pixiv源代码才找到
                    let imageUrl = url.parse($('._illust_modal img',wrapper).attr('data-src'));
                    let imageType = imageUrl.path.match(/\.\w*$/)[0];
                    let name = $('.title',wrapper)[0].children[0].data;

                    chieRequest('originalOne', new pixivOption(imageUrl.hostname, imageUrl.path, 'GET', mediumUrl), {name: illustId + '_' + name + imageType}, function (a) {
                        callback(a);
                    })
                }
            } else {
                callback('图片没找到');
            }
        });
    },
    search: function (searchStr, page,callback) {
        let searchUrl = 'http://www.pixiv.net/search.php?word=' + encodeURI(searchStr) + '&order=date_d&p=' + page;
        let searchUrlParser = url.parse(searchUrl);
        chieRequest('html', new pixivOption(searchUrlParser.hostname, searchUrlParser.path, 'GET', 'http://www.pixiv.net/'), {}, function (decoded) {
            let imageWork=$('.column-search-result .image-item .work',decoded.toString());
            let imageIdArray = [];

            if(imageWork.length!==0){
                Array.prototype.forEach.call(imageWork, function (a) {
                    imageIdArray.push(a.attribs.href.match(/\d*$/)[0])
                });
                let c = 0;
                imageIdArray.forEach(function (a) {
                    chiePixiv.illustIdToOriginal(a, function (b) {
                        console.log(b);
                        if (++c >= imageIdArray.length) {
                            callback('ol')
                        }
                    });
                })
            }
            else{
                callback('么找到')
            }
        });
    }
}

module.exports = chiePixiv;