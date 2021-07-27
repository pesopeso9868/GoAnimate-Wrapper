const loadPost = require("../misc/post_body");
const header = process.env.XML_HEADER;
const fUtil = require("../misc/file");
const nodezip = require("node-zip");
const base = Buffer.alloc(1, 0);
const asset = require("./main");
const http = require("http");
const builder = require("xmlbuilder2");

/**
 * List user assets.
 *
 * @param      {Object}           data     An Object containing type and
 *                                         themeId.
 * @param      {bool}             makeZip  Create a .zip file rather than an
 *                                         .xml file
 * @return     {Promise<Buffer>}  The list stored in a Buffer.
 */
async function listAssets(data, makeZip) {
	var xmlString;
	var xml = builder.create({version:"1.0", encoding: "utf-8"}).ele("ugc", {"more":0})
	switch (data.type) {
		//HURRAAAAA XMLBUILDER2
		case "char": {
			const chars = await asset.chars(data.themeId);
			chars.map((v) => xml.ele("char", {id: v.id, name: v.name?v.name:"Untitled", cc_theme_id: v.theme, thumbnail_url: `http://127.0.0.1/char_thumbs/${v.id}.png`, copyable: "Y"})
					.ele("tags").up()
				.up())
			/*xmlString = `${header}<ugc more="0">${chars
				.map(
					(v) =>
						`<char id="${v.id}" name="${v.name?v.name:"Untitled"}" cc_theme_id="${v.theme}" thumbnail_url="http://localhost/char_thumbs/${v.id}.png" copyable="Y"><tags/></char>`
				)
				.join("")}</ugc>`;*/
			break;
		}
		case "bg": {
			var files = asset.list(data.movieId, "bg");
			files.map((v) => xml.ele("background", {subtype: 0, id: v.id, name: v.name, enable: "Y"}).up());
			/*xmlString = `${header}<ugc more="0">${files
				.map((v) => `<background subtype="0" id="${v.id}" name="${v.name}" enable="Y"/>`)
				.join("")}</ugc>`;*/
			break;
		}
		case "bgmusic": {
			var files = asset.list(data.movieId, "bgmusic");
			files.map((v) => xml.ele("sound", {subtype: "bgmusic", id: v.id, name: v.name, enable: "Y", duration: v.duration, downloadtype: "progressive", enc_asset_id: v.id, signature: v.signature}).up());
			/*xmlString = `${header}<ugc more="0">${files
				.map(
					(v) =>
						`<sound subtype="bgmusic" id="${v.id}" name="${v.name}" enable="Y" duration="${v.duration}" downloadtype="progressive" enc_asset_id="${v.id}" signature="${v.signature}"/>`
				)
				.join("")}</ugc>`;*/
			break;
		}
		case "soundeffect": {
			var files = asset.list(data.movieId, "soundeffect");
			files.map((v) => xml.ele("sound", {subtype: "soundeffect", id: v.id, name: v.name, enable: "Y", duration: v.duration, downloadtype: "progressive", enc_asset_id: v.id, signature: v.signature}).up());
			/*xmlString = `${header}<ugc more="0">${files
				.map(
					(v) =>
						`<sound subtype="soundeffect" id="${v.id}" name="${v.name}" enable="Y" duration="${v.duration}" downloadtype="progressive" enc_asset_id="${v.id}" signature="${v.signature}"/>`
				)
				.join("")}</ugc>`;*/
			break;
		}
		case "sound":
		case "voiceover": {
			var files = asset.list(data.movieId, "voiceover");
			files.map((v) => xml.ele("sound", {subtype: "voiceover", id: v.id, name: v.name, enable: "Y", duration: v.duration, downloadtype: "progressive", enc_asset_id: v.id, signature: v.signature}).up());
			/*xmlString = `${header}<ugc more="0">${files
				.map(
					(v) =>
						`<sound subtype="voiceover" id="${v.id}" name="${v.name}" enable="Y" duration="${v.duration}" downloadtype="progressive" enc_asset_id="${v.id}" signature="${v.signature}"/>`
				)
				.join("")}</ugc>`;*/
			break;
		}
		case "movie": {
			var files = asset.list(data.movieId, "movie");
			files.map((v) => 
				xml.ele("movie", {id: v.id, enc_asset_id: v.id, path: `/_SAVED/${v.id}`, numScene: 1, title: v.name, thumbnail_url:`/movie_thumbs/${v.id}.png`})
						.ele("tags").up()
					.up())
			/*xmlString = `${header}<ugc more="0">${files
				.map(
					(v) =>
						`<movie id="${v.id}" enc_asset_id="${v.id}" path="/_SAVED/${v.id}" numScene="1" title="${v.name}" thumbnail_url="/movie_thumbs/${v.id}.png"><tags></tags></movie>`
				)
				.join("")}</ugc>`;*/
			break;
		}
		case "prop":
		default: {
			var files = asset.list(data.movieId, "prop");
			files.map((v) => 
				xml.ele("prop", {subtype: 0, id: v.id, name: v.name, enable: "Y", holdable: 0, headable: 0, placeable: 1, facing: "left", width: 0, height: 0, duration: 0, enc_asset_id: v.id}).up());
			/*xmlString = `${header}<ugc more="0">${files
				.map(
					(v) =>
						`<prop subtype="0" id="${v.id}" name="${v.name}" enable="Y" holdable="0" headable="0" placeable="1" facing="left" width="0" height="0" duration="0" enc_asset_id="${v.id}"/>`
				)
				.join("")}</ugc>`;*/
			break;
		}
	}
	xmlString = xml.up().end({prettyPrint: false});

	if (makeZip) {
		const zip = nodezip.create();
		const files = asset.listAll(data.movieId);
		fUtil.addToZip(zip, "desc.xml", Buffer.from(xmlString));

		files.forEach((file) => {
			switch (file.mode) {
				case "bg": {
					const buffer = asset.load(data.movieId, file.id);
					fUtil.addToZip(zip, `${file.mode}/${file.id}`, buffer);
					break;
				}
				case "movie": {
					const buffer = asset.load(data.movieId, file.id);
					fUtil.addToZip(zip, `${file.mode}/${file.id}`, buffer);
					break;
				}
				case "sound":
				case "soundeffect": {
					const buffer = asset.load(data.movieId, file.id);
					fUtil.addToZip(zip, `${file.mode}/${file.id}`, buffer);
					break;
				}
				case "bgmusic": {
					const buffer = asset.load(data.movieId, file.id);
					fUtil.addToZip(zip, `${file.mode}/${file.id}`, buffer);
					break;
				}
				case "voiceover": {
					const buffer = asset.load(data.movieId, file.id);
					fUtil.addToZip(zip, `${file.mode}/${file.id}`, buffer);
					break;
				}
				case "effect":
				case "prop": {
					const buffer = asset.load(data.movieId, file.id);
					fUtil.addToZip(zip, `${file.mode}/${file.id}`, buffer);
					break;
				}
			}
		});
		return await zip.zip();
	} else {
		return Buffer.from(xmlString);
	}
}

/**
 * HTTP asset list handler
 *
 * @param      {http.IncomingMessage}              req     The request
 * @param      {http.ServerResponse}               res     The response
 * @param      {import("url").UrlWithParsedQuery}  url     The url
 * @return     {boolean}                           Whether or not the function
 *                                                 was successful
 */
module.exports = function (req, res, url) {
	var makeZip = false;
	switch (url.pathname) {
		case "/goapi/getUserAssets/":
			makeZip = true;
			break;
		case "/goapi/getUserAssetsXml/":
			break;
		default:
			return;
	}

	switch (req.method) {
		case "GET": {
			var q = url.query;
			if (q.movieId && q.type) {
				listAssets(q, makeZip).then((buff) => {
					const type = makeZip ? "application/zip" : "text/xml";
					res.setHeader("Content-Type", type);
					res.end(buff);
				});
				return true;
			} else return;
		}
		case "POST": {
			loadPost(req, res)
				.then(([data]) => listAssets(data, makeZip))
				.then((buff) => {
					const type = makeZip ? "application/zip" : "text/xml";
					res.setHeader("Content-Type", type);
					if (makeZip) res.write(base);
					res.end(buff);
				});
			return true;
		}
		default:
			return;
	}
};
