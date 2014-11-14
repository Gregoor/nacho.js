!function(){var e=function(e){var t=this;this.obj=e,this._listeners={},["on","trigger","forkListeners"].forEach(function(i){if(e[i])throw"Method name collision: "+i;e[i]=function(){return t[i].apply(t,arguments)}})};e.prototype={on:function(e,t){if("string"==typeof e){var i=e.split(" ");if(1==i.length)this._addListener(e,t,"single");else for(var n=0;n<i.length;n++)this._addListener(i[n],t,"multi")}else this._onMap(e);return this.obj},_addListener:function(e,t,i){this._listeners[e]||(this._listeners[e]=[]),this._listeners[e].push({callback:t,type:i})},_onMap:function(e){for(var t=Object.keys(e),i=0;i<t.length;i++){var n=t[i],r=e[n];"object"!=typeof r&&(r=[r]);for(var s=0;s<r.length;s++)r[s]&&this._addListener(n,r[s],"single")}},trigger:function(e){if("all"==e)throw"Triggering all events is an anti-pattern because \n";var t=this._listeners[e],i=this._listeners.all;if(t)for(var n=0;n<t.length;n++){var r=t[n];this._triggerCallback(r.callback,arguments,"multi"==r.type)}if(i)for(var s=0;s<i.length;s++)this._triggerCallback(i[s].callback,arguments,!0);return this.obj},_triggerCallback:function(e,t,i){e.apply(this.obj,Array.prototype.slice.call(t,i?0:1))}};var t=function(t,i){new e(this);var n=this,r=document.createElement("iframe");r.id="soundcloud-"+Math.round(1e5*Math.random()),r.src="https://w.soundcloud.com/player?url="+t,i?i.appendChild(r):(r.style.display="none",document.body.appendChild(r));var s=this._player=SC.Widget(r);this._element=r,s.bind("ready",function(){n.trigger("ready")}),["play","pause","seek","error"].forEach(function(e){s.bind(e,function(){"finish"==e&&triggerFinish(),s.getPosition(function(t){n.trigger(e,"error"==e?void 0:t/1e3)})})}),s.bind("playProgress",function(e){1==e.relativePosition&&n._triggerFinish()}),s.bind("finish",function(){n._triggerFinish()})};t.prototype={play:function(){var e=this;setTimeout(function(){e._player.play()},500)},pause:function(){this._player.pause()},getCurrentTime:function(){return this._player.getPosition()/1e3},seekTo:function(e){this._player.seekTo(1e3*e)},setVolume:function(e){this._player.setVolume(e)},remove:function(){this._element.remove()},_triggerFinish:function(){this._finishTriggered||this.trigger("finish"),this._finishTriggered=!0}};var i=function(t,i){new e(this);var n=this,r="vimeo-"+Math.round(1e5*Math.random()),s=document.createElement("iframe");s.id=r,s.src="http://player.vimeo.com/video/"+t.split(".com/")[1]+"?api=1&player_id="+r,i?i.appendChild(s):(s.style.display="none",document.body.appendChild(s)),this._player=$f(s),this._element=s,n._player.addEvent("ready",function(){n.trigger("ready"),["play","pause","seek","finish"].forEach(function(e){n._player.addEvent(e,function(){n._player.api("getCurrentTime",function(t){n.trigger(e,t)})})})})};i.prototype={play:function(){this._player.api("play")},pause:function(){this._player.api("pause")},seekTo:function(e){this._player.api("seekTo",e)},setVolume:function(e){this._player.api("setVolume",e)},remove:function(){this._element.remove()}};var n=function(t,i){new e(this);var n=this,r="youtube-"+Math.round(1e5*Math.random());this._element=document.createElement("div"),this._element.id=r,i?i.appendChild(this._element):(this._element.style.display="none",document.body.appendChild(this._element));var s=this._player=new YT.Player(r,{videoId:t.split("?v=")[1]});s.addEventListener("onReady",function(){n.trigger("ready")}),s.addEventListener("onError",function(){n.trigger("error")});var a={};a[YT.PlayerState.PLAYING]="play",a[YT.PlayerState.PAUSED]="pause",a[YT.PlayerState.ENDED]="finish",s.addEventListener("onStateChange",function(e){a[e.data]&&n.trigger(a[e.data],s.getCurrentTime())}),window.onYoutubePlayerReady=function(e){r==e&&(n.ready=!0,n.trigger("ready"))}};n.prototype={ready:!1,play:function(){this._player.playVideo()},pause:function(){this._player.pauseVideo()},seekTo:function(e){this._player.seekTo(e)},setVolume:function(e){this._player.setVolume(100*e)},remove:function(){this._player.getIframe().remove(),this._element.remove()}};var r=function(t){new e(this),this.isPlaying=!0,this.volume=1,this.seekTime=0,this._container=t,this._player=null,this._playerReady=!1,this._queue=[];var i=this;this.on("finish",function(){i.skip()})};r.prototype={queue:function(e,t){return this._queue.push({type:encodeURI(e),url:t}),null==this._player&&this.skip(),this},play:function(e){return this.isPlaying&&void 0===e?void 0:(this.isPlaying=!0,this._playerReady&&(void 0!==e&&this.seekTo(e),this._player.play()),this)},pause:function(e){return this.isPlaying=!1,this._playerReady&&(void 0!==e&&this.seekTo(e),this._player.pause()),this},seekTo:function(e){return this.seekTime=e,this._playerReady&&this._player.seekTo(e),this},skip:function(){this._player&&(this.trigger("skip"),this._player.remove());var e=this._queue.pop();return e?this._createPlayer(e):this._player=null,this},setVolume:function(e){this.volume=e,this._playerReady&&this._player.setVolume(e)},mute:function(){this.prevVolume=this.prevVolume||this.volume,this.setVolume(0)},unmute:function(){this.setVolume(this.prevVolume),this.prevVolume=void 0},remove:function(){this._playerReady&&this._player.remove()},_createPlayer:function(e){var r=this;this._player=new{youtube:n,vimeo:i,soundcloud:t}[e.type](e.url,this._container),this._playerReady=!1,this.seekTime=0,this._player.on("ready",function(){r._initPlayer()})},_initPlayer:function(){var e=this;this._playerReady=!0,this._player.on("all",function(){e.trigger.apply(this,arguments)}),this.seekTo(this.seekTime),this.isPlaying?this._player.play():this._player.pause(),this._player.setVolume(this.volume)}},window.Nacho=r}();
!function(){var requirejs,require,define,__inflate;!function(e){function n(e,n){var t,r,i,o,s,u,a,c=n&&n.split("/"),l=p.map,f=l&&l["*"]||{};if(e&&"."===e.charAt(0)&&n){for(c=c.slice(0,c.length-1),e=c.concat(e.split("/")),s=0;a=e[s];s++)if("."===a)e.splice(s,1),s-=1;else if(".."===a){if(1===s&&(".."===e[2]||".."===e[0]))return!0;s>0&&(e.splice(s-1,2),s-=2)}e=e.join("/")}if((c||f)&&l)for(t=e.split("/"),s=t.length;s>0;s-=1){if(r=t.slice(0,s).join("/"),c)for(u=c.length;u>0;u-=1)if(i=l[c.slice(0,u).join("/")],i&&(i=i[r])){o=i;break}if(o=o||f[r]){t.splice(0,s,o),e=t.join("/");break}}return e}function t(n,t){return function(){return c.apply(e,E.call(arguments,0).concat([n,t]))}}function r(e){return function(t){return n(t,e)}}function i(e){return function(n){l[e]=n}}function o(n){if(f.hasOwnProperty(n)){var t=f[n];delete f[n],d[n]=!0,a.apply(e,t)}if(!l.hasOwnProperty(n))throw new Error("No "+n);return l[n]}function s(e,t){var i,s,u=e.indexOf("!");return-1!==u?(i=n(e.slice(0,u),t),e=e.slice(u+1),s=o(i),e=s&&s.normalize?s.normalize(e,r(t)):n(e,t)):e=n(e,t),{f:i?i+"!"+e:e,n:e,p:s}}function u(e){return function(){return p&&p.config&&p.config[e]||{}}}var a,c,l={},f={},p={},d={},E=[].slice;a=function(n,r,a,c){var p,E,h,v,g,m,w=[];if(c=c||n,"string"==typeof a&&(a=__inflate(n,a)),"function"==typeof a){for(r=!r.length&&a.length?["require","exports","module"]:r,m=0;m<r.length;m++)if(g=s(r[m],c),h=g.f,"require"===h)w[m]=t(n);else if("exports"===h)w[m]=l[n]={},p=!0;else if("module"===h)E=w[m]={id:n,uri:"",exports:l[n],config:u(n)};else if(l.hasOwnProperty(h)||f.hasOwnProperty(h))w[m]=o(h);else if(g.p)g.p.load(g.n,t(c,!0),i(h),{}),w[m]=l[h];else if(!d[h])throw new Error(n+" missing "+h);v=a.apply(l[n],w),n&&(E&&E.exports!==e&&E.exports!==l[n]?l[n]=E.exports:v===e&&p||(l[n]=v))}else n&&(l[n]=a)},requirejs=require=c=function(n,t,r,i){return"string"==typeof n?o(s(n,t).f):(n.splice||(p=n,t.splice?(n=t,t=r,r=null):n=e),t=t||function(){},i?a(e,n,t,r):setTimeout(function(){a(e,n,t,r)},15),c)},c.config=function(e){return p=e,c},define=function(e,n,t){n.splice||(t=n,n=[]),f[e]=[e,n,t]},define.amd={jQuery:!0}}(),__inflate=function(name,src){var r;return eval(["r = function(a,b,c){","\n};\n//@ sourceURL="+name+"\n"].join(src)),r},define("lib/api/events",["require","exports","module"],function(e,n){n.api={LOAD_PROGRESS:"loadProgress",PLAY_PROGRESS:"playProgress",PLAY:"play",PAUSE:"pause",FINISH:"finish",SEEK:"seek",READY:"ready",OPEN_SHARE_PANEL:"sharePanelOpened",CLICK_DOWNLOAD:"downloadClicked",CLICK_BUY:"buyClicked",ERROR:"error"},n.bridge={REMOVE_LISTENER:"removeEventListener",ADD_LISTENER:"addEventListener"}}),define("lib/api/getters",["require","exports","module"],function(e,n,t){t.exports={GET_VOLUME:"getVolume",GET_DURATION:"getDuration",GET_POSITION:"getPosition",GET_SOUNDS:"getSounds",GET_CURRENT_SOUND:"getCurrentSound",GET_CURRENT_SOUND_INDEX:"getCurrentSoundIndex",IS_PAUSED:"isPaused"}}),define("lib/api/setters",["require","exports","module"],function(e,n,t){t.exports={PLAY:"play",PAUSE:"pause",TOGGLE:"toggle",SEEK_TO:"seekTo",SET_VOLUME:"setVolume",NEXT:"next",PREV:"prev",SKIP:"skip"}}),define("lib/api/api",["require","exports","module","lib/api/events","lib/api/getters","lib/api/setters"],function(e,n,t){function r(e){return!!(""===e||e&&e.charCodeAt&&e.substr)}function i(e){return!!(e&&e.constructor&&e.call&&e.apply)}function o(e){return!!e&&1===e.nodeType&&"IFRAME"===e.nodeName.toUpperCase()}function s(e){var n,t=!1;for(n in P)if(P.hasOwnProperty(n)&&P[n]===e){t=!0;break}return t}function u(e){var n,t,r;for(n=0,t=I.length;t>n&&(r=e(I[n]),r!==!1);n++);}function a(e){var n,t,r,i="";for("//"===e.substr(0,2)&&(e=window.location.protocol+e),r=e.split("/"),n=0,t=r.length;t>n&&3>n;n++)i+=r[n],2>n&&(i+="/");return i}function c(e){return e.contentWindow?e.contentWindow:e.contentDocument&&"parentWindow"in e.contentDocument?e.contentDocument.parentWindow:null}function l(e){var n,t=[];for(n in e)e.hasOwnProperty(n)&&t.push(e[n]);return t}function f(e,n,t){t.callbacks[e]=t.callbacks[e]||[],t.callbacks[e].push(n)}function p(e,n){var t,r=!0;return n.callbacks[e]=[],u(function(n){return t=n.callbacks[e]||[],t.length?(r=!1,!1):void 0}),r}function d(e,n,t){var r,i,o=c(t);return o.postMessage?(r=t.getAttribute("src").split("?")[0],i=JSON.stringify({method:e,value:n}),"//"===r.substr(0,2)&&(r=window.location.protocol+r),r=r.replace(/http:\/\/(w|wt).soundcloud.com/,"https://$1.soundcloud.com"),o.postMessage(i,r),void 0):!1}function E(e){var n;return u(function(t){return t.instance===e?(n=t,!1):void 0}),n}function h(e){var n;return u(function(t){return c(t.element)===e?(n=t,!1):void 0}),n}function v(e,n){return function(t){var r=i(t),o=E(this),s=!r&&n?t:null,u=r&&!n?t:null;return u&&f(e,u,o),d(e,s,o.element),this}}function g(e,n,t){var r,i,o;for(r=0,i=n.length;i>r;r++)o=n[r],e[o]=v(o,t)}function m(e,n,t){return e+"?url="+n+"&"+w(t)}function w(e){var n,t,r=[];for(n in e)e.hasOwnProperty(n)&&(t=e[n],r.push(n+"="+("start_track"===n?parseInt(t,10):t?"true":"false")));return r.join("&")}function b(e,n,t){var r,i,o=e.callbacks[n]||[];for(r=0,i=o.length;i>r;r++)o[r].apply(e.instance,t);(s(n)||n===L.READY)&&(e.callbacks[n]=[])}function y(e){var n,t,r,i,o;try{t=JSON.parse(e.data)}catch(s){return!1}return n=h(e.source),r=t.method,i=t.value,n&&R(e.origin)!==R(n.domain)?!1:n?(r===L.READY&&(n.isReady=!0,b(n,k),p(k,n)),r===L.PLAY&&!n.playEventFired&&(n.playEventFired=!0),r===L.PLAY_PROGRESS&&!n.playEventFired&&(n.playEventFired=!0,b(n,L.PLAY,[i])),o=[],void 0!==i&&o.push(i),b(n,r,o),void 0):(r===L.READY&&T.push(e.source),!1)}function R(e){return e.replace(x,"")}var S,_,O,A=e("lib/api/events"),P=e("lib/api/getters"),D=e("lib/api/setters"),L=A.api,N=A.bridge,T=[],I=[],k="__LATE_BINDING__",C="http://wt.soundcloud.dev:9200/",x=/^http(?:s?)/;window.addEventListener?window.addEventListener("message",y,!1):window.attachEvent("onmessage",y),t.exports=O=function(e,n,t){if(r(e)&&(e=document.getElementById(e)),!o(e))throw new Error("SC.Widget function should be given either iframe element or a string specifying id attribute of iframe element.");n&&(t=t||{},e.src=m(C,n,t));var i,s,u=h(c(e));return u&&u.instance?u.instance:(i=T.indexOf(c(e))>-1,s=new S(e),I.push(new _(s,e,i)),s)},O.Events=L,window.SC=window.SC||{},window.SC.Widget=O,_=function(e,n,t){this.instance=e,this.element=n,this.domain=a(n.getAttribute("src")),this.isReady=!!t,this.callbacks={}},S=function(){},S.prototype={constructor:S,load:function(e,n){if(e){n=n||{};var t=this,r=E(this),i=r.element,o=i.src,s=o.substr(0,o.indexOf("?"));r.isReady=!1,r.playEventFired=!1,i.onload=function(){t.bind(L.READY,function(){var e,t=r.callbacks;for(e in t)t.hasOwnProperty(e)&&e!==L.READY&&d(N.ADD_LISTENER,e,r.element);n.callback&&n.callback()})},i.src=m(s,e,n)}},bind:function(e,n){var t=this,r=E(this);return r&&r.element&&(e===L.READY&&r.isReady?setTimeout(n,1):r.isReady?(f(e,n,r),d(N.ADD_LISTENER,e,r.element)):f(k,function(){t.bind(e,n)},r)),this},unbind:function(e){var n,t=E(this);t&&t.element&&(n=p(e,t),e!==L.READY&&n&&d(N.REMOVE_LISTENER,e,t.element))}},g(S.prototype,l(P)),g(S.prototype,l(D),!0)}),window.SC=window.SC||{},window.SC.Widget=require("lib/api/api")}();
var Froogaloop=function(){function t(e){return new t.fn.init(e)}function e(t,e,n){if(!n.contentWindow.postMessage)return!1;var i=n.getAttribute("src").split("?")[0],t=JSON.stringify({method:t,value:e});"//"===i.substr(0,2)&&(i=window.location.protocol+i),n.contentWindow.postMessage(t,i)}function n(t){var e,n;try{e=JSON.parse(t.data),n=e.event||e.method}catch(i){}if("ready"==n&&!o&&(o=!0),t.origin!=l)return!1;var t=e.value,a=e.data,u=""===u?null:e.player_id;return e=u?r[u][n]:r[n],n=[],e?(void 0!==t&&n.push(t),a&&n.push(a),u&&n.push(u),0<n.length?e.apply(null,n):e.call()):!1}function i(t,e,n){n?(r[n]||(r[n]={}),r[n][t]=e):r[t]=e}var r={},o=!1,l="";return t.fn=t.prototype={element:null,init:function(t){"string"==typeof t&&(t=document.getElementById(t)),this.element=t,t=this.element.getAttribute("src"),"//"===t.substr(0,2)&&(t=window.location.protocol+t);for(var t=t.split("/"),e="",n=0,i=t.length;i>n&&3>n;n++)e+=t[n],2>n&&(e+="/");return l=e,this},api:function(t,n){if(!this.element||!t)return!1;var r=this.element,o=""!==r.id?r.id:null,l=n&&n.constructor&&n.call&&n.apply?null:n,a=n&&n.constructor&&n.call&&n.apply?n:null;return a&&i(t,a,o),e(t,l,r),this},addEvent:function(t,n){if(!this.element)return!1;var r=this.element,l=""!==r.id?r.id:null;return i(t,n,l),"ready"!=t?e("addEventListener",t,r):"ready"==t&&o&&n.call(null,l),this},removeEvent:function(t){if(!this.element)return!1;var n,i=this.element;t:{if((n=""!==i.id?i.id:null)&&r[n]){if(!r[n][t]){n=!1;break t}r[n][t]=null}else{if(!r[t]){n=!1;break t}r[t]=null}n=!0}"ready"!=t&&n&&e("removeEventListener",t,i)}},t.fn.init.prototype=t.fn,window.addEventListener?window.addEventListener("message",n,!1):window.attachEvent("onmessage",n),window.Froogaloop=window.$f=t}();
if(!window.YT)var YT={loading:0,loaded:0};if(!window.YTConfig)var YTConfig={};YT.loading||(YT.loading=1,function(){var t=[];YT.ready=function(e){YT.loaded?e():t.push(e)},window.onYTReady=function(){YT.loaded=1;for(var e=0;e<t.length;e++)try{t[e]()}catch(n){}},YT.setConfig=function(t){for(var e in t)t.hasOwnProperty(e)&&(YTConfig[e]=t[e])};var e=document.createElement("script");e.id="www-widgetapi-script",e.src="https://s.ytimg.com/yts/jsbin/www-widgetapi-vflZ_c5OA.js",e.async=!0;var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(e,n)}()),function(){function l(t){t=t.split(".");for(var e,n=h;e=t.shift();){if(null==n[e])return null;n=n[e]}return n}function m(t){var e=typeof t;if("object"==e){if(!t)return"null";if(t instanceof Array)return"array";if(t instanceof Object)return e;var n=Object.prototype.toString.call(t);if("[object Window]"==n)return"object";if("[object Array]"==n||"number"==typeof t.length&&"undefined"!=typeof t.splice&&"undefined"!=typeof t.propertyIsEnumerable&&!t.propertyIsEnumerable("splice"))return"array";if("[object Function]"==n||"undefined"!=typeof t.call&&"undefined"!=typeof t.propertyIsEnumerable&&!t.propertyIsEnumerable("call"))return"function"}else if("function"==e&&"undefined"==typeof t.call)return"object";return e}function n(t){return"string"==typeof t}function aa(t){var e=typeof t;return"object"==e&&null!=t||"function"==e}function ca(t){return t.call.apply(t.bind,arguments)}function da(t,e){if(!t)throw Error();if(2<arguments.length){var n=Array.prototype.slice.call(arguments,2);return function(){var i=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(i,n),t.apply(e,i)}}return function(){return t.apply(e,arguments)}}function q(){return q=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ca:da,q.apply(null,arguments)}function r(t,e){var n=t.split("."),i=h;n[0]in i||!i.execScript||i.execScript("var "+n[0]);for(var r;n.length&&(r=n.shift());)n.length||void 0===e?i=i[r]?i[r]:i[r]={}:i[r]=e}function t(t,e){function n(){}n.prototype=e.prototype,t.A=e.prototype,t.prototype=new n,t.U=function(t,n){return e.prototype[n].apply(t,Array.prototype.slice.call(arguments,2))}}function u(t,e){return e>t?-1:t>e?1:0}function fa(t,e){var i;t:{i=t.length;for(var r=n(t)?t.split(""):t,a=0;i>a;a++)if(a in r&&e.call(void 0,r[a],a,t)){i=a;break t}i=-1}return 0>i?null:n(t)?t.charAt(i):t[i]}function ga(){return v.concat.apply(v,arguments)}function ha(t){var e=t.length;if(e>0){for(var n=Array(e),i=0;e>i;i++)n[i]=t[i];return n}return[]}function ia(t,e,n){return 2>=arguments.length?v.slice.call(t,e):v.slice.call(t,e,n)}function ja(t){var e,n=x;for(e in n)if(t.call(void 0,n[e],e,n))return e}function oa(){var t=h.document;return t?t.documentMode:void 0}function ra(t){if(!qa[t]){for(var e=0,n=String(pa).replace(/^[\s\xa0]+|[\s\xa0]+$/g,"").split("."),i=String(t).replace(/^[\s\xa0]+|[\s\xa0]+$/g,"").split("."),r=Math.max(n.length,i.length),a=0;0==e&&r>a;a++){var o=n[a]||"",s=i[a]||"",l=RegExp("(\\d*)(\\D*)","g"),h=RegExp("(\\d*)(\\D*)","g");do{var c=l.exec(o)||["","",""],f=h.exec(s)||["","",""];if(0==c[0].length&&0==f[0].length)break;e=u(0==c[1].length?0:parseInt(c[1],10),0==f[1].length?0:parseInt(f[1],10))||u(0==c[2].length,0==f[2].length)||u(c[2],f[2])}while(0==e)}qa[t]=e>=0}}function ua(t){var e,n,i,r;if(e=document,e.querySelectorAll&&e.querySelector&&t)return e.querySelectorAll(""+(t?"."+t:""));if(t&&e.getElementsByClassName){var a=e.getElementsByClassName(t);return a}if(a=e.getElementsByTagName("*"),t){for(r={},n=i=0;e=a[n];n++){var o,s=e.className;(o="function"==typeof s.split)&&(o=0<=ea(s.split(/\s+/),t)),o&&(r[i++]=e)}return r.length=i,r}return a}function va(t,e){for(var n=0;t;){if(e(t))return t;t=t.parentNode,n++}return null}function wa(a){if(a=String(a),/^\s*$/.test(a)?0:/^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g,"@").replace(/"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g,"")))try{return eval("("+a+")")}catch(b){}throw Error("Invalid JSON string: "+a)}function xa(){}function C(t,e,n){switch(typeof e){case"string":ya(e,n);break;case"number":n.push(isFinite(e)&&!isNaN(e)?e:"null");break;case"boolean":n.push(e);break;case"undefined":n.push("null");break;case"object":if(null==e){n.push("null");break}if("array"==m(e)){var i=e.length;n.push("[");for(var r="",a=0;i>a;a++)n.push(r),C(t,e[a],n),r=",";n.push("]");break}n.push("{"),i="";for(r in e)Object.prototype.hasOwnProperty.call(e,r)&&(a=e[r],"function"!=typeof a&&(n.push(i),ya(r,n),n.push(":"),C(t,a,n),i=","));n.push("}");break;case"function":break;default:throw Error("Unknown type: "+typeof e)}}function ya(t,e){e.push('"',t.replace(za,function(t){if(t in D)return D[t];var e=t.charCodeAt(0),n="\\u";return 16>e?n+="000":256>e?n+="00":4096>e&&(n+="0"),D[t]=n+e.toString(16)}),'"')}function E(){}function F(){this.a=[],this.b={}}function Aa(t,e,n,i){var r=t.b[e];r||(r=t.b[e]=[]);var a=t.H;t.a[a]=e,t.a[a+1]=n,t.a[a+2]=i,t.H=a+3,r.push(a)}function Ba(t,e,n){var i=G;if(t=i.b[t]){var r=i.a;(t=fa(t,function(t){return r[t+1]==e&&r[t+2]==n}))&&i.F(t)}}function Da(t){if(J){J=!1;var e=h.location;if(e){var n=e.href;if(n&&(n=(n=Da(n)[3]||null)&&decodeURIComponent(n))&&n!=e.hostname)throw J=!0,Error()}}return t.match(Ca)}function Ea(t,e,n){if("array"==m(e))for(var i=0;i<e.length;i++)Ea(t,String(e[i]),n);else null!=e&&n.push("&",t,""===e?"":"=",encodeURIComponent(String(e)))}function Ha(t){return Ga[t]||(Ga[t]=String(t).replace(/\-([a-z])/g,function(t,e){return e.toUpperCase()}))}function Ja(){var t=arguments;if(1<t.length){var e=t[0];L[e]=t[1]}else for(e in t=t[0])L[e]=t[e]}function Ka(t){return"function"==m(t)&&(t=La(t)),window.setInterval(t,250)}function La(t){return t&&window.yterr?function(){try{return t.apply(this,arguments)}catch(e){var n=e;if(window&&window.yterr){var i=l("yt.www.errors.log");i?i(n,void 0):(i=("ERRORS"in L?L.ERRORS:void 0)||[],i.push([n,void 0]),Ja("ERRORS",i))}throw e}}:t}function M(t){if(t=t||window.event){for(var e in t)e in Ma||(this[e]=t[e]);if((e=t.target||t.srcElement)&&3==e.nodeType&&(e=e.parentNode),this.target=e,e=t.relatedTarget)try{e=e.nodeName&&e}catch(n){e=null}else"mouseover"==this.type?e=t.fromElement:"mouseout"==this.type&&(e=t.toElement);this.relatedTarget=e,this.clientX=void 0!=t.clientX?t.clientX:t.pageX,this.clientY=void 0!=t.clientY?t.clientY:t.pageY,this.keyCode=t.keyCode?t.keyCode:t.which,this.charCode=t.charCode||("keypress"==this.type?this.keyCode:0),this.altKey=t.altKey,this.ctrlKey=t.ctrlKey,this.shiftKey=t.shiftKey,"MozMousePixelScroll"==this.type?(this.wheelDeltaX=t.axis==t.HORIZONTAL_AXIS?t.detail:0,this.wheelDeltaY=t.axis==t.HORIZONTAL_AXIS?0:t.detail):window.opera?(this.wheelDeltaX=0,this.wheelDeltaY=t.detail):0==t.wheelDelta%120?"WebkitTransform"in document.documentElement.style?window.chrome&&0==navigator.platform.indexOf("Mac")?(this.wheelDeltaX=t.wheelDeltaX/-30,this.wheelDeltaY=t.wheelDeltaY/-30):(this.wheelDeltaX=t.wheelDeltaX/-1.2,this.wheelDeltaY=t.wheelDeltaY/-1.2):(this.wheelDeltaX=0,this.wheelDeltaY=t.wheelDelta/-1.6):(this.wheelDeltaX=t.wheelDeltaX/-3,this.wheelDeltaY=t.wheelDeltaY/-3)}}function Oa(t,e,n){return ja(function(i){return i[0]==t&&i[1]==e&&i[2]==n&&0==i[4]})}function Pa(t,e,n){if(t&&(t.addEventListener||t.attachEvent)){var i=Oa(t,e,n);if(!i){var r,i=++Na.count+"",a=!("mouseenter"!=e&&"mouseleave"!=e||!t.addEventListener||"onmouseenter"in document);r=a?function(i){return i=new M(i),va(i.relatedTarget,function(e){return e==t})?void 0:(i.currentTarget=t,i.type=e,n.call(t,i))}:function(e){return e=new M(e),e.currentTarget=t,n.call(t,e)},r=La(r),x[i]=[t,e,n,r,!1],t.addEventListener?"mouseenter"==e&&a?t.addEventListener("mouseover",r,!1):"mouseleave"==e&&a?t.addEventListener("mouseout",r,!1):"mousewheel"==e&&"MozBoxSizing"in document.documentElement.style?t.addEventListener("MozMousePixelScroll",r,!1):t.addEventListener(e,r,!1):t.attachEvent("on"+e,r)}}}function Qa(t){t&&("string"==typeof t&&(t=[t]),w(t,function(t){if(t in x){var e=x[t],n=e[0],i=e[1],r=e[3],e=e[4];n.removeEventListener?n.removeEventListener(i,r,e):n.detachEvent&&n.detachEvent("on"+i,r),delete x[t]}}))}function Ra(t){var e,n=[];for(e in t)Ea(e,t[e],n);return n[0]="",n.join("")}function Ta(){w(O,function(t){t()})}function Ua(t){var e=ha(document.getElementsByTagName("yt:"+t));t="yt-"+t;var n=document;return t=n.querySelectorAll&&n.querySelector?n.querySelectorAll("."+t):ua(t),t=ha(t),ga(e,t)}function P(t,e){return"yt:"==t.tagName.toLowerCase().substr(0,3)?t.getAttribute(e):t.dataset?t.dataset[Ha(e)]:t.getAttribute("data-"+e)}function Va(){G.I.apply(G,arguments)}function Q(t,e){this.b=e,this.o=this.a=null,this.s=this[p]||(this[p]=++ba),this.d=0,this.u=!1,this.t=[],this.h=this.g=null,this.D={};var i;if(i=document,i=n(t)?i.getElementById(t):t){if("iframe"!=i.tagName.toLowerCase()){var r=Wa(this,i);this.o=i;var a=i.parentNode;a&&a.replaceChild(r,i),i=r}if(this.a=i,this.a.id||(r=i=this.a,r=r[p]||(r[p]=++ba),i.id="widget"+r),N[this.a.id]=this,window.postMessage){this.g=new F,Xa(this),i=R(this.b,"events");for(var o in i)i.hasOwnProperty(o)&&this.addEventListener(o,i[o]);for(var s in Sa)Ya(this,s)}}}function Ya(t,e){var n=e.split(".");if(2!=!n.length){var i=n[1];t.h==n[0]&&Za(t,i)}}function T(t,e,n){n=n||[],n=Array.prototype.slice.call(n),e={event:"command",func:e,args:n},t.u?t.B(e):t.t.push(e)}function Wa(t,e){for(var n=document.createElement("iframe"),i=e.attributes,r=0,a=i.length;a>r;r++){var o=i[r].value;null!=o&&""!=o&&"null"!=o&&n.setAttribute(i[r].name,o)}n.setAttribute("frameBorder",0),n.setAttribute("allowfullscreen",1),n.setAttribute("title","YouTube "+R(t.b,"title")),(i=R(t.b,"width"))&&n.setAttribute("width",i),(i=R(t.b,"height"))&&n.setAttribute("height",i);var s=t.q();return s.enablejsapi=window.postMessage?1:0,window.location.host&&(s.origin=window.location.protocol+"//"+window.location.host),window.location.href&&w(["debugjs","debugcss"],function(t){var e;e=window.location.href;var n,i=e.search(Fa);t:{n=0;for(var r=t.length;0<=(n=e.indexOf(t,n))&&i>n;){var a=e.charCodeAt(n-1);if((38==a||63==a)&&(a=e.charCodeAt(n+r),!a||61==a||38==a||35==a))break t;n+=r+1}n=-1}0>n?e=null:(r=e.indexOf("&",n),(0>r||r>i)&&(r=i),n+=t.length+1,e=decodeURIComponent(e.substr(n,r-n).replace(/\+/g," "))),null===e||(s[t]=e)}),n.src=R(t.b,"host")+t.C()+"?"+Ra(s),n}function Xa(t){bb(t.b,t,t.s),t.d=Ka(q(t.G,t)),Pa(t.a,"load",q(function(){window.clearInterval(this.d),this.d=Ka(q(this.G,this))},t))}function Za(t,e){t.D[e]||(t.D[e]=!0,T(t,"addEventListener",[e]))}function U(){}function fb(){}function pb(){}function qb(){}function W(t){this.a=t}function rb(){var t=null;try{t=window.localStorage||null}catch(e){}this.a=t}function sb(){var t=null;try{t=window.sessionStorage||null}catch(e){}this.a=t}function tb(t){return(0==t.search("cue")||0==t.search("load"))&&"loadModule"!=t}function ub(t){return 0==t.search("get")||0==t.search("is")}function X(t){if(this.b=t||{},this.defaults={},this.defaults.host="http://www.youtube.com",this.defaults.title="",this.a=!1,t=document.getElementById("www-widgetapi-script"),this.a=!!("https:"==document.location.protocol||t&&0==t.src.indexOf("https:"))){t=[this.b,window.YTConfig||{},this.defaults];for(var e=0;e<t.length;e++)t[e].host&&(t[e].host=t[e].host.replace("http://","https://"))}}function R(t,e){for(var n=[t.b,window.YTConfig||{},t.defaults],i=0;i<n.length;i++){var r=n[i][e];if(void 0!=r)return r}return null}function bb(t,e,n){S||(S={},Pa(window,"message",q(t.d,t))),S[n]=e}function vb(t){X.call(this,t),this.defaults.title="video player",this.defaults.videoId="",this.defaults.width=640,this.defaults.height=360}function Y(t,e){Q.call(this,t,new vb(e)),this.h="player",this.k={},this.i={}}function wb(t){if("iframe"!=t.tagName.toLowerCase()){var e=P(t,"videoid");if(e){var n=P(t,"width"),i=P(t,"height");new Y(t,{videoId:e,width:n,height:i})}}}function xb(t,e){if(aa(e))for(var n in e)t.k[n]=e[n]}function yb(t,e){w(e,function(t){this[t]||(this[t]=tb(t)?function(){return this.k={},this.i={},T(this,t,arguments),this}:ub(t)?function(){var e=0;return 0==t.search("get")?e=3:0==t.search("is")&&(e=2),this.k[t.charAt(e).toLowerCase()+t.substr(e+1)]}:function(){return T(this,t,arguments),this})},t)}function zb(t){X.call(this,t),this.defaults.title="Thumbnail",this.defaults.videoId="",this.defaults.width=120,this.defaults.height=68}function Z(t,e){Q.call(this,t,new zb(e)),this.h="thumbnail"}function Ab(t){if("iframe"!=t.tagName.toLowerCase()){var e=P(t,"videoid");if(e){e={videoId:e,events:{}},e.width=P(t,"width"),e.height=P(t,"height"),e.thumbWidth=P(t,"thumb-width"),e.thumbHeight=P(t,"thumb-height"),e.thumbAlign=P(t,"thumb-align");var n=P(t,"onclick");n&&(e.events.onClick=n),new Z(t,e)}}}function Bb(t){X.call(this,t),this.defaults.host="https://www.youtube.com",this.defaults.title="upload widget",this.defaults.width=640,this.defaults.height=.67*R(this,"width")}function $(t,e){Q.call(this,t,new Bb(e))}var g,h=this,p="closure_uid_"+(1e9*Math.random()>>>0),ba=0;Function.prototype.bind=Function.prototype.bind||function(t){if(1<arguments.length){var e=Array.prototype.slice.call(arguments,1);return e.unshift(this,t),q.apply(null,e)}return q(this,t)};var v=Array.prototype,ea=v.indexOf?function(t,e,n){return v.indexOf.call(t,e,n)}:function(t,e,i){if(i=null==i?0:0>i?Math.max(0,t.length+i):i,n(t))return n(e)&&1==e.length?t.indexOf(e,i):-1;for(;i<t.length;i++)if(i in t&&t[i]===e)return i;return-1},w=v.forEach?function(t,e,n){v.forEach.call(t,e,n)}:function(t,e,i){for(var r=t.length,a=n(t)?t.split(""):t,o=0;r>o;o++)o in a&&e.call(i,a[o],o,t)},y;t:{var ka=h.navigator;if(ka){var la=ka.userAgent;if(la){y=la;break t}}y=""}var ma=-1!=y.indexOf("Opera")||-1!=y.indexOf("OPR"),z=-1!=y.indexOf("Trident")||-1!=y.indexOf("MSIE"),A=-1!=y.indexOf("Gecko")&&-1==y.toLowerCase().indexOf("webkit")&&!(-1!=y.indexOf("Trident")||-1!=y.indexOf("MSIE")),na=-1!=y.toLowerCase().indexOf("webkit"),pa=function(){var t,e="";return ma&&h.opera?(e=h.opera.version,"function"==m(e)?e():e):(A?t=/rv\:([^\);]+)(\)|;)/:z?t=/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/:na&&(t=/WebKit\/(\S+)/),t&&(e=(e=t.exec(y))?e[1]:""),z&&(t=oa(),t>parseFloat(e))?String(t):e)}(),qa={},sa=h.document,ta=sa&&z?oa()||("CSS1Compat"==sa.compatMode?parseInt(pa,10):5):void 0;if(A||z){var B;(B=z)&&(B=z&&ta>=9),B||A&&ra("1.9.1")}z&&ra("9");var D={'"':'\\"',"\\":"\\\\","/":"\\/","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","	":"\\t","":"\\u000b"},za=/\uffff/.test("￿")?/[\\\"\x00-\x1f\x7f-\uffff]/g:/[\\\"\x00-\x1f\x7f-\xff]/g;E.prototype.g=!1,E.prototype.dispose=function(){this.g||(this.g=!0,this.v())},E.prototype.v=function(){if(this.h)for(;this.h.length;)this.h.shift()()},t(F,E),g=F.prototype,g.H=1,g.p=0,g.F=function(t){if(0!=this.p)this.d||(this.d=[]),this.d.push(t);else{var e=this.a[t];if(e){if(e=this.b[e]){var n=ea(e,t);n>=0&&v.splice.call(e,n,1)}delete this.a[t],delete this.a[t+1],delete this.a[t+2]}}},g.I=function(t){var e=this.b[t];if(e){this.p++;for(var n=ia(arguments,1),i=0,r=e.length;r>i;i++){var a=e[i];this.a[a+1].apply(this.a[a+2],n)}if(this.p--,this.d&&0==this.p)for(;e=this.d.pop();)this.F(e);return 0!=i}return!1},g.v=function(){F.A.v.call(this),delete this.a,delete this.b,delete this.d};var Ca=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#(.*))?$"),J=na,Fa=/#|$/,Ga={},K=l("yt.dom.getNextId_");if(!K){K=function(){return++Ia},r("yt.dom.getNextId_",K);var Ia=0}var L=window.yt&&window.yt.config_||{};r("yt.config_",L),r("yt.tokens_",window.yt&&window.yt.tokens_||{}),r("yt.msgs_",window.yt&&window.yt.msgs_||{}),g=M.prototype,g.type="",g.target=null,g.relatedTarget=null,g.currentTarget=null,g.data=null,g.keyCode=0,g.charCode=0,g.altKey=!1,g.ctrlKey=!1,g.shiftKey=!1,g.clientX=0,g.clientY=0,g.wheelDeltaX=0,g.wheelDeltaY=0;var Ma={stopImmediatePropagation:1,stopPropagation:1,preventMouseEvent:1,preventManipulation:1,preventDefault:1,layerX:1,layerY:1,scale:1,rotation:1},x=l("yt.events.listeners_")||{};r("yt.events.listeners_",x);var Na=l("yt.events.counter_")||{count:0};r("yt.events.counter_",Na);var N={},O=[],G=new F,Sa={};g=Q.prototype,g.Q=function(t,e){return this.a.width=t,this.a.height=e,this},g.P=function(){return this.a},g.J=function(t){this.j(t.event,t)},g.addEventListener=function(t,e){var n=e;return"string"==typeof e&&(n=function(){window[e].apply(window,arguments)}),Aa(this.g,t,n),Za(this,t),this},g.destroy=function(){this.a.id&&(N[this.a.id]=null);var t=this.g;if(t&&"function"==typeof t.dispose&&t.dispose(),this.o){var t=this.a,e=t.parentNode;e&&e.replaceChild(this.o,t)}else(t=this.a)&&t.parentNode&&t.parentNode.removeChild(t);S&&(S[this.s]=null),this.b=null;var n,t=this.a;for(n in x)x[n][0]==t&&Qa(n);this.o=this.a=null},g.q=function(){return{}},g.j=function(t,e){if(!this.g.g){var n={target:this,data:e};this.g.I(t,n),this.h&&Va(this.h+"."+t,n)}},g.G=function(){this.a&&this.a.contentWindow?this.B({event:"listening"}):window.clearInterval(this.d)},g.B=function(t){t.id=this.s;var e=[];C(new xa,t,e),t=e.join("");var n,e=this.b,i=Da(this.a.src);n=i[1];var r=i[2],a=i[3],i=i[4],o="";n&&(o+=n+":"),a&&(o+="//",r&&(o+=r+"@"),o+=a,i&&(o+=":"+i)),n=o,e.a&&0==n.indexOf("http:")&&(n=n.replace("http:","https:")),this.a.contentWindow.postMessage(t,n)};var cb="StopIteration"in h?h.StopIteration:Error("StopIteration");U.prototype.next=function(){throw cb},U.prototype.b=function(){return this};var db="corp.google.com googleplex.com youtube.com youtube-nocookie.com prod.google.com sandbox.google.com docs.google.com drive.google.com mail.google.com plus.google.com play.google.com googlevideo.com 101epmpngvqtgfsf73utp3aomcvh4be6-a-hangout-opensocial.googleusercontent.com mb33edaaot4tnevadfqhve4857kpq1rs-a-hangout-opensocial.googleusercontent.com ot5106nq9r49sc62k7h52rtfngv5j94j-a-hangout-opensocial.googleusercontent.com".split(" "),eb="";new fb,new fb;var V=y,V=V.toLowerCase();if(-1!=V.indexOf("android")&&!V.match(/android\D*(\d\.\d)[^\;|\)]*[\;\)]/)){var gb={cupcake:1.5,donut:1.6,eclair:2,froyo:2.2,gingerbread:2.3,honeycomb:3,"ice cream sandwich":4,jellybean:4.1},hb=[],ib=0,jb;for(jb in gb)hb[ib++]=jb;V.match("("+hb.join("|")+")")}var kb,lb=y,mb=lb.match(/\((iPad|iPhone|iPod)( Simulator)?;/);if(!mb||2>mb.length)kb=void 0;else{var nb=lb.match(/\((iPad|iPhone|iPod)( Simulator)?; (U; )?CPU (iPhone )?OS (\d_\d)[_ ]/);kb=nb&&6==nb.length?Number(nb[5].replace("_",".")):0}kb>=0&&0<=y.search("Safari")&&y.search("Version");var ob=l("yt.net.ping.workerUrl_")||null;r("yt.net.ping.workerUrl_",ob),t(qb,pb),t(W,qb),W.prototype.isAvailable=function(){if(!this.a)return!1;try{return this.a.setItem("__sak","1"),this.a.removeItem("__sak"),!0}catch(t){return!1}},W.prototype.b=function(t){var e=0,i=this.a,r=new U;return r.next=function(){if(e>=i.length)throw cb;var r;if(r=i.key(e++),t)return r;if(r=i.getItem(r),!n(r))throw"Storage mechanism: Invalid value was encountered";return r},r},W.prototype.key=function(t){return this.a.key(t)},t(rb,W),t(sb,W),(new rb).isAvailable(),(new sb).isAvailable();var S=null;X.prototype.d=function(t){var e;if((e=t.origin==R(this,"host"))||((e=t.origin)&&e==eb?e=!0:new RegExp("^(https?:)?//([a-z0-9-]{1,63}\\.)*("+db.join("|").replace(/\./g,".")+")(:[0-9]+)?([/?#]|$)","i").test(e)?(eb=e,e=!0):e=!1),e){var n;try{n=wa(t.data)}catch(i){return}(t=S[n.id])&&(t.u=!0,t.u&&(w(t.t,t.B,t),t.t.length=0),t.J(n))}},t(vb,X),t(Y,Q),g=Y.prototype,g.C=function(){return"/embed/"+R(this.b,"videoId")},g.q=function(){var t;if(R(this.b,"playerVars")){t=R(this.b,"playerVars");var e,n={};for(e in t)n[e]=t[e];t=n}else t={};return t},g.J=function(t){var e=t.event;switch(t=t.info,e){case"apiInfoDelivery":if(aa(t))for(var n in t)this.i[n]=t[n];break;case"infoDelivery":xb(this,t);break;case"initialDelivery":window.clearInterval(this.d),this.k={},this.i={},yb(this,t.apiInterface),xb(this,t);break;default:this.j(e,t)}},g.T=function(){var t=this.a.cloneNode(!1),e=this.k.videoData,n=R(this.b,"host");return t.src=e&&e.video_id?n+"/embed/"+e.video_id:t.src,e=document.createElement("div"),e.appendChild(t),e.innerHTML},g.S=function(t){return this.i.namespaces?t?this.i[t].options||[]:this.i.namespaces||[]:[]},g.R=function(t,e){return this.i.namespaces&&t&&e?this.i[t][e]:void 0},t(zb,X),t(Z,Q),Z.prototype.C=function(){return"/embed/"+R(this.b,"videoId")},Z.prototype.q=function(){return{player:0,thumb_width:R(this.b,"thumbWidth"),thumb_height:R(this.b,"thumbHeight"),thumb_align:R(this.b,"thumbAlign")}},Z.prototype.j=function(t,e){Z.A.j.call(this,t,e?e.info:void 0)},t(Bb,X),t($,Q),g=$.prototype,g.C=function(){return"/upload_embed"},g.q=function(){var t={},e=R(this.b,"webcamOnly");return null!=e&&(t.webcam_only=e),t},g.j=function(t,e){$.A.j.call(this,t,e),"onApiReady"==t&&T(this,"hostWindowReady")},g.K=function(){T(this,"setVideoDescription",arguments)},g.M=function(){T(this,"setVideoKeywords",arguments)},g.N=function(){T(this,"setVideoPrivacy",arguments)},g.L=function(){T(this,"setVideoDraftPrivacy",arguments)},g.O=function(){T(this,"setVideoTitle",arguments)},r("YT.PlayerState.UNSTARTED",-1),r("YT.PlayerState.ENDED",0),r("YT.PlayerState.PLAYING",1),r("YT.PlayerState.PAUSED",2),r("YT.PlayerState.BUFFERING",3),r("YT.PlayerState.CUED",5),r("YT.UploadWidgetEvent.API_READY","onApiReady"),r("YT.UploadWidgetEvent.UPLOAD_SUCCESS","onUploadSuccess"),r("YT.UploadWidgetEvent.PROCESSING_COMPLETE","onProcessingComplete"),r("YT.UploadWidgetEvent.STATE_CHANGE","onStateChange"),r("YT.UploadWidgetState.IDLE",0),r("YT.UploadWidgetState.PENDING",1),r("YT.UploadWidgetState.ERROR",2),r("YT.UploadWidgetState.PLAYBACK",3),r("YT.UploadWidgetState.RECORDING",4),r("YT.UploadWidgetState.STOPPED",5),r("YT.get",function(t){return N[t]}),r("YT.scan",Ta),r("YT.subscribe",function(t,e,n){Aa(G,t,e,n),Sa[t]=!0;for(var i in N)Ya(N[i],t)}),r("YT.unsubscribe",function(t,e,n){Ba(t,e,n)}),r("YT.Player",Y),r("YT.Thumbnail",Z),r("YT.UploadWidget",$),Q.prototype.destroy=Q.prototype.destroy,Q.prototype.setSize=Q.prototype.Q,Q.prototype.getIframe=Q.prototype.P,Q.prototype.addEventListener=Q.prototype.addEventListener,Y.prototype.getVideoEmbedCode=Y.prototype.T,Y.prototype.getOptions=Y.prototype.S,Y.prototype.getOption=Y.prototype.R,$.prototype.setVideoDescription=$.prototype.K,$.prototype.setVideoKeywords=$.prototype.M,$.prototype.setVideoPrivacy=$.prototype.N,$.prototype.setVideoTitle=$.prototype.O,$.prototype.setVideoDraftPrivacy=$.prototype.L,O.push(function(){var t=Ua("player");w(t,wb)}),O.push(function(){var t=Ua("thumbnail");w(t,Ab)}),YTConfig.parsetags&&"onload"!=YTConfig.parsetags||Ta();var Cb=l("onYTReady");Cb&&Cb();var Db=l("onYouTubeIframeAPIReady");Db&&Db();var Eb=l("onYouTubePlayerAPIReady");Eb&&Eb()}();