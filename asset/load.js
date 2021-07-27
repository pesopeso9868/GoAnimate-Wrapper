const loadPost = require("../misc/post_body");
const asset = require("./main");
const http = require("http");
/**
 * Load an asset.
 *
 * @param      {IncomingMessage}     req     HTTP request object
 * @param      {ServerResponse}      res     HTTP response object
 * @param      {UrlWithParsedQuery}  url     HTTP url object
 * @return     {bool}                Whether or not the function was successful
 */
module.exports = function (req, res, url) {
	switch (req.method) {
		case "GET": {
			const match = req.url.match(/\/assets\/([^/]+)\/([^.]+)(?:\.xml)?$/);
			if (!match) return;

			const mId = match[1];
			const aId = match[2];
			const b = asset.load(mId, aId);
			if (b) {
				res.statusCode = 200;
				res.end(b);
			} else {
				res.statusCode = 404;
				res.end(e);
			}
			return true;
		}

		case "POST": {
			switch (url.pathname) {
				case "/goapi/getAsset/":
				case "/goapi/getAssetEx/": {
					loadPost(req, res).then(([data, mId]) => {
						const aId = data.assetId || data.enc_asset_id;

						const b = asset.load(mId, aId);
						if (b) {
							res.setHeader("Content-Length", b.length);
							res.setHeader("Content-Type", "audio/mp3");
							res.end(b);
						} else {
							res.statusCode = 404;
							res.end();
						}
					});
					return true;
				}
			}
		}
	}
	return false;
};
