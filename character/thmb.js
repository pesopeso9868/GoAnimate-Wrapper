const char = require("./main");
const http = require("http");

/**
 * { function_description }
 *
 * @param      {http.IncomingMessage}              req     The request
 * @param      {http.ServerResponse}               res     The resource
 * @param      {import("url").UrlWithParsedQuery}  url     The url
 * @return     {boolean}                           { description_of_the_return_value }
 */
module.exports = function (req, res, url) {
	var path = url.pathname;
	if (req.method != "GET" || !path.startsWith("/char_thumbs")) return;
	var beg = path.lastIndexOf("/") + 1;
	var end = path.lastIndexOf(".");
	var ext = path.substr(end + 1).toLowerCase();
	if (ext != "png") return;

	char
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
