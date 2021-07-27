const cachéFolder = process.env.CACHÉ_FOLDER;
const fs = require("fs");

/**
 * @summary    Dictionary of hashmaps of saved assets, respective to each movie
 *             ID loaded.
 * @typedef    {string[]}                  cTableType
 * @typedef    {{[mId:string]:cTableType}  } lcType
 *
 */
const localCaché = {};
var size = 0;

// IMPORTANT: serialises the cachéd files into the dictionaries.
fs.readdirSync(cachéFolder).forEach((v) => {
	const index = v.indexOf(".");
	const prefix = v.substr(0, index);
	const suffix = v.substr(index + 1);

	if (!localCaché[prefix]) localCaché[prefix] = [];
	localCaché[prefix].push(suffix);
});

module.exports = {
	/**
	 * Generates a random ID with a given prefix and suffix that is unique to
	 * the given table.
	 *
	 * @param      {string}  [pre=""]   The preix
	 * @param      {string}  [suf=""]   The suffix
	 * @param      {Array}   [table=[]  ]  The table
	 * @return     {string}  A newly generated ID
	 */
	generateId(pre = "", suf = "", table = []) {
		var id;
		do id = `${pre}${("" + Math.random()).replace(".", "")}${suf}`;
		while (table.includes(id));
		return id;
	},

	/**
	 * Validate asset ID
	 *
	 * @param      {string}   aId     Asset ID
	 * @return     {boolean}  Whether or not the asset ID is valid
	 */
	validAssetId(aId) {
		switch (aId) {
			case "id":
			case "time":
				return false;
			default:
				return true;
		}
	},
	/**
	 * Saves a buffer in movie caché with a given ID.
	 *
	 * @param      {string}  mId     The movie ID
	 * @param      {string}  aId     The asset ID
	 * @param      {Buffer}  buffer  The buffer
	 * @return     {Buffer}  The buffer
	 */
	save(mId, aId, buffer) {
		if (!this.validAssetId(aId)) return;
		localCaché[mId] = localCaché[mId] || [];
		var stored = localCaché[mId];
		const path = `${cachéFolder}/${mId}.${aId}`;

		if (!stored.includes(aId)) stored.push(aId);
		if (fs.existsSync(path)) size -= fs.statSync(path).size;
		fs.writeFileSync(path, buffer);
		size += buffer.size;
		return buffer;
	},
	/**
	 * Saves a given dictionary of buffers to caché.
	 *
	 * @param      {string}  mId           The movie ID
	 * @param      {Object}  [buffers={}]  The buffers
	 * @return     {Object}  The buffers
	 */
	saveTable(mId, buffers = {}) {
		for (const aId in buffers) {
			this.save(mId, aId, buffers[aId]);
		}
		return buffers;
	},
	/**
	 * Retrieves an array of buffers from a given video's caché.
	 *
	 * @param      {string}  mId     The movie ID
	 * @return     {array}   An array of Buffers
	 */
	loadTable(mId) {
		const buffers = {};
		this.list(mId).forEach((aId) => {
			buffers[aId] = fs.readFileSync(`${cachéFolder}/${mId}.${aId}`);
		});
		return buffers;
	},
	/**
	 * Retrieves the array of asset IDs for the given video.
	 *
	 * @param      {string}      mId     The movie ID
	 * @return     {cTableType}  An array of asset IDs
	 */
	list(mId) {
		return localCaché[mId] || [];
	},
	/**
	 * Allocates a new video-wide ID for a given buffer in the caché.
	 *
	 * @param      {Buffer}  buffer  The buffer
	 * @param      {string}  mId     The movie ID
	 * @param      {string}  prefix  The prefix
	 * @param      {string}  suffix  The suffix
	 * @return     {string}  The asset ID
	 */
	newItem(buffer, mId, prefix = "", suffix = "") {
		localCaché[mId] = localCaché[mId] || [];
		var stored = localCaché[mId];
		var aId = this.generateId(prefix, suffix, stored);
		this.save(mId, aId, buffer);
		return aId;
	},
	/**
	 * Load an asset from the cache folder.
	 *
	 * @param      {string}  mId     The movie ID.
	 * @param      {string}  aId     The asset ID.
	 * @return     {Buffer}  The asset, stored in a Buffer.
	 */
	load(mId, aId) {
		if (!this.validAssetId(aId)) return;
		const stored = localCaché[mId];
		if (!stored) return null;

		const path = `${cachéFolder}/${mId}.${aId}`;
		stored.time = new Date();
		if (stored.includes(aId)) {
			return fs.readFileSync(path);
		}
	},
	/**
	 * @summary Transfers all caché data as if 'old' had never existed.
	 * @param {string} old
	 * @param {string} nëw
	 * @returns {void}
	 */
	transfer(old, nëw) {
		if (nëw == old || !localCaché[old]) return;
		(localCaché[nëw] = localCaché[old]).forEach((aId) => {
			const oldP = `${cachéFolder}/${old}.${aId}`;
			const nëwP = `${cachéFolder}/${nëw}.${aId}`;
			fs.renameSync(oldP, nëwP);
		});
		delete localCaché[old];
	},
	/**
	 * Clear cache
	 *
	 * @param      {string}   mId                Movie ID
	 * @param      {boolean}  [setToEmpty=true]  Empty the cache
	 */
	clearTable(mId, setToEmpty = true) {
		const stored = localCaché[mId];
		if (!stored) return;
		stored.forEach((aId) => {
			if (aId != "time") {
				var path = `${cachéFolder}/${mId}.${aId}`;
				size -= fs.statSync(path).size;
				fs.unlinkSync(path);
			}
		});
		if (setToEmpty) localCaché[mId] = [];
		else delete localCaché[mId];
	},
};
