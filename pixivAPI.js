/**
 * Created by chie on 2016/5/8.
 */

const chiePixiv = require('./chiePixiv');

let pixivAPI = {

    //下载搜索结果一页的全部图片
    searchIllust: function (searchStr, page, callback) {
        let searchUrl = 'http://www.pixiv.net/search.php?word=' + encodeURI(searchStr) + '&order=date_d&p=' + page + (config.R18 ? '&r18=1' : '');
        let searchUrlParser = url.parse(searchUrl);
        chieRequest('html', new pixivOption(searchUrlParser.hostname, searchUrlParser.path, 'GET', 'http://www.pixiv.net/'), {}, function (decoded) {
            let imageWork = $('.column-search-result .image-item .work', decoded.toString());
            illustIdWordArraySearch(imageWork, function (a) {
                callback(a);
            })
        });
    },
    //下载某id作者一页中所有图片
    authorIdIllust: function (id, page, callback) {
        let idUrl = 'http://www.pixiv.net/member_illust.php?type=illust&id=' + id + '&p=' + page;
        let idUrlParser = url.parse(idUrl);
        chieRequest('html', new pixivOption(idUrlParser.hostname, idUrlParser.path, 'GET', 'http://www.pixiv.net/'), {}, function (decoded) {
            let imageWork = $('#wrapper ._image-items .image-item .work', decoded.toString());
            illustIdWordArraySearch(imageWork, function (a) {
                callback(a);
            })
        });
    },
    //查找文字搜索结果页数
    searchPageCount: function (searchStr, callback, page) {
        page = page || 1;
        let searchUrl = 'http://www.pixiv.net/search.php?word=' + encodeURI(searchStr) + '&order=date_d&p=' + page + (config.R18 ? '&r18=1' : '');
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
    //下载所有搜索结果！！！
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
    },
    illustIdToOriginal: function (illustId, callback) {
        chiePixiv.illustIdToOriginal(illustId, function (a) {
            callback(a);
        })
    }
}
let illustIdWordArraySearch = function (imageWork, callback) {
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
}
module.exports = pixivAPI;