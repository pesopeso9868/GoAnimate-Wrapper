const formidable = require("formidable");
const fUtil = require("../misc/file");
const parse = require("./parse");
const http = require("http");
const fs = require("fs");

/**
 * { function_description }
 *
 * @param      {http.IncomingMessage}              req     The request
 * @param      {http.ServerResponse}               res     The resource
 * @param      {import("url").UrlWithParsedQuery}  url     The url
 * @return     {boolean}                           { description_of_the_return_value }
 */
module.exports = function (req, res, url) {
	if (req.method != "POST" || url.path != "/upload_movie") return;
	new formidable.IncomingForm().parse(req, (e, f, files) => {
		if (!files.import) return;
		var path = files.import.path;
		var buffer = fs.readFileSync(path);
		var numId = fUtil.getNextFileId("movie-", ".xml");
		parse.unpackXml(buffer, `m-${numId}`);
		fs.unlinkSync(path);

		res.statusCode = 302;
		var url = `/go_full?movieId=m-${numId}`;
		res.setHeader("Location", url);
		res.end();
	});
	return true;
};
