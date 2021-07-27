const https = require('https');
/**
 * HTTP GET
 *
 * @param      {<type>}           url           Request target
 * @param      {<type>}           [options={}]  https.get  options
 * @return     {Promise<Buffer>}  Promise. Rejected if error, Buffer if
 *                                succeeded
 */
module.exports = function (url, options = {}) {
	var data = [];
	return new Promise((res, rej) => {
		https.get(url, options, o => o
			.on('data', v => data.push(v))
			.on('end', () => res(Buffer.concat(data)))
			.on('error', rej));
	});
}