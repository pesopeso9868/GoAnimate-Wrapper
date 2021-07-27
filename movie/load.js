const movie = require("./main");
const base = Buffer.alloc(1, 0);
const http = require("http");

/**
 * Movie load handler
 *
 * @param      {IncomingMessage}     req     The request
 * @param      {ServerResponse}      res     The response
 * @param      {UrlWithParsedQuery}  url     The url
 * @return     {boolean}             Whether or not the function was successful
 */
module.exports = function (req, res, url) {
	switch (req.method) {
		case "GET": {
			const match = req.url.match(/\/movies\/([^.]+)(?:\.(zip|xml))?$/);
			if (!match) return;

			var id = match[1];
			var ext = match[2];
			switch (ext) {
				case "zip":
					res.setHeader("Content-Type", "application/zip");
					movie.loadZip(id).then((v) => {
						if (v) {
							res.statusCode = 200;
							res.end(v);
						} else {
							res.statusCode = 404;
							res.end();
						}
					});
					break;
				default:
					res.setHeader("Content-Type", "text/xml");
					movie.loadXml(id).then((v) => {
						if (v) {
							res.statusCode = 200;
							res.end(v);
						} else {
							res.statusCode = 404;
							res.end();
						}
					});
					break;
			}
			return true;
		}

		case "POST": {
			if (!url.path.startsWith("/goapi/getMovie/")) return;
			res.setHeader("Content-Type", "application/zip");

			movie
				.loadZip(url.query.movieId)
				.then((b) => res.end(Buffer.concat([base, b])))
				.catch(() => res.end("1"));
			return true;
		}
		default:
			return;
	}
};
