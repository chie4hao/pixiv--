/**
 * Created by chie on 2016/5/5.
 */

require('./global');
const pixiv = require('./pixivAPI');

global.config = {
    //是否下载多图的illustId,默认true基本不需要改
    mangaModel: true,
    //筛选掉的tags,基本都是些女性向的,应该没女生用吧...
    tagNotExistsFilter: ['BL', '腐', '漫画', '講座', '刀剣乱', '松', '黒子', '弱虫ペダル', '世界一初恋', '進撃の巨人', 'ハイキュー', '銀魂', 'アザゼルさん'],
    //选择的tags,最好还是把想要的tags直接放到搜索文本中
    tagExistsFilter: [],
    
    //是否只下载R18？！！注意身体...
    R18: false
};

pixiv.illustIdToOriginal('21976984', function (a) {
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
pixiv.searchAllIllust('風景 10000users入り',function(a){
    console.log(a);
})*/

//
//按热度搜索，需要会员，不过这个热度搜索真没卵用 http://www.pixiv.net/search.php?word=%E9%9C%8A%E5%A4%A2&order=popular_d&p=2
//搜作者id插画 http://www.pixiv.net/member_illust.php?type=illust&id=18656&p=1
//搜作者id漫画 http://www.pixiv.net/member_illust.php?type=manga&id=18656&p=1