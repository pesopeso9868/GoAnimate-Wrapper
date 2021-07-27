const sessions = require('./sessions');
/**
 * { function_description }
 *
 * @param      {<type>}   req     The request
 * @param      {<type>}   res     The resource
 * @param      {<type>}   url     The url
 * @return     {boolean}  { description_of_the_return_value }
 */
module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/heartbeat/v1/') return;
	res.end(`{"health":"0","locked":"${sessions.getCount(req) > 1 ? 1 : 0}"}`);
	return true;
}