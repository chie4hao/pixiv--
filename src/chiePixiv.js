/**
 * Created by chie on 2016/5/6.
 */

const pixivOption = require('./pixivOption.js');
const chieRequest = require('./chiePromiseRequest.js');

let chiePixiv = {
    //通过illust_id下载原图,分支有点多,并且多次引用外外层作用域存储对象,很多promise就不return了
    illustIdToOriginal: function (illustId) {
        return new Promise(function (resolve, reject) {
            let mediumUrl = 'http://www.pixiv.net/member_illust.php?mode=medium&illust_id=' + illustId;
            let urlm = url.parse(mediumUrl);
            chieRequest('html', new pixivOption(urlm.hostname, urlm.path, 'GET', 'http://www.pixiv.net/'), {}).then(function (decoded) {
                let wrapper = $('#wrapper', decoded.toString());
                let worksDisplay = $('.works_display', wrapper);

                let tagsStr = '';
                let tagsArray = $('.work-tags dl dd ul li .text', wrapper)

                Array.prototype.forEach.call(tagsArray, function (a) {
                    tagsStr += (' ' + a.children[0].data);
                });

                if (config.tagExistsFilter.every(function (a) {
                        return tagsStr.indexOf(a) !== -1
                    }) && config.tagNotExistsFilter.every(function (b) {
                        return tagsStr.indexOf(b) === -1
                    })) {
                    if ($('img', worksDisplay).length !== 0) {
                        if ($('.player', worksDisplay).length !== 0) {
                            resolve(illustId + ' '+'a player');
                        }
                        else if ($('a', worksDisplay).length !== 0) {
                            //Multi 漫画模式
                            if (config.mangaModel) {
                                let mangaUrl = 'http://www.pixiv.net/member_illust.php?mode=manga&illust_id=' + illustId;
                                let mangaUrlParser = url.parse(mangaUrl);
                                //此段代码有mediumUrl依赖，不能return
                                chieRequest('html', new pixivOption(mangaUrlParser.hostname, mangaUrlParser.path, 'GET', mediumUrl), {}).then(function (a) {
                                    //得到漫画数量开始搜索原画地址
                                    let mangaArray = [];
                                    let count = parseInt($('.page-menu .total', a.toString()).text());
                                    for (let i = 0; i < count; i++) {
                                        mangaArray.push(i)
                                    }
                                    return Promise.all(mangaArray.map(function (i) {

                                        let mangaBigUrl = 'http://www.pixiv.net/member_illust.php?mode=manga_big&illust_id=' + illustId + '&page=' + i
                                        let mangaBigUrlParser = url.parse(mangaBigUrl);
                                        //同上
                                        return chieRequest('html', new pixivOption(mangaBigUrlParser.hostname, mangaBigUrlParser.path, 'GET', mangaUrl), {}).then(function (decoded2) {
                                            let imgsrc = $('img', decoded2.toString());
                                            if (imgsrc.length !== 0) {
                                                let imageBigUrl = url.parse(imgsrc.attr('src'));
                                                let imageBigType = imageBigUrl.path.match(/\.\w*$/)[0];
                                                let name = $('.title', wrapper)[0].children[0].data;
                                                return chieRequest('originalOne', new pixivOption(imageBigUrl.hostname, imageBigUrl.path, 'GET', mangaBigUrl), {name: illustId + '_' + i + '_' + name + imageBigType,})
                                            } else {
                                                return Promise.resolve(illustId +' '+ 'error:' + 'manga其中有图没找到')
                                            }
                                        }, function (b) {
                                            return Promise.resolve(illustId + ' '+'error:' + '第三次htmlGet' + b)
                                        });
                                    })).then(function (a) {
                                        let errPage = ''
                                        let errorflag = false;
                                        a.forEach(function (b, i) {
                                            if (b !== '写完') {
                                                errorflag = true;
                                                errPage += (' ' + i);
                                            }
                                        })
                                        if (errorflag) {               //没有全部成功
                                            resolve(illustId +' '+ 'error:' + 'errorPage:' + errPage);
                                        } else {                       //全部成功
                                            resolve(illustId +' '+ '全部完成' + 'count:' + mangaArray.length)
                                        }
                                    }, (function (b) {                //错误
                                        reject(b)
                                    }));
                                }, function (b) {
                                    resolve(illustId + ' '+'error:' + '第一次htmlGet' + b)
                                });
                            } else {
                                resolve(illustId + ' '+'请开启manga模式 ' + '已过滤')
                            }
                        } else {
                            //单图 通过_illust_modal img找到原图真实地址，看了pixiv源代码才找到
                            let imageUrl = url.parse($('._illust_modal img', wrapper).attr('data-src'));
                            let imageType = imageUrl.path.match(/\.\w*$/)[0];
                            let name = $('.title', wrapper)[0].children[0].data;
                            if (!fs.existsSync('./resources/' + (illustId + '_' + name + imageType).replace(/\\|\/|\?|\*|:|"|<|>/g, ''))) {
                                chieRequest('originalOne', new pixivOption(imageUrl.hostname, imageUrl.path, 'GET', mediumUrl), {name: illustId + '_' + name + imageType}).then(function (a) {
                                    resolve(illustId.toString() +' '+ a);
                                }, function (c) {
                                    resolve(illustId +' '+ 'error:' + c);
                                });
                            }
                            else {
                                resolve(illustId +' '+ '已存在');
                            }
                        }
                    } else {
                        resolve(illustId +' '+ 'error:' + '图片没找到');
                    }
                }
                else {
                    resolve(illustId +' '+ '已过滤')
                }
            }, function (b) {
                resolve(illustId +' '+ 'error:' + '第一次htmlGet' + b)
            }).catch(function (err) {
                throw 'illustIdToOriginal未知' + err;
            });
        });
    },
};

module.exports = chiePixiv;