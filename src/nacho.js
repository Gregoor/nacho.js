(function() {
	var Listenable = function(obj) {
		var self = this;
		this.obj = obj;
		this._listeners = {};

		['on', 'trigger', 'forkListeners'].forEach(function(method) {
			if (obj[method]) throw 'Method name collision: ' + method;
			obj[method] = function() {
				return self[method].apply(self, arguments);
			};
		});
	};

	Listenable.prototype = {
		on: function(eventName, callback) {
			if (typeof eventName == 'string') {
				var events = eventName.split(' ');
				if (events.length == 1) this._addListener(eventName, callback, 'single');
				else for (var i = 0; i < events.length; i++) {
					this._addListener(events[i], callback, 'multi');
				}
			} else this._onMap(eventName);

			return this.obj;
		},
		_addListener: function(eventName, callback, type) {
			if (!this._listeners[eventName]) this._listeners[eventName] = [];
			this._listeners[eventName].push({callback: callback, type: type});
		},
		_onMap: function(eventMap) {
			var events = Object.keys(eventMap);
			for (var j = 0; j < events.length; j++) {
				var event = events[j],
					callbacks = eventMap[event];

				if (typeof callbacks != 'object') callbacks = [callbacks];

				for (var k = 0; k < callbacks.length; k++) if (callbacks[k]) {
					this._addListener(event, callbacks[k], 'single');
				}
			}
		},
		trigger: function(eventName) {
			if (eventName == 'all') throw 'Triggering all events is an anti-pattern because \n';
			var eventListeners = this._listeners[eventName],
				allListeners = this._listeners['all'];

			if (eventListeners) for (var i = 0; i < eventListeners.length; i++) {
				var listener = eventListeners[i];
				this._triggerCallback(listener.callback, arguments, listener.type == 'multi');
			}

			if (allListeners) for (var j = 0; j < allListeners.length; j++) {
				this._triggerCallback(allListeners[j].callback, arguments, true);
			}

			return this.obj;
		},
		_triggerCallback: function(callback, args, withEventName) {
			callback.apply(this.obj, Array.prototype.slice.call(args, withEventName ? 0 : 1));
		}
	};

	var SoundCloud = function(url, container) {
		new Listenable(this);

		var self = this, iframe = document.createElement('iframe');
		iframe.id = 'soundcloud-' + Math.round(Math.random() * 100000);
		iframe.src = 'https://w.soundcloud.com/player?url=' + url +
			'&show_artwork=false' +
			'&buying=false' +
			'&liking=false' +
			'&sharing=false' +
			'&download=false' +
			'&show_comments=false' +
			'&show_user=false' +
			'&single_active=false';

		if (container) container.appendChild(iframe);
		else {
			iframe.style.display = 'none';
			document.body.appendChild(iframe);
		}

		this._player = SC.Widget(iframe);
		this._element = iframe;

		self._player.bind('ready', function() {
			self.trigger('ready');
		});

		['play', 'pause', 'seek'].forEach(function(eventName) {
			self._player.bind(eventName, function() {
				self._player.getPosition(function(position) {
					self.trigger(eventName, position / 1000);
				});
			});
		});

		this._player.bind('playProgress', function(e) {
			if (e.relativePosition == 1) self.trigger('finish');
		});
	};

	SoundCloud.prototype = {
		play: function() {
			var self = this;
			setTimeout(function() {
				self._player.play();
			}, 500);
		},
		pause: function() {
			this._player.pause();
		},
		getCurrentTime: function() {
			return this._player.getPosition() / 1000;
		},
		seekTo: function(seconds) {
			this._player.seekTo(1000 * seconds);
		},
		setVolume: function(volume) {
			this._player.setVolume(volume);
		},
		remove: function() {
			this._element.remove();
		}
	};

	var Vimeo = function(url, container) {
		new Listenable(this);

		var self = this,
			id = 'vimeo-' + Math.round(Math.random() * 100000),
			iframe = document.createElement('iframe');
		iframe.id = id;
		iframe.src = 'http://player.vimeo.com/video/' + url.split('.com/')[1] + '?api=1&player_id=' + id;

		if (container) container.appendChild(iframe);
		else {
			iframe.style.display = 'none';
			document.body.appendChild(iframe);
		}

		this._player = $f(iframe);
		this._element = iframe;

		self._player.addEvent('ready', function() {
			self.trigger('ready');
			['play', 'pause', 'seek', 'finish'].forEach(function(eventName) {
				self._player.addEvent(eventName, function() {
					self._player.api('getCurrentTime', function(position) {
						self.trigger(eventName, position);
					})
				})
			});
		});
	};

	Vimeo.prototype = {
		play: function() {
			this._player.api('play');
		},
		pause: function() {
			this._player.api('pause');
		},
		seekTo: function(seconds) {
			this._player.api('seekTo', seconds);
		},
		setVolume: function(volume) {
			this._player.api('setVolume', volume);
		},
		remove: function() {
			this._element.remove();
		}
	};

	var YouTube = function(url, container) {
		new Listenable(this);

		var self = this,
			id = 'youtube-' + Math.round(Math.random() * 100000);

		this._element = document.createElement('div');
		this._element.id = id;

		if (container) container.appendChild(this._element)
		else {
			this._element.style.display = 'none';
			document.body.appendChild(this._element);
		}

		this._player = new YT.Player(id, {
			videoId: url.split('?v=')[1]
		});

		this._player.addEventListener('onReady', function() {
			self.trigger('ready');
		});

		var events = {};
		events[YT.PlayerState.PLAYING] = 'play';
		events[YT.PlayerState.PAUSED] = 'pause';
		events[YT.PlayerState.ENDED] = 'finish';
		this._player.addEventListener('onStateChange', function(e) {
			if (events[e.data]) self.trigger(events[e.data], self._player.getCurrentTime());
		});

		window.onYoutubePlayerReady = function(playerId) {
			if (id == playerId) {
				self.ready = true;
				self.trigger('ready');
			}
		};
	};

	YouTube.prototype = {
		ready: false,
		play: function() {
			this._player.playVideo();
		},
		pause: function() {
			this._player.pauseVideo();
		},
		seekTo: function(seconds) {
			this._player.seekTo(seconds);
		},
		setVolume: function(volume) {
			this._player.setVolume(100 * volume);
		},
		remove: function() {
			this._player.getIframe().remove();
			this._element.remove();
		}
	};

	var Nacho = function(container) {
		new Listenable(this);

		this.isPlaying = true;
		this.volume = 1;
		this.seekTime = 0;
		this._container = container;
		this._player = null;
		this._playerReady = false;
		this._queue = [];

		var self = this;
		this.on('finish', function() {
			self.skip();
		});
	};

	Nacho.prototype = {
		queue: function(type, url) {
			this._queue.push({type: encodeURI(type), url: url});
			if (this._player == null) this.skip();

			return this;
		},
		play: function(seconds) {
			if (this.isPlaying && seconds === undefined) return;
			this.isPlaying = true;
			if (this._playerReady) {
				if (seconds !== undefined) this.seekTo(seconds);
				this._player.play();
			}

			return this;
		},
		pause: function(seconds) {
			this.isPlaying = false;
			if (this._playerReady) {
				if (seconds !== undefined) this.seekTo(seconds);
				this._player.pause();
			}

			return this;
		},
		seekTo: function(seconds) {
			this.seekTime = seconds;
			if (this._playerReady) this._player.seekTo(seconds);

			return this;
		},
		skip: function() {
			if (this._player) {
				this.trigger('skip');
				this._player.remove();
			}

			var item = this._queue.pop();

			if (item) this._createPlayer(item);
			else this._player = null;

			return this;
		},
		setVolume: function(volume) {
			this.volume = volume;
			if (this._playerReady) this._player.setVolume(volume);
		},
		mute: function() {
			this.prevVolume = this.prevVolume || this.volume;
			this.setVolume(0);
		},
		unmute: function() {
			this.setVolume(this.prevVolume);
			this.prevVolume = undefined;
		},
		remove: function() {
			if (this._playerReady) this._player.remove();
		},
		_createPlayer: function(item) {
			var self = this;
			this._player = new {
				'youtube': YouTube,
				'vimeo': Vimeo,
				'soundcloud': SoundCloud
			}[item.type](item.url, this._container);
			this._playerReady = false;
			this.seekTime = 0;

			this._player.on('ready', function() {
				self._initPlayer();
			});
		},
		_initPlayer: function() {
			var self = this;
			this._playerReady = true;
			this._player.on('all', function() {
				self.trigger.apply(this, arguments);
			});

			this.seekTo(this.seekTime);

			if (this.isPlaying) this._player.play();
			else this._player.pause();

			this._player.setVolume(this.volume);
		}
	};

	window.Nacho = Nacho;
})();