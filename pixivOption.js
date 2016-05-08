/**
 * Created by chie on 2016/5/5.
 */

function RequestOptions(hostname, path, method, referer) {
    //根据我自己浏览器伪造的headers,其实很多都用不上的
    let headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, sdch',
        'Accept-Language': 'zh-CN,zh;q=0.8',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Cookie': {
            'p_ab_id': 6,
            'login_ever': 'yes',
            'device_token': '16bfb2fa262d6a8a529918865677d188',
            'a_type': 0,
            'PHPSESSID': config.PHPSESSID,
            'module_orders_mypage': '%5B%7B%22name%22%3A%22everyone_new_illusts%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22spotlight%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22featured_tags%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22contests%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22following_new_illusts%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22mypixiv_new_illusts%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22booth_follow_items%22%2C%22visible%22%3Atrue%7D%5D'
        },
        'Host': 'www.pixiv.net',
        'Referer': 'http://www.pixiv.net/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36'
    }
    headers['Referer'] = referer;
    headers['Host'] = hostname;
    this.hostname = hostname;
    this.path = path;
    this.method = method;
    this.headers = new RequestHeaders(headers)
}

var RequestHeaders = function (b) {
    for (let option in b) {
        if (option !== 'Cookie') {
            this[option] = b[option];
        }
        else {
            let cookieString = ''
            for (let i in b['Cookie']) {
                cookieString += i + '=' + b['Cookie'][i] + '; ';
            }
            this.Cookie = cookieString;
        }
    }
};

module.exports = RequestOptions;