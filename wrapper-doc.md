# Documenting the Wrapper ecosystem

## Overview

This Markdown file aims at documenting Wrapper: Offline, a derivative of Wrapper: Online, whose goal is to provide a viable (yet legally questionable) alternative to GoAnimate. This file will also document the few quirks of Wrapper and potential solutions to them.

## Entry point

The `npm start` command runs `node main.js`, as told in package.json. This file then requires `server.js` in which it loads all of our modules to an array called `functions` and starts an HTTP server. This HTTP server, upon request, will find the function in `functions` and run it. If the function found returns `false`, or if it returns an Error, it returns a 404.

## The module system

We have previously stated that the modules are stored in the `functions` array in server.js. These modules are `.js` files, distributed between subfolders of the Wrapper repository. These modules don't exactly have a common entry point like index.js or the likes, they're included explicitly within server.js, which can make adding new features very tiresome.

A list of modules used by Wrapper can be seen below:

```
./character/redirect
./character/premade
./character/load
./character/save
./character/thmb
./movie/upload
./asset/upload
./static/load
./static/page
./asset/load
./asset/list
./asset/thmb
./movie/load
./movie/list
./movie/meta
./movie/save
./movie/thmb
./theme/list
./theme/load
./tts/voices
./tts/load
```

These modules will be covered in order.

### The `character` folder

In Wrapper, the files `redirect`, `premade`, `load`, `save` and `thmb` are included in `server.js`.

#### `redirect.js`
The `module.exports` of `redirect.js` is a function, just like any other module in the repository. This function starts by checking if the HTTP method is GET and if it starts with `/go/character_creator`. If it doesnt, it returns with no value. If it does, the function then checks if the url argument matches `/\/go\/character_creator\/(\w+)(\/\w+)?(\/.+)?$/`. If it doesn't, it again returns with no value. This regex checks if /go/character_creator/ is in the string, and checks for three groups: `theme`, `mode` and `id`. 

A different approach to get the `theme`, `mode` and `id` is to use a positive lookbehind, like this:
`(?<=\/go\/character_creator\/).*`
Afterwards, just process the match on node with String.prototype.split("/").
`theme` would be result[0], `mode` would be result[1], and so on.

Moving on, the function then declares a `redirect` variable which will be set in the Location header of the HTTP response. If mode (from our regex match) is `/copy`, the redirect is `/cc?themeId=<theme>&original_asset_id=${id.substr(1)}`. If not, the function gets the URL parameter `type`, or the default type for the theme if it doesn't exist, or just an empty string. This result is stored in the `type` variable. Then, the redirect is `/cc?themeId=<theme>&bs=<type>`, we redirect the user by setting the status code to 302 and setting the Location header and returning `true`.

#### `premade.js`
This function checks for `/goapi/getCCPreMadeCharacters` and a POST request. The response is a `text/xml`, charset `UTF-8`. This function opens a file in the `_PREMADE` folder, namely an XML with the filename of the theme specified. This uses the `post_body.js` module from `misc`, which simply handles the payload size of the POST request using a Promise. If it's too large, HTTP 413 is returned and the promise is rejected. If everything is fine, the Promise is resolved and the data and movieId is returned. Moving on, we create a ReadStream to read the file using the open event and the result is piped to the response. We handle any errors by using the error event.

### `load.js`
This function supports both HTTP GET and HTTP POST. Let's start with HTTP GET:
This one first checks for a regex (`/\/characters\/([^.]+)(?:\.xml)?$/`).
It checks if the url starts with /characters/ and ends with .xml. If it doesn't, null is returned.
If it does, that's great. We get the character ID from the first capturing group (that is `[^.]+`, which checks for the start of the line or any character 1 or more times), and then we set the Content-Type to text/xml. 
