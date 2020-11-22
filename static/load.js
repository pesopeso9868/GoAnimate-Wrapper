const pjson = require("../package.json");
const stuff = require("./info");
const http = require("http");
const fs = require("fs");
const disallowed = ["/asset","/character","/data","/misc","/movie","/node_modules","/request","/starter","/static","/thelooks","/theme","/tts","/.git","/.vscode"]
/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	var methodLinks = stuff[req.method];
	for (let linkIndex in methodLinks) {
		var regex = new RegExp(linkIndex);
		if (regex.test(url.path)) {
			var t = methodLinks[linkIndex];
			var link = t.regexLink ? url.path.replace(regex, t.regexLink) : t.link || url.path;
			var headers = t.headers;
			var path = `./${link}`;

			try {
				for (var headerName in headers || {}) {
					res.setHeader(headerName, headers[headerName]);
				}
				res.statusCode = t.statusCode || 200;
				if (t.content !== undefined) {
					res.end(t.content);
					return true;
				} else if (t.contentReplace) {
					content = fs.readFileSync(path, "utf8");
					content = content.replace(/VERSIÖN/g, pjson.versionStr);
					res.end(content);
					return true;
				} else {
					res.end(fs.readFileSync(path))
					return true;
				}
			} catch (e) {
				res.statusCode = t.statusCode || 404;
				res.end();
				return false;
			}
			return true;
		}
	}
	// When all else fails...
	try{
		//However if it's one of our source js files give 403. You can't do that
		const file = fs.readFileSync(`.${url.path}`);
		if (!disallowed.some((i)=>url.path.startsWith(i))) {
			if(file && (/^(?!(\/).*\1).*/g.test(url.path))){
				throw new Error("Forbidden")
			}
			res.end(file);
			return true;
		}
		else{
			throw new Error("Forbidden")
		}
	}
	catch(err){
		console.log(err)
		console.log(`${url.path} Not Found`)
		res.statusCode = 404;
		res.end();
		return false;
	}
	return false;
};
