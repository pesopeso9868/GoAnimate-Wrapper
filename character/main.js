const cachéFolder = process.env.CACHÉ_FOLDER;
const xNumWidth = process.env.XML_NUM_WIDTH;
const baseUrl = process.env.CHAR_BASE_URL;
const fUtil = require("../misc/file");
const util = require("../misc/util");
const get = require("../misc/get");
const fw = process.env.FILE_WIDTH;
const fs = require("fs");
const themes = {};

//Instead of this indexOf nonsense, why not use regex?

/**
 * Add a theme to the character\main.js themes variable.
 *
 * @param      {[type]}  id      [description]
 * @param      {[type]}  buffer  [description]
 * @return     {[type]}  [description]
 */
function addTheme(id, buffer) {
	// const beg = buffer.indexOf(`theme_id="`) + 10;
	// const end = buffer.indexOf(`"`, beg);
	// const theme = buffer.subarray(beg, end).toString();
	const theme = buffer.toString().match(/theme_id="(.*?)"/)
	if (theme && theme[1]) {return (themes[id] = theme[1])};
}

function save(id, data) {
	const i = id.indexOf("-");
	const prefix = id.substr(0, i); //ESLint tells me this isn't used so we don't need it
	const suffix = id.substr(i + 1);
	switch (prefix.toLowerCase()) {
		case "c":
			fs.writeFileSync(fUtil.getFileIndex("char-", ".xml", suffix), data);
			break;
	}
	addTheme(id, data);
	return id;
}

fUtil.getValidFileIndicies("char-", ".xml").map((n) => {
	return addTheme(`c-${n}`, fs.readFileSync(fUtil.getFileIndex("char-", ".xml", n)));
});

/**
 * Gets the character path.
 *
 * @param      {string}  id      The identifier
 * @return     {string}  The character path.
 */
function getCharPath(id) {
	var i = id.indexOf("-");
	var prefix = id.substr(0, i);
	var suffix = id.substr(i + 1);
	switch (prefix) {
		case "c":
			return fUtil.getFileIndex("char-", ".xml", suffix);
		default:
			return `${cachéFolder}/char.${id}.xml`;
	}
}
/**
 * Gets the thumb path.
 *
 * @param      {string}  id      The identifier
 * @return     {string}  The thumb path.
 */
function getThumbPath(id) {
	var i = id.indexOf("-");
	var prefix = id.substr(0, i);
	var suffix = id.substr(i + 1);
	switch (prefix) {
		case "c":
			return fUtil.getFileIndex("char-", ".png", suffix);
		default:
			return `${cachéFolder}/char.${id}.png`;
	}
}

module.exports = {
	/**
	 * Get theme from character\main.js themes object
	 *
	 * @param      {string}           id      Theme id
	 * @return     {Promise<String>}  [description]
	 */
	getTheme(id) {
		return new Promise((res, rej) => {
			if (themes[id]) res(themes[id]);
			this.load(id)
				.then((b) => res(addTheme(id, b)))
				.catch(rej);
		});
	},
	/**
	 * Load a character.
	 *
	 * @param      {string}           id      ID of the character.
	 * @return     {Promise<Buffer>}  XML of the character stored in a Buffer.
	 */
	load(id) {
		return new Promise((res, rej) => {
			var i = id.indexOf("-");
			var prefix = id.substr(0, i);
			var suffix = id.substr(i + 1);

			switch (prefix.toLowerCase()) {
				case "c":
					fs.readFile(getCharPath(id), (e, b) => {
						if (e) return rej(Buffer.from(util.xmlFail()));
						res(b);
					});
					break;
				case "":
				default: {
					// Blank prefix is left here for backwards-compatibility purposes.
					var nId = Number.parseInt(suffix);
					var xmlSubId = nId % fw;
					var fileId = nId - xmlSubId;
					var lnNum = fUtil.padZero(xmlSubId, xNumWidth);
					var url = `${baseUrl}/${fUtil.padZero(fileId)}.txt`;

					get(url)
						.then((b) => {
							var line = b
								.toString("utf8")
								.split("\n")
								.find((v) => v.substr(0, xNumWidth) == lnNum);
							if (!line) {
								return rej(Buffer.from(util.xmlFail()));
							}
							res(Buffer.from(line.substr(xNumWidth)));
						})
						.catch((e) => rej(Buffer.from(util.xmlFail(e.toString()))));
					break;
				}
			}
		});
	},
	/**
	 * Save character.
	 *
	 * @param      {Buffer}           data    XML data of the character
	 * @param      {string}           id      ID destination
	 * @return     {Promise<string>}  The ID if save succeeded, else undefined
	 */
	save(data, id) {
		return new Promise((res, rej) => {
			if (id) {
				const i = id.indexOf("-");
				const prefix = id.substr(0, i);
				switch (prefix.toLowerCase()) {
					case "c":
						fs.writeFile(getCharPath(id), data, (e) => (e ? rej() : res(id)));
					default:
						res(save(id, data));
						break;
				}
			} else {
				var saveId = `c-${fUtil.getNextFileId("char-", ".xml")}`;
				res(save(saveId, data));
			}
		});
	},
	/**
	 * Save character thumbnail.
	 *
	 * @param      {Buffer}           data    Thumbnail data.
	 * @param      {string}           id      ID of the character.
	 * @return     {Promise<string>}  ID of the character.
	 */
	saveThumb(data, id) {
		return new Promise((res, rej) => {
			var thumb = Buffer.from(data, "base64");
			fs.writeFileSync(getThumbPath(id), thumb);
			res(id);
		});
	},
	/**
	 * Load character thumbnail.
	 *
	 * @param      {string}           id      ID of the character.
	 * @return     {Promise<Buffer>}  XML of the thumbnail stored in a Buffer.
	 */
	loadThumb(id) {
		return new Promise((res, rej) => {
			fs.readFile(getThumbPath(id), (e, b) => {
				if (e) return rej(Buffer.from(util.xmlFail()));
				res(b);
			});
		});
	},
};
