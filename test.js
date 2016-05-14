/**
 * Created by chie on 2016/5/5.
 */

require('./src/global');

global.config = {
    //此项为必需，请根据自己浏览器Cookie中的PHPSESSID更改
    PHPSESSID: '8318723_06a7561cbe9fcc2ee5799e4960f71476',
    //是否下载多图的illustId,默认true基本不需要改
    mangaModel: true,
    //筛选掉的tags,基本都是些女性向的,应该没女生用吧...
    tagNotExistsFilter: ['BL', '腐', '漫画', '講座', '刀剣乱', '松', '黒子', '弱虫ペダル', '世界一初恋', '進撃の巨人', 'ハイキュー', '銀魂', 'アザゼルさん'],
    //选择的tags,最好还是把想要的tags直接放到搜索文本中
    tagExistsFilter: [],
    //最大并行原画请求数量和Html请求数量,网速好可以适当调高一点,太高可能会被封IP？
    OriginalGetCount: 8,
    HtmlGetCount: 3,
    //请求超时时间(ms)
    htmlGetTimeout: 60000,
    originalOneGetTimeOut: 5000,
    //最大重传次数(超时或者网络错误时重传)
    htmlGetMaxCount:3,
    originalOneGetMaxCount:3,
    //是否只下载R18？！！
    R18: false
};

const pixiv = require('./src/pixivAPI');
const chiePixiv = require('./src/chiePixiv');
//根据illustId下载原图

//多图47286667
//单图37270424

pixiv.illustIdToOriginal('47286667', function (result) {
    console.log(result)
});


/*
 var Queue = function (count) {
 this.queue = [];
 this.runMax = count;
 this.currentCount = 0;
 };

 Queue.prototype.push = function (a) {
 if (this.currentCount < this.runMax) {
 a();
 this.currentCount++;
 }else if(this.currentCount=this.runMax){
 this.currentEvent=a;
 }
 };

 var originalQueue = new Queue(2);
 */
/*
 const originalQueue = async.queue(function (task, callback) {
 task(callback);
 }, 3);

 function asdf() {
 return new Promise(function (resolve, reject) {
 console.log(1)
 setTimeout(resolve, 400);
 })
 }

 originalQueue.push(function (cb) {
 asdf().then(function () {
 cb()
 })
 }, function () {

 });
 originalQueue.push(function (cb) {
 asdf().then(function () {
 cb()
 })
 }, function () {

 });
 originalQueue.push(function (cb) {
 asdf().then(function () {
 cb()
 })
 }, function () {

 });
 originalQueue.push(function (cb) {
 asdf().then(function () {
 cb()
 })
 }, function () {

 });*/
/*
 asdf().then(function(){
 return asdf()
 }).then(function(){
 return asdf()
 }).then(function(){

 })*/
//下载"博麗霊夢 10000users入り"搜索结果第一页的全部图片
/*
 pixiv.searchIllust('博麗霊夢 10000users入り', 1, function (a) {
 console.log(a);
 });
 */

//下载作者id为915946第一页的全部图片
/*
 pixiv.authorIdIllust(915945, 1, function (a) {
 console.log(a);
 });
 */

//下载搜索结果的全部图片
/*
 pixiv.searchAllIllust('東方Project5000users入り', function (a) {
 console.log(a);
 });
 */

//下载某作者的全部图片
/*
 pixiv.authorIdAllIllust(40912,function(a){
 console.log(a);
 })
 */
