/**
 * Created by chie on 2016/5/8.
 */

const chiePixiv = require('./chiePixiv');
const chieRequest = require('./chiePromiseRequest.js');
const pixivOption = require('./pixivOption.js');

let pixivAPI = {

    //下载搜索结果一页的全部图片
    searchIllust: function (searchStr, page) {
        return new Promise(function (resolve, reject) {
            let searchUrl = 'http://www.pixiv.net/search.php?word=' + encodeURI(searchStr) + '&order=date_d&p=' + page + (config.R18 ? '&r18=1' : '');
            let searchUrlParser = url.parse(searchUrl);
            chieRequest('html', new pixivOption(searchUrlParser.hostname, searchUrlParser.path, 'GET', 'http://www.pixiv.net/'), {}).then(function (decoded) {
                let imageWork = $('.column-search-result .image-item .work', decoded.toString());

                illustIdWordArraySearch(imageWork, page, resolve);

            }, function (b) {
                resolve('error:搜索页解析失败' + b)
            }).catch(function (a) {
                throw a;
            })
        })
    },

    //下载某id作者一页中所有图片
    authorIdIllust: function (id, page) {
        return new Promise(function (resolve, reject) {
            let idUrl = 'http://www.pixiv.net/member_illust.php?id=' + id + '&type=all&p=' + page;
            let idUrlParser = url.parse(idUrl);

            chieRequest('html', new pixivOption(idUrlParser.hostname, idUrlParser.path, 'GET', 'http://www.pixiv.net/'), {}).then(function (decoded) {
                let imageWork = $('#wrapper ._image-items .image-item .work', decoded.toString());

                illustIdWordArraySearch(imageWork, page, resolve);

            }, function (b) {
                resolve('error:搜索页解析失败' + b)
            }).catch(function (a) {
                throw a;
            })
        })
    },

    //查找文字搜索结果页数
    searchPageCount: function (searchStr, page) {
        return new Promise(function (resolve, reject) {
            page = page || 1;
            let searchUrl = 'http://www.pixiv.net/search.php?word=' + encodeURI(searchStr) + '&order=date_d&p=' + page + (config.R18 ? '&r18=1' : '');
            let searchUrlParser = url.parse(searchUrl);
            chieRequest('html', new pixivOption(searchUrlParser.hostname, searchUrlParser.path, 'GET', 'http://www.pixiv.net/'), {}).then(function (decoded) {
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
                        //递归找到最后一页
                        pixivAPI.searchPageCount(searchStr, maxPage).then(function (a) {
                            resolve(a);
                        }, function (b) {
                            reject(b)
                        })
                    } else {
                        resolve(page);
                    }
                } else if ($('#wrapper .column-search-result .image-item', decoded.toString()).length !== 0) {
                    resolve(1);
                } else {
                    resolve(0)
                }
            }, function (a) {
                reject('search页数解析失败' + a);
            });
        })
    },

    //和上一个差不多，暂时放着
    authorIdPageCount: function (id, page) {
        return new Promise(function (resolve, reject) {
            page = page || 1;
            let searchUrl = 'http://www.pixiv.net/member_illust.php?id=' + id + '&type=all&p=' + page;
            let searchUrlParser = url.parse(searchUrl);
            chieRequest('html', new pixivOption(searchUrlParser.hostname, searchUrlParser.path, 'GET', 'http://www.pixiv.net/'), {}).then(function (decoded) {
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
                        pixivAPI.authorIdPageCount(id, maxPage).then(function (a) {
                            resolve(a)
                        }, function (b) {
                            reject(b)
                        });
                    } else {
                        resolve(page);
                    }
                } else if ($('#wrapper .column-search-result .image-item', decoded.toString()).length !== 0) {
                    resolve(1);
                } else {
                    resolve(0)
                }
            }, function (a) {
                reject('author页数解析失败' + a);
            })
        })
    },
    downloadAllIllust(a){
        return new Promise(function (resolve, reject) {
            (typeof (a)==='string'?pixivAPI.searchPageCount(a):pixivAPI.authorIdPageCount(a)).then(function(count){
                console.log(count + '页');
                let pageArray = [];
                for (let i = 0; i < count; i++) pageArray[i] = i + 1;
                return Promise.all(pageArray.map(function (i) {
                    return typeof(a)==='string'?pixivAPI.searchIllust(a, i):pixivAPI.authorIdIllust(a,i);
                })).then(function(a){
                    let successCount = 0, errorCount = 0, allCount = 0;
                    let errorlog = ''
                    a.forEach(function (b) {
                        b.forEach(function (c) {
                            if (c.indexOf('写完') !== -1 || c.indexOf('全部完成') !== -1) {
                                successCount++;
                            } else if (c.indexOf('error') !== -1) {
                                errorCount++
                                errorlog += (c + ' ')
                            }
                            allCount++;
                        })
                    })
                    resolve('成功数量:' + successCount + ' 失败数量:' + errorCount + ' 过滤数量:' + (allCount - successCount - errorCount) + (errorlog === '' ? '   ' : '   ' + errorlog))
                })
            },function(b){
                resolve(b)
            })
        });
    },
    //下载所有搜索结果！！！
    searchAllIllust(searchStr){
        return new Promise(function (resolve, reject) {
            pixivAPI.searchPageCount(searchStr).then(function (count) {

                console.log(count + '页');
                let pageArray = [];
                for (let i = 0; i < count; i++) pageArray[i] = i + 1;
                return Promise.all(pageArray.map(function (i) {
                    return pixivAPI.searchIllust(searchStr, i);
                })).then(function (a) {
                    let successCount = 0, errorCount = 0, allCount = 0;
                    let errorlog = ''
                    a.forEach(function (b) {
                        b.forEach(function (c) {
                            if (c.indexOf('写完') !== -1 || c.indexOf('全部完成') !== -1) {
                                successCount++;
                            } else if (c.indexOf('error') !== -1) {
                                errorCount++
                                errorlog += (c + ' ')
                            }
                            allCount++;
                        })
                    })
                    resolve('成功数量:' + successCount + ' 失败数量:' + errorCount + ' 过滤数量:' + (allCount - successCount - errorCount) + (errorlog === '' ? '   ' : '   ' + errorlog))
                });

            }, function (b) {
                resolve(b)
            })
        })
    },
    //一个封装
    illustIdToOriginal: function (illustId) {
        return new Promise(function (resolve, reject) {
            chiePixiv.illustIdToOriginal(illustId).then(function (a) {
                resolve(a)
            }, function (b) {
                reject(b)
            }).catch(function (err) {
                throw('CHIEERROR:' + err);
            });
        })
    }
};

let illustIdWordArraySearch = function (imageWork, page, resolve) {
    if (imageWork.length !== 0) {
        let imageIdArray = [];
        Array.prototype.forEach.call(imageWork, function (a) {
            imageIdArray.push(a.attribs.href.match(/\d*$/)[0])
        });
        return Promise.all(imageIdArray.map(function (i) {
            return chiePixiv.illustIdToOriginal(i);
        })).then(function (a) {
            console.log(a)
            resolve(a)
        }, function (b) {              //未知错误
            throw(b)
        });
    }
    else {
        resolve(page + 'error:此页么找到图片')
    }
}

module.exports = pixivAPI;