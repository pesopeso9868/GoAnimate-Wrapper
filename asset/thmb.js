const thumbUrl = process.env.THUMB_BASE_URL;
const get = require("../misc/get");
const http = require("http");

/**
 * Get thumbnail
 *
 * @param      {http.IncomingMessage}              req     The request
 * @param      {http.ServerResponse}               res     The response
 * @param      {import("url").UrlWithParsedQuery}  url     The url
 * @return     {boolean}                           Whether or not the function failed
 */
module.exports = function (req, res, url) {
	var path = url.pathname;
	if (req.method != "GET" || !path.startsWith("/stock_thumbs")) return false;
	get(thumbUrl + path.substr(path.lastIndexOf("/"))).then((v) => res.end(v));
	return true;
};
