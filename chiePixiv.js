/**
 * Created by chie on 2016/5/6.
 */

const pixivOption = require('./pixivOption.js');
const chieRequest = require('./chieRequest.js');

let chiePixiv = {
    //通过illust_id下载原图,有点长
    illustIdToOriginal: function (illustId, callback) {
        let mediumUrl = 'http://www.pixiv.net/member_illust.php?mode=medium&illust_id=' + illustId;
        let urlm = url.parse(mediumUrl);
        chieRequest('html', new pixivOption(urlm.hostname, urlm.path, 'GET', 'http://www.pixiv.net/'), {}, function (decoded) {
            let wrapper = $('#wrapper', decoded.toString());
            let worksDisplay = $('.works_display', wrapper);

            let tagsStr = '';
            let tagsArray = $('.work-tags dl dd ul li .text', wrapper)
            try {
                Array.prototype.forEach.call(tagsArray, function (a) {
                    tagsStr += (' ' + a.children[0].data)
                });
            } catch (e) {
                callback(e);
                return;
            }

            if (config.tagExistsFilter.every(function (a) {
                    return tagsStr.indexOf(a) !== -1
                }) && config.tagNotExistsFilter.every(function (b) {
                    return tagsStr.indexOf(b) === -1
                })) {
                if ($('img', worksDisplay).length !== 0) {
                    if ($('.player', worksDisplay).length !== 0) {
                        callback('a player');
                    }
                    else if ($('a', worksDisplay).length !== 0) {
                        //Multi 漫画模式
                        if (config.mangaModel) {
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
                                            let name = $('.title', wrapper)[0].children[0].data;

                                            chieRequest('originalOne', new pixivOption(imageBigUrl.hostname, imageBigUrl.path, 'GET', mangaBigUrl), {
                                                name: illustId + '_' + i + '_' + name + imageBigType,
                                            }, function (a) {
                                                a.indexOf('需重传') !== -1 ? errorcount++ : j++;
                                                if (errorcount + j === count) {
                                                    if (errorcount === 0)
                                                        callback(illustId + '全部完成 errorcount:' + errorcount + ' successcount:' + j + ' count:' + count);
                                                    else chiePixiv.illustIdToOriginal(illustId, function (asdf) {
                                                        callback(asdf)
                                                    });
                                                }
                                            })
                                        } else {
                                            if (++errorcount + j === count) {
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
                        if (!fs.existsSync('./resources/' + (illustId + '_' + name + imageType).replace(/\\|\/|\?|\*|:|"|<|>/g, ''))) {
                            chieRequest('originalOne', new pixivOption(imageUrl.hostname, imageUrl.path, 'GET', mediumUrl), {name: illustId + '_' + name + imageType}, function (a) {
                                if (a.indexOf('重传') !== -1) {
                                    if (fs.existsSync('./resources/' + (illustId + '_' + name + imageType).replace(/\\|\/|\?|\*|:|"|<|>/g, '')))
                                        fs.unlinkSync('./resources/' + (illustId + '_' + name + imageType).replace(/\\|\/|\?|\*|:|"|<|>/g, ''));
                                    console.log(illustId + a + ' ...重传中');
                                    chiePixiv.illustIdToOriginal(illustId, function (asdf) {
                                        callback(asdf)
                                    })
                                } else {
                                    callback(illustId.toString() + a);
                                }
                            });
                        }
                        else {
                            callback(illustId + '已存在');
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
    }
};

module.exports = chiePixiv;