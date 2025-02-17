const qs = require("querystring");

/**
 * { function_description }
 *
 * @param      {http.IncomingMessage}  req     The request
 * @param      {http.ServerResponse}   res     The resource
 * @return     {Promise}               { description_of_the_return_value }
 */
module.exports = function (req, res) {
	return new Promise((resolve, rej) => {
		var data = "";
		req.on("data", (v) => {
			data += v;
			if (data.length > 1e10) {
				data = "";
				res.writeHead(413);
				res.end();
				req.connection.destroy();
				rej();
			}
		});

		req.on("end", () => {
			var dict = qs.parse(data);
			var mId = dict.movieId || dict.presaveId;
			resolve([dict, mId]);
		});
	});
};
