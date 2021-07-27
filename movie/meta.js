const movie = require("./main");
const http = require("http");

/**
 * Movie metadata handler
 *
 * @param      {IncomingMessage}     req     The request
 * @param      {ServerResponse}      res     The response
 * @param      {UrlWithParsedQuery}  url     The url
 * @return     {boolean}             Whether or not the function was successful
 */
module.exports = function (req, res, url) {
	if (req.method != "GET" || !url.pathname.startsWith("/meta")) return;
	movie
		.meta(url.path.substr(url.path.lastIndexOf("/") + 1))
		.then((v) => res.end(JSON.stringify(v)))
		.catch(() => {
			res.statusCode = 404;
			res.end();
		});
	return true;
};
