# pixiv downloader

个人用基于nodejs的pixiv下载工具，可实现批量下载功能（可从搜索字符串、authorId或者热榜中），具有并行请求、超时重传和多重筛选等特性。程序安全高效。

## 运行环境

使用前需要安装（[nodejs](https://nodejs.org/en/)），并在项目目录下运行```npm install cheerio```（仅引入一个第三方库）

## API


下载符合指定搜索字符串的所有images:
```javascript
pixiv.searchAllIllust(searchStr,callback);
```
+ searchStr {String} 需要搜索的字符串，如‘10000users入り’（收藏数量大于10000的作品）
+ callback {Function} 回调函数，返回搜索结果。

-

下载指定authorId的所有作品:
```javascript
pixiv.authorIdAllIllust(authorId,callback);
```
+ authorId {Number} 指定的authorId，如‘27517’（这是藤原菊苣啊...）
+ callback {Function} 回调函数，返回结果。

-

其他API和相关配置详见项目根目录中的test.js文件中，有很详尽的解释。
