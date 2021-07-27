const qs = require('querystring');

/**
 * POST handler
 * Manages payload size
 */
module.exports = function (req, res) {
	return new Promise((resolve, rej) => {
		var data = '';
		req.on('data', v => {
			data += v;
			if (data.length > 1e10) {
				data = '';
				res.writeHead(413);
				res.end();
				req.connection.destroy();
				rej();
			}
		});

		req.on('end', () => resolve(qs.parse(data)));
	});
}