(function(FuseBox){FuseBox.$fuse$=FuseBox;
FuseBox.pkg("default", {}, function(___scope___){
___scope___.file("critical.js", function(exports, require, module, __filename, __dirname){

'use strict';

var _loadFont = require('./utils/load-font');

var canela = [{ family: 'Canela Web', weight: 300 }, { family: 'Canela Web', weight: 700 }];

var publico = [{ family: 'Publico Text Web', weight: 400 }, { family: 'Publico Text Web', weight: 700 }];

var atlas = [{ family: 'Atlas Grotesk Web', weight: 300 }, { family: 'Atlas Grotesk Web', weight: 400 }, { family: 'Atlas Grotesk Web', weight: 500 }];

(0, _loadFont.loadFontGroup)(canela);
(0, _loadFont.loadFontGroup)(publico);
(0, _loadFont.loadFontGroup)(atlas);
});
___scope___.file("utils/load-font.js", function(exports, require, module, __filename, __dirname){

'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.loadFontGroup = exports.loadFont = undefined;

require('promis');

var _fontfaceobserver = require('fontfaceobserver');

var _fontfaceobserver2 = _interopRequireDefault(_fontfaceobserver);

var _dom = require('./dom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var htmlEl = document.documentElement;
var TIMEOUT = 5000;

function addFont(family) {
	var first = family.split(' ')[0];
	var name = first.toLowerCase().replace(/ /g, '-');
	var className = 'loaded-' + name;
	(0, _dom.addClass)(htmlEl, className);
}

function handleError(err) {
	console.error(err);
}

function loadFont(font) {
	var family = font.family,
	    _font$weight = font.weight,
	    weight = _font$weight === undefined ? 'normal' : _font$weight;

	var fontObserver = new _fontfaceobserver2.default(family, { weight: weight });
	fontObserver.load(null, TIMEOUT).then(function () {
		return addFont(font);
	}).catch(handleError);
}

function loadFontGroup(group) {
	var promises = group.map(function (font) {
		return new Promise(function (resolve, reject) {
			var family = font.family,
			    weight = font.weight,
			    _font$style = font.style,
			    style = _font$style === undefined ? 'normal' : _font$style;


			var fontObserver = new _fontfaceobserver2.default(family, { weight: weight, style: style });
			return fontObserver.load(null, TIMEOUT).then(function () {
				return resolve(family);
			}).catch(function (err) {
				return reject(err);
			});
		});
	});

	Promise.all(promises).then(function (result) {
		return addFont(result[0]);
	}).catch(handleError);
}

exports.loadFont = loadFont;
exports.loadFontGroup = loadFontGroup;
});
___scope___.file("utils/dom.js", function(exports, require, module, __filename, __dirname){

'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// DOM helper functions

// public
function select(selector) {
	return document.querySelector(selector);
}

function selectAll(selector) {
	var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

	return [].concat(_toConsumableArray(parent.querySelectorAll(selector)));
}

function find(el, selector) {
	return [].concat(_toConsumableArray(el.querySelectorAll(selector)));
}

function removeClass(el, className) {
	if (el.classList) el.classList.remove(className);else el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

function addClass(el, className) {
	if (el.classList) el.classList.add(className);else el.className = el.className + ' ' + className;
}

function hasClass(el, className) {
	if (el.classList) return el.classList.contains(className);
	return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
}

function jumpTo(el, offset) {
	offset = offset || 0;
	var top = el.getBoundingClientRect().top + offset;
	var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	var destY = scrollTop + top;
	window.scrollTo(0, destY);
}

exports.select = select;
exports.selectAll = selectAll;
exports.find = find;
exports.removeClass = removeClass;
exports.addClass = addClass;
exports.hasClass = hasClass;
exports.jumpTo = jumpTo;
});
});
FuseBox.pkg("promis", {}, function(___scope___){
___scope___.file("promise.js", function(exports, require, module, __filename, __dirname){

(function(){'use strict';var f,g=[];function l(a){g.push(a);1==g.length&&f()}function m(){for(;g.length;)g[0](),g.shift()}f=function(){setTimeout(m)};function n(a){this.a=p;this.b=void 0;this.f=[];var b=this;try{a(function(a){q(b,a)},function(a){r(b,a)})}catch(c){r(b,c)}}var p=2;function t(a){return new n(function(b,c){c(a)})}function u(a){return new n(function(b){b(a)})}function q(a,b){if(a.a==p){if(b==a)throw new TypeError;var c=!1;try{var d=b&&b.then;if(null!=b&&"object"==typeof b&&"function"==typeof d){d.call(b,function(b){c||q(a,b);c=!0},function(b){c||r(a,b);c=!0});return}}catch(e){c||r(a,e);return}a.a=0;a.b=b;v(a)}}
function r(a,b){if(a.a==p){if(b==a)throw new TypeError;a.a=1;a.b=b;v(a)}}function v(a){l(function(){if(a.a!=p)for(;a.f.length;){var b=a.f.shift(),c=b[0],d=b[1],e=b[2],b=b[3];try{0==a.a?"function"==typeof c?e(c.call(void 0,a.b)):e(a.b):1==a.a&&("function"==typeof d?e(d.call(void 0,a.b)):b(a.b))}catch(h){b(h)}}})}n.prototype.g=function(a){return this.c(void 0,a)};n.prototype.c=function(a,b){var c=this;return new n(function(d,e){c.f.push([a,b,d,e]);v(c)})};
function w(a){return new n(function(b,c){function d(c){return function(d){h[c]=d;e+=1;e==a.length&&b(h)}}var e=0,h=[];0==a.length&&b(h);for(var k=0;k<a.length;k+=1)u(a[k]).c(d(k),c)})}function x(a){return new n(function(b,c){for(var d=0;d<a.length;d+=1)u(a[d]).c(b,c)})};window.Promise||(window.Promise=n,window.Promise.resolve=u,window.Promise.reject=t,window.Promise.race=x,window.Promise.all=w,window.Promise.prototype.then=n.prototype.c,window.Promise.prototype["catch"]=n.prototype.g);}());

});
return ___scope___.entry = "promise.js";
});
FuseBox.pkg("fontfaceobserver", {}, function(___scope___){
___scope___.file("fontfaceobserver.standalone.js", function(exports, require, module, __filename, __dirname){

(function(){function l(a,b){document.addEventListener?a.addEventListener("scroll",b,!1):a.attachEvent("scroll",b)}function m(a){document.body?a():document.addEventListener?document.addEventListener("DOMContentLoaded",function c(){document.removeEventListener("DOMContentLoaded",c);a()}):document.attachEvent("onreadystatechange",function k(){if("interactive"==document.readyState||"complete"==document.readyState)document.detachEvent("onreadystatechange",k),a()})};function r(a){this.a=document.createElement("div");this.a.setAttribute("aria-hidden","true");this.a.appendChild(document.createTextNode(a));this.b=document.createElement("span");this.c=document.createElement("span");this.h=document.createElement("span");this.f=document.createElement("span");this.g=-1;this.b.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";this.c.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";
this.f.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";this.h.style.cssText="display:inline-block;width:200%;height:200%;font-size:16px;max-width:none;";this.b.appendChild(this.h);this.c.appendChild(this.f);this.a.appendChild(this.b);this.a.appendChild(this.c)}
function t(a,b){a.a.style.cssText="max-width:none;min-width:20px;min-height:20px;display:inline-block;overflow:hidden;position:absolute;width:auto;margin:0;padding:0;top:-999px;left:-999px;white-space:nowrap;font-synthesis:none;font:"+b+";"}function y(a){var b=a.a.offsetWidth,c=b+100;a.f.style.width=c+"px";a.c.scrollLeft=c;a.b.scrollLeft=a.b.scrollWidth+100;return a.g!==b?(a.g=b,!0):!1}function z(a,b){function c(){var a=k;y(a)&&a.a.parentNode&&b(a.g)}var k=a;l(a.b,c);l(a.c,c);y(a)};function A(a,b){var c=b||{};this.family=a;this.style=c.style||"normal";this.weight=c.weight||"normal";this.stretch=c.stretch||"normal"}var B=null,C=null,E=null,F=null;function G(){if(null===C)if(J()&&/Apple/.test(window.navigator.vendor)){var a=/AppleWebKit\/([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/.exec(window.navigator.userAgent);C=!!a&&603>parseInt(a[1],10)}else C=!1;return C}function J(){null===F&&(F=!!document.fonts);return F}
function K(){if(null===E){var a=document.createElement("div");try{a.style.font="condensed 100px sans-serif"}catch(b){}E=""!==a.style.font}return E}function L(a,b){return[a.style,a.weight,K()?a.stretch:"","100px",b].join(" ")}
A.prototype.load=function(a,b){var c=this,k=a||"BESbswy",q=0,D=b||3E3,H=(new Date).getTime();return new Promise(function(a,b){if(J()&&!G()){var M=new Promise(function(a,b){function e(){(new Date).getTime()-H>=D?b():document.fonts.load(L(c,'"'+c.family+'"'),k).then(function(c){1<=c.length?a():setTimeout(e,25)},function(){b()})}e()}),N=new Promise(function(a,c){q=setTimeout(c,D)});Promise.race([N,M]).then(function(){clearTimeout(q);a(c)},function(){b(c)})}else m(function(){function u(){var b;if(b=-1!=
f&&-1!=g||-1!=f&&-1!=h||-1!=g&&-1!=h)(b=f!=g&&f!=h&&g!=h)||(null===B&&(b=/AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent),B=!!b&&(536>parseInt(b[1],10)||536===parseInt(b[1],10)&&11>=parseInt(b[2],10))),b=B&&(f==v&&g==v&&h==v||f==w&&g==w&&h==w||f==x&&g==x&&h==x)),b=!b;b&&(d.parentNode&&d.parentNode.removeChild(d),clearTimeout(q),a(c))}function I(){if((new Date).getTime()-H>=D)d.parentNode&&d.parentNode.removeChild(d),b(c);else{var a=document.hidden;if(!0===a||void 0===a)f=e.a.offsetWidth,
g=n.a.offsetWidth,h=p.a.offsetWidth,u();q=setTimeout(I,50)}}var e=new r(k),n=new r(k),p=new r(k),f=-1,g=-1,h=-1,v=-1,w=-1,x=-1,d=document.createElement("div");d.dir="ltr";t(e,L(c,"sans-serif"));t(n,L(c,"serif"));t(p,L(c,"monospace"));d.appendChild(e.a);d.appendChild(n.a);d.appendChild(p.a);document.body.appendChild(d);v=e.a.offsetWidth;w=n.a.offsetWidth;x=p.a.offsetWidth;I();z(e,function(a){f=a;u()});t(e,L(c,'"'+c.family+'",sans-serif'));z(n,function(a){g=a;u()});t(n,L(c,'"'+c.family+'",serif'));
z(p,function(a){h=a;u()});t(p,L(c,'"'+c.family+'",monospace'))})})};"undefined"!==typeof module?module.exports=A:(window.FontFaceObserver=A,window.FontFaceObserver.prototype.load=A.prototype.load);}());

});
return ___scope___.entry = "fontfaceobserver.standalone.js";
});

FuseBox.import("default/critical.js");
FuseBox.main("default/critical.js");
})
(function(e){function r(e){var r=e.charCodeAt(0),n=e.charCodeAt(1);if((d||58!==n)&&(r>=97&&r<=122||64===r)){if(64===r){var t=e.split("/"),i=t.splice(2,t.length).join("/");return[t[0]+"/"+t[1],i||void 0]}var o=e.indexOf("/");if(o===-1)return[e];var a=e.substring(0,o),u=e.substring(o+1);return[a,u]}}function n(e){return e.substring(0,e.lastIndexOf("/"))||"./"}function t(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];for(var n=[],t=0,i=arguments.length;t<i;t++)n=n.concat(arguments[t].split("/"));for(var o=[],t=0,i=n.length;t<i;t++){var a=n[t];a&&"."!==a&&(".."===a?o.pop():o.push(a))}return""===n[0]&&o.unshift(""),o.join("/")||(o.length?"/":".")}function i(e){var r=e.match(/\.(\w{1,})$/);return r&&r[1]?e:e+".js"}function o(e){if(d){var r,n=document,t=n.getElementsByTagName("head")[0];/\.css$/.test(e)?(r=n.createElement("link"),r.rel="stylesheet",r.type="text/css",r.href=e):(r=n.createElement("script"),r.type="text/javascript",r.src=e,r.async=!0),t.insertBefore(r,t.firstChild)}}function a(e,r){for(var n in e)e.hasOwnProperty(n)&&r(n,e[n])}function u(e){return{server:require(e)}}function f(e,n){var o=n.path||"./",a=n.pkg||"default",f=r(e);if(f&&(o="./",a=f[0],n.v&&n.v[a]&&(a=a+"@"+n.v[a]),e=f[1]),e)if(126===e.charCodeAt(0))e=e.slice(2,e.length),o="./";else if(!d&&(47===e.charCodeAt(0)||58===e.charCodeAt(1)))return u(e);var s=h[a];if(!s){if(d&&"electron"!==m.target)throw"Package not found "+a;return u(a+(e?"/"+e:""))}e=e?e:"./"+s.s.entry;var l,c=t(o,e),p=i(c),v=s.f[p];return!v&&p.indexOf("*")>-1&&(l=p),v||l||(p=t(c,"/","index.js"),v=s.f[p],v||(p=c+".js",v=s.f[p]),v||(v=s.f[c+".jsx"]),v||(p=c+"/index.jsx",v=s.f[p])),{file:v,wildcard:l,pkgName:a,versions:s.v,filePath:c,validPath:p}}function s(e,r){if(!d)return r(/\.(js|json)$/.test(e)?p.require(e):"");var n=new XMLHttpRequest;n.onreadystatechange=function(){if(4==n.readyState)if(200==n.status){var i=n.getResponseHeader("Content-Type"),o=n.responseText;/json/.test(i)?o="module.exports = "+o:/javascript/.test(i)||(o="module.exports = "+JSON.stringify(o));var a=t("./",e);m.dynamic(a,o),r(m.import(e,{}))}else console.error(e,"not found on request"),r(void 0)},n.open("GET",e,!0),n.send()}function l(e,r){var n=g[e];if(n)for(var t in n){var i=n[t].apply(null,r);if(i===!1)return!1}}function c(e,r){if(void 0===r&&(r={}),58===e.charCodeAt(4)||58===e.charCodeAt(5))return o(e);var t=f(e,r);if(t.server)return t.server;var i=t.file;if(t.wildcard){var a=new RegExp(t.wildcard.replace(/\*/g,"@").replace(/[.?*+^$[\]\\(){}|-]/g,"\\$&").replace(/@@/g,".*").replace(/@/g,"[a-z0-9$_-]+"),"i"),u=h[t.pkgName];if(u){var v={};for(var g in u.f)a.test(g)&&(v[g]=c(t.pkgName+"/"+g));return v}}if(!i){var m="function"==typeof r,x=l("async",[e,r]);if(x===!1)return;return s(e,function(e){return m?r(e):null})}var _=t.pkgName;if(i.locals&&i.locals.module)return i.locals.module.exports;var w=i.locals={},y=n(t.validPath);w.exports={},w.module={exports:w.exports},w.require=function(e,r){return c(e,{pkg:_,path:y,v:t.versions})},w.require.main={filename:d?"./":p.require.main.filename,paths:d?[]:p.require.main.paths};var b=[w.module.exports,w.require,w.module,t.validPath,y,_];return l("before-import",b),i.fn.apply(0,b),l("after-import",b),w.module.exports}if(e.FuseBox)return e.FuseBox;var d="undefined"!=typeof window&&window.navigator,p=d?window:global;d&&(p.global=window),e=d&&"undefined"==typeof __fbx__dnm__?e:module.exports;var v=d?window.__fsbx__=window.__fsbx__||{}:p.$fsbx=p.$fsbx||{};d||(p.require=require);var h=v.p=v.p||{},g=v.e=v.e||{},m=function(){function r(){}return r.global=function(e,r){return void 0===r?p[e]:void(p[e]=r)},r.import=function(e,r){return c(e,r)},r.on=function(e,r){g[e]=g[e]||[],g[e].push(r)},r.exists=function(e){try{var r=f(e,{});return void 0!==r.file}catch(e){return!1}},r.remove=function(e){var r=f(e,{}),n=h[r.pkgName];n&&n.f[r.validPath]&&delete n.f[r.validPath]},r.main=function(e){return this.mainFile=e,r.import(e,{})},r.expose=function(r){var n=function(n){var t=r[n].alias,i=c(r[n].pkg);"*"===t?a(i,function(r,n){return e[r]=n}):"object"==typeof t?a(t,function(r,n){return e[n]=i[r]}):e[t]=i};for(var t in r)n(t)},r.dynamic=function(r,n,t){this.pkg(t&&t.pkg||"default",{},function(t){t.file(r,function(r,t,i,o,a){var u=new Function("__fbx__dnm__","exports","require","module","__filename","__dirname","__root__",n);u(!0,r,t,i,o,a,e)})})},r.flush=function(e){var r=h.default;for(var n in r.f)e&&!e(n)||delete r.f[n].locals},r.pkg=function(e,r,n){if(h[e])return n(h[e].s);var t=h[e]={};return t.f={},t.v=r,t.s={file:function(e,r){return t.f[e]={fn:r}}},n(t.s)},r.addPlugin=function(e){this.plugins.push(e)},r}();return m.packages=h,m.isBrowser=d,m.isServer=!d,m.plugins=[],d||(p.FuseBox=m),e.FuseBox=m}(this))