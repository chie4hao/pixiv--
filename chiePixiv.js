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
const R18 = false;
const mangaModel = true;
const tagNotExistsFilter = ['BL', '腐', '漫画', '講座', '刀剣乱', '松', '黒子', '弱虫ペダル', '世界一初恋', '進撃の巨人', 'ハイキュー', '銀魂', 'アザゼルさん'];
const tagExistsFilter = [];

chiePixiv = {
    //通过illust_id下载原图
    illustIdToOriginal: function (illustId, callback) {
        let mediumUrl = 'http://www.pixiv.net/member_illust.php?mode=medium&illust_id=' + illustId;
        let urlm = url.parse(mediumUrl);
        chieRequest('html', new pixivOption(urlm.hostname, urlm.path, 'GET', 'http://www.pixiv.net/'), {}, function (decoded) {
            let wrapper = $('#wrapper', decoded.toString());
            let worksDisplay = $('.works_display', wrapper);

            var tagsStr = '';
            var tagsArray = $('.work-tags dl dd ul li .text', wrapper)
            try {
                Array.prototype.forEach.call(tagsArray, function (a) {
                    tagsStr += (' ' + a.children[0].data)
                });
            } catch (e) {
                callback(e);
                return;
            }

            if (tagExistsFilter.every(function (a) {
                    return tagsStr.indexOf(a) !== -1
                }) && tagNotExistsFilter.every(function (b) {
                    return tagsStr.indexOf(b) === -1
                })) {
                if ($('img', worksDisplay).length !== 0) {
                    if ($('.player', worksDisplay).length !== 0) {
                        callback('a player');
                    }
                    else if ($('a', worksDisplay).length !== 0) {
                        //Multi 漫画模式
                        if (mangaModel) {
                            let mangaUrl = 'http://www.pixiv.net/member_illust.php?mode=manga&illust_id=' + illustId;
                            let mangaUrlParser = url.parse(mangaUrl);
                            chieRequest('html', new pixivOption(mangaUrlParser.hostname, mangaUrlParser.path, 'GET', mediumUrl), {}, function (decoded1) {
                                let count = parseInt($('.page-menu .total', decoded1.toString()).text());

                                let j = 0;
                                let errorcount = 0;

                                for (let i = 0; i < count; i++) {
                                    let mangaBigUrl = 'http://www.pixiv.net/member_illust.php?mode=manga_big&illust_id=' + illustId + '&page=' + i
                                    let mangaBigUrlParser = url.parse(mangaBigUrl);
                                    chieRequest('html', new pixivOption(mangaBigUrlParser.hostname, mangaBigUrlParser.path, 'GET', mangaUrl), {}, function (decoded2) {
                                        let imgsrc = $('img', decoded2.toString());

                                        if (imgsrc.length !== 0) {
                                            let imageBigUrl = url.parse(imgsrc.attr('src'));
                                            let imageBigType = imageBigUrl.path.match(/\.\w*$/)[0];
                                            let name = $('.ui-expander-target title', wrapper).text();

                                            chieRequest('originalOne', new pixivOption(imageBigUrl.hostname, imageBigUrl.path, 'GET', mangaBigUrl), {
                                                name: illustId + '_' + i + '_' + name + imageBigType,
                                            }, function (a) {
                                                a.indexOf('需重传') !== -1 ? errorcount++ : j++;
                                                if (errorcount + j === count) {
                                                    if (errorcount === 0)
                                                        callback(illustId + '全部完成 errorcount:' + errorcount + ' successcount:' + j + ' count:' + count);
                                                    else chiePixiv.illustIdToOriginal(illustId, function (asdf) {
                                                        callback(asdf)
                                                    })
                                                }
                                            })
                                        } else {
                                            if (++errorcount + j === count) {
                                                //callback(illustId + '全部完成 errorcount:' + errorcount + ' successcount:' + j + ' count:' + count);
                                                chiePixiv.illustIdToOriginal(illustId, function (asdf) {
                                                    callback(asdf)
                                                })
                                            }
                                        }
                                    });
                                }
                            });
                        } else {
                            callback('请开启manga模式')
                        }
                    } else {
                        //单图 通过_illust_modal img找到原图真实地址，看了pixiv源代码才找到
                        let imageUrl = url.parse($('._illust_modal img', wrapper).attr('data-src'));
                        let imageType = imageUrl.path.match(/\.\w*$/)[0];
                        let name = $('.title', wrapper)[0].children[0].data;
                        if(!fs.existsSync('./resources/' + name.replace(/\\|\/|\?/g, ''))){
                            chieRequest('originalOne', new pixivOption(imageUrl.hostname, imageUrl.path, 'GET', mediumUrl), {name: illustId + '_' + name + imageType}, function (a) {
                                if (a.indexOf('重传') !== -1) {
                                    console.log(illustId + a + ' ...重传中');
                                    chiePixiv.illustIdToOriginal(illustId, function (asdf) {
                                        callback(asdf)
                                    })
                                } else {
                                    callback(illustId.toString() + a);
                                }
                            });
                        }
                        else{
                            callback(illustId+'已存在');
                        }
                    }
                } else {
                    callback('图片没找到');
                }
            }
            else {
                callback(illustId + '已过滤')
            }
        });
    },
    //下载搜索结果一页的全部图片
    searchIllust: function (searchStr, page, callback) {
        let searchUrl = 'http://www.pixiv.net/search.php?word=' + encodeURI(searchStr) + '&order=date_d&p=' + page + (R18 ? '&r18=1' : '');
        let searchUrlParser = url.parse(searchUrl);
        chieRequest('html', new pixivOption(searchUrlParser.hostname, searchUrlParser.path, 'GET', 'http://www.pixiv.net/'), {}, function (decoded) {
            let imageWork = $('.column-search-result .image-item .work', decoded.toString());


            if (imageWork.length !== 0) {
                let imageIdArray = [];
                Array.prototype.forEach.call(imageWork, function (a) {
                    imageIdArray.push(a.attribs.href.match(/\d*$/)[0])
                });
                let c = 0;
                imageIdArray.forEach(function (a) {
                    chiePixiv.illustIdToOriginal(a, function (b) {
                        console.log(b);
                        if (++c >= imageIdArray.length) {
                            callback('One page done')
                        }
                    });
                })
            }
            else {
                callback('么找到')
            }
        });
    },
    //下载某id作者一页中所有图片
    authorIdIllust: function (id, page, callback) {
        let idUrl = 'http://www.pixiv.net/member_illust.php?type=illust&id=' + id + '&p=' + page;
        let idUrlParser = url.parse(idUrl);
        chieRequest('html', new pixivOption(idUrlParser.hostname, idUrlParser.path, 'GET', 'http://www.pixiv.net/'), {}, function (decoded) {
            let imageWork = $('#wrapper ._image-items .image-item .work', decoded.toString());
            if (imageWork.length !== 0) {
                let imageIdArray = [];
                Array.prototype.forEach.call(imageWork, function (a) {
                    imageIdArray.push(a.attribs.href.match(/\d*$/)[0])
                });
                let c = 0;
                imageIdArray.forEach(function (a) {
                    chiePixiv.illustIdToOriginal(a, function (b) {
                        console.log(b);
                        if (++c >= imageIdArray.length) {
                            callback('One page done')
                        }
                    });
                })
            }
            else {
                callback('么找到')
            }
        });
    },
    //查找文字搜索结果页数
    searchPageCount: function (searchStr, callback, page) {
        page = page || 1;
        let searchUrl = 'http://www.pixiv.net/search.php?word=' + encodeURI(searchStr) + '&order=date_d&p=' + page + (R18 ? '&r18=1' : '');
        let searchUrlParser = url.parse(searchUrl);
        chieRequest('html', new pixivOption(searchUrlParser.hostname, searchUrlParser.path, 'GET', 'http://www.pixiv.net/'), {}, function (decoded) {
            let current = $('#wrapper .column-order-menu .pager-container ul .current', decoded.toString());
            //  ul
            if (current.length !== 0) {
                let pager = $('#wrapper .column-order-menu .pager-container', decoded.toString());
                if ($('.next a', pager).length !== 0) {
                    let pageList = $('ul li a', pager);
                    let maxPage = 0;
                    Array.prototype.forEach.call(pageList, function (a) {
                        let pageItem = parseInt(a.children[0].data)
                        if (pageItem > maxPage) maxPage = pageItem;
                    });
                    chiePixiv.searchPageCount(searchStr, callback, maxPage);
                } else {
                    callback(page);
                }
            } else if ($('#wrapper .column-search-result .image-item', decoded.toString()).length !== 0) {
                callback(1);
            } else {
                callback(0)
            }
        });
    },
    searchAllIllust(searchStr, callback){
        let currentCount = 0;
        chiePixiv.searchPageCount(searchStr, function (pageCount) {
            console.log(pageCount);
            for (let i = 1; i <= pageCount; i++) {
                chiePixiv.searchIllust(searchStr, i, function (a) {
                    console.log(a);
                    if (++currentCount >= pageCount) {
                        callback('全部下载完毕');
                    }
                });
            }
        });
    }
};

module.exports = chiePixiv;