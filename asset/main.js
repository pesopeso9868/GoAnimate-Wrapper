const chars = require("../character/main");
const caché = require("../data/caché");
const fUtil = require("../misc/file");
const fs = require("fs");
module.exports = {
	/**
	 * Call caché.load with provided arguments.
	 * @param  {string} mId The movie ID.
	 * @param  {string} aId The asset ID.
	 * @return {Buffer}     The asset, stored in a Buffer.
	 */
	load(mId, aId) {
		return caché.load(mId, aId);
	},
	save(buffer, mId, mode, ext) {
		var suffix = `-${mode}.${ext}`;
		return caché.newItem(buffer, mId, "", suffix);
	},
	list(mId, mode) {
		var ret = [];
		var files = caché.list(mId);
		files.forEach((aId) => {
			var dot = aId.lastIndexOf(".");
			var dash = aId.lastIndexOf("-");
			var name = aId.substr(0, dash);
			var ext = aId.substr(dot + 1);
			var fMode = aId.substr(dash + 1, dot - dash - 1);
			if (fMode == mode) {
				ret.push({ id: aId, ext: ext, name: name, mode: fMode });
			}
		});
		return ret;
	},
	listAll(mId) {
		var ret = [];
		var files = caché.list(mId);
		files.forEach((aId) => {
			var dot = aId.lastIndexOf(".");
			var dash = aId.lastIndexOf("-");
			var name = aId.substr(0, dash);
			var ext = aId.substr(dot + 1);
			var fMode = aId.substr(dash + 1, dot - dash - 1);
			ret.push({ id: aId, ext: ext, name: name, mode: fMode });
		});
		return ret;
	},
	/**
	 * List characters for a theme.
	 * @param  {str} theme The theme ID.
	 * @return {Promise<Array>}       A Promise containing the theme list.
	 */
	chars(theme) {
		return new Promise(async (res, rej) => {
			switch (theme) {
				case "custom":
					theme = "family";
					break;
				case "action":
				case "animal":
				case "space":
				case "vietnam":
					theme = "cc2";
					break;
			}

			var table = [];
			var ids = fUtil.getValidFileIndicies("char-", ".xml");
			for (const i in ids) {
				var id = `c-${ids[i]}`;
				//HELLO?????? ITS LITERALLY FUCKING THERE THE SAVED FOLDER IS THERE
				var name;
				try{
					const match = fs.readFileSync(`./_SAVED/char-${ids[i].toString().padStart(7,"0")}.xml`, "utf8").match(/char_name="(.*?)"/)
					name = match[1]
				}
				catch(err){
					name = undefined
				}
				if (!theme || theme == (await chars.getTheme(id))) {
					table.unshift({ theme: theme, id: id, name: name });
				}
			}
			res(table);
		});
	},
};
