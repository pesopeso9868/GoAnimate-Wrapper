const loadPost = require("../misc/post_body");
const movie = require("./main");
const http = require("http");

/**
 * Movie save handler
 *
 * @param      {IncomingMessage}     req     The request
 * @param      {ServerResponse}      res     The response
 * @param      {UrlWithParsedQuery}  url     The url
 * @return     {boolean}             Whether or not the function succeeded
 */
module.exports = function (req, res, url) {
	if (req.method != "POST" || url.path != "/goapi/saveMovie/") return;
	loadPost(req, res).then(([data, mId]) => {
		const trigAutosave = data.is_triggered_by_autosave;
		if (trigAutosave && (!data.movieId || data.noAutosave)) return res.end("0");

		var body = Buffer.from(data.body_zip, "base64");
		var thumb = data.thumbnail_large && Buffer.from(data.thumbnail_large, "base64");
		movie.save(body, thumb, mId, data.presaveId).then((nId) => res.end("0" + nId));
	});
	return true;
};
