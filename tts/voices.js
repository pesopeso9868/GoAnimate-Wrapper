const info = require("./info");
const http = require("http");
const builder = require("xmlbuilder2")
/*const voices = info.voices,
	langs = {};*/

/*Object.keys(voices).forEach((i) => {
	const v = voices[i],
		l = v.language;
	langs[l] = langs[l] || [];
	langs[l].push(`<voice id="${i}" desc="${v.desc}" sex="${v.gender}" demo-url="" country="${v.country}" plus="N"/>`);
});

var xml = builder.create({version: "1.0", encoding: "utf-8"}).ele("voices")
Object.keys(langs).sort().map((i)=>{
	xml.ele("language", {id: i, desc: info.languages[i]}).txt(`${i}${info.languages[i]}`).up()
})
xml.up()
xml = xml.end({prettyPrint: false})
console.log(xml)
const xml = `${process.env.XML_HEADER}<voices>${Object.keys(langs)
	.sort()
	.map((i) => {
		const v = langs[i],
			l = info.languages[i];
		return `<language id="${i}" desc="${l}">${v.join("")}</language>`;
	})
	.join("")}</voices>`;

console.log(xml)*/

//Joink https://stackoverflow.com/questions/5072136/javascript-filter-for-objects
function penis(obj, predicate) {
    let result = {}, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key) && predicate(obj[key])) {
            result[key] = obj[key];
        }
    }
    return result;
};

const xml = builder.create({version: "1.0", encoding: "utf-8"}).ele("voices")
for(i in info.languages){
	var langobj = info.languages
	var lang = xml.ele("language", {id: i, desc: langobj[i]})
	for(j in penis(info.voices, ((p)=>p.language==i))){
		var voiceobj = info.voices[j]
		lang.ele("voice", {id: j, desc: voiceobj.desc, sex: voiceobj.gender, "demo-url":"", country:voiceobj.country, plus: "N"}).up()
	}
	lang.up()
}
xml.up()
/**
 * TTS voice handler
 *
 * @param      {http.IncomingMessage}  req     The request
 * @param      {http.ServerResponse}   res     The response
 * @param      {<type>}                url     The url
 * @return     {boolean}               Whether or not the function failed
 */
module.exports = function (req, res, url) {
	if (req.method != "POST" || url.path != "/goapi/getTextToSpeechVoices/") return;
	res.setHeader("Content-Type", "text/html; charset=UTF-8");
	res.end(xml.end({prettyPrint: false}));
	return true;
};
