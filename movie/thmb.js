const movie = require("./main");
const http = require("http");

/**
 * Movie thumbnail handler
 *
 * @param      {IncomingMessage}     req     The request
 * @param      {ServerResponse}      res     The response
 * @param      {UrlWithParsedQuery}  url     The url
 * @return     {boolean}             Whether or not the function succeeded
 */
module.exports = function (req, res, url) {
	var path = url.pathname;
	if (req.method != "GET" || !path.startsWith("/movie_thumbs")) return;
	var beg = path.lastIndexOf("/") + 1;
	var end = path.lastIndexOf(".");
	var ext = path.substr(end + 1).toLowerCase();
	if (ext != "png") return;

	movie
		.loadThumb(path.substr(beg, end - beg))
		.then((v) => {
			res.setHeader("Content-Type", "image/png");
			res.statusCode = 200;
			res.end(v);
		})
		.catch(() => {
			res.statusCode = 400;
			res.end();
		});
	return true;
};
