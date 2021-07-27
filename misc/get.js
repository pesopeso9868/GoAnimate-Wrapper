const https = require("https");
/**
 * { function_description }
 *
 * @param      {import("url").UrlWithParsedQuery}  url        The url
 * @param      {CredentialRequestOptions}          [options]  The options
 * @return     {Promise<Buffer>}                   { description_of_the_return_value }
 */
module.exports = function (url, options = {}) {
	var data = [];
	return new Promise((res, rej) => {
		https.get(url, options, (o) =>
			o
				.on("data", (v) => data.push(v))
				.on("end", () => res(Buffer.concat(data)))
				.on("error", rej)
		);
	});
};
