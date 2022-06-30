const https = require('https');
const { userConfig, API } = require('./appConfig.js');
const log4js = require('log4js');
const { userConfig, API } = require('./appConfig.js');

log4js.configure({
    appenders: { cheese: { type: "file", filename: "cheese.log" } },
    categories: { default: { appenders: ["cheese"], level: "error" } }
});
var logger = log4js.getLogger();
logger.level = "INFO";

// 格式化返回的参数 对json格式的数据进行格式化
function formatResData(data, headers) {
    let type = headers['content-type'];
    if (!type || type && type.indexOf('application/json') !== -1) {
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {

            }
        }
    }
    return data;
}
// 封装POST请求
function post(url, data, headers = {}) {
    return new Promise(resolve => {
        const options = {
            method: 'POST',
            headers: headers
        };
        const req = https.request(url, options, res => {
            let had = false;
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                had = true;
                // 当接口返回的是json格式数据时可以使用JSON.parse
                res.data = formatResData(chunk, res.headers);
                resolve(res);
            });
            // 监听接口请求完成, 除非error，最终都会执行end;
            res.on('end', () => {
                if (had) return;
                resolve(res);
            });
        });
        req.on('error', e => {
            reject(e);
        });
        // 写入请求的数据
        data && req.write(data);
        req.end();
    }).catch(e => {
        console.error('Request error: ' + url + ', Method:' + 'GET' + ',Error message:', e);
        throw new Error(e ? e : 'Request error');
    })
}
let headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cookie': userConfig.cookie
}
post(API.checkin, '', headers).then(res => {
    // res.statusCode为接口返回的状态码， res.data为接口返回的数据
    console.log(res.statusCode, res.data);
}).catch(err => {
    logger.info(res.data);
})