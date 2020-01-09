const nodezip = require('node-zip');
const fs = require('fs');

module.exports = {
	/** 
	 * 
	 * @param {number} n 
	 * @param {number} l
	 * @returns {string}
	 */
	padZero(n, l = process.env.FILE_NUM_WIDTH) {
		return ('' + n).padStart(l, '0');
	},
	/**
	 * 
	 * @param {string} temp 
	 * @param {string} info
	 * @returns {string}
	 */
	fillTemplate(temp, info) {
		return temp.replace(/%s/g, info);
	},
	/**
	 * @param {string} s
	 * @param {string} ext
	 * @param {number} l
	 * @returns {string}
	 */
	getNextFile(s, ext = 'xml', l = 7) {
		const regex = new RegExp(`${s}[0-9]*\.${ext}$`);
		const dir = fs.readdirSync(process.env.MOVIE_FOLDER).filter(v => v && regex.test(v));
		return `${process.env.MOVIE_FOLDER}/${s}${this.padZero(dir.length, l)}${ext}`;
	},
	/**
	 * @param {string} s
	 * @param {string} ext
	 * @returns {number}
	 */
	getNextFileId(s, ext = 'xml') {
		const regex = new RegExp(`${s}[0-9]*\.${ext}$`);
		const dir = fs.readdirSync(process.env.MOVIE_FOLDER).filter(v => v && regex.test(v));
		return dir.length;
	},
	/**
	 * @param {string} s
	 * @param {string} ext
	 * @returns {number}
	 */
	fillNextFileId(s, ext = 'xml', l = 7) {
		const id = this.getNextFileId(s, ext);
		const fn = this.getFileIndex(s, ext, id, l);
		fs.writeFileSync(fn, '');
		return id;
	},
	/**
	 * @param {string} s
	 * @param {string} ext
	 * @param {number} n
	 * @param {number} l
	 * @returns {string}
	 */
	getFileIndex(s, ext = 'xml', n, l = 7) {
		return `${process.env.MOVIE_FOLDER}/${s}.${this.padZero(n, l)}${ext}`;
	},
	/**
	 * 
	 * @param {string} fileName 
	 * @param {string} zipName 
	 */
	zippy(fileName, zipName) {
		if (!fs.existsSync(fileName)) return Promise.reject();
		const buffer = fs.readFileSync(fileName);
		const zip = nodezip.create();
		this.addToZip(zip, zipName, buffer);
		return zip.zip();
	},
	/**
	 * 
	 * @param {nodezip.ZipFile} zip 
	 * @param {string} zipName 
	 * @param {string} buffer 
	 */
	addToZip(zip, zipName, buffer) {
		zip.add(zipName, buffer);
		if (zip[zipName].crc32 < 0)
			zip[zipName].crc32 += 4294967296;
	},
}