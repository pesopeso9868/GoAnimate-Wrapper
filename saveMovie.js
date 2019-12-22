const loadPost = require('./loadPostBody');
const caché = require('./movieCaché');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/saveMovie/') return;
	loadPost(req, res).then(data => {
		var id = data.movieId || data.presaveId;
		var body = Buffer.from(data.body_zip, 'base64');
		caché.save(body, id).then(() => res.end('0' + id));
	});
	return true;
}