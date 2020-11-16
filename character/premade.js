const loadPost = require('../request/post_body');
const folder = process.env.PREMADE_FOLDER;
const fs = require('fs');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/getCCPreMadeCharacters') return;
	loadPost(req, res).then(data => {
		res.setHeader('Content-Type', 'text/html; charset=UTF-8');
		const p = `${folder}/${data.themeId}.xml`;
		var readStream = fs.createReadStream(p)
		// Who is the debil that did not handle stream error event?
		readStream.on("open", function(){
			readStream.pipe(res)
		});
		readStream.on("error", function(err){
			if(err.code === "ENOENT"){
				console.log(`premade xml ${data.themeId} not found`)
			} else{
				console.log("FUCK")
			}
		});
	});
	return true;
}