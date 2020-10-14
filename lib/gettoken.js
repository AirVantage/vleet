const _ = require('lodash');
const http = require('http');
const https = require('https');
const querystring = require('querystring');
const url = require('url');

module.exports = (options) => {
    const isLocal = options.authFrontServer.includes('localhost:');
    const PREFIX = isLocal ? 'http://' : 'https://';
    const isWellFormed = _.some(['http://', 'https://'], (prefix) => options.authFrontServer.startsWith(prefix));
    const authFrontServer = isWellFormed ? options.authFrontServer : `${PREFIX}${options.authFrontServer}`;

    const AUTH_URL = url.resolve(authFrontServer, 'api/oauth/token');
    const AUTH_QUERY = querystring.stringify(Object.assign({ grant_type: 'password' }, options.credentials));
    const HTTP_LIB = AUTH_URL.startsWith('https') ? https : http;

    return new Promise((resolve) => {
        HTTP_LIB.get(`${AUTH_URL}?${AUTH_QUERY}`, (response) => {
            let jsonBuffer = Buffer.from('');
            response.on('data', (buffer) => (jsonBuffer = Buffer.concat([jsonBuffer, buffer])));

            response.on('end', () => {
                const json = JSON.parse(jsonBuffer);
                resolve(json.access_token);
            });
        }).on('error', () => resolve());
    });
};
