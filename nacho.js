define(
	['./wrappers/youtube', './wrappers/vimeo', './wrappers/soundcloud'],
	function(YouTube, Vimeo, SoundCloud) {
		var Nacho = function(container) {
			var self = this;
			this._container = container;
			this.on('finish', function() {
				self.skip();
			});
		};
		var allEvents = ['play', 'pause', 'seek', 'skip', 'finish'];

		Nacho.prototype = {
			isPlaying: true,
			volume: 1,
			queue: function(type, url) {
				this._queue.push({type: encodeURI(type), url: url});
				if (this._player == null) this.skip();

				return this;
			},
			play: function(seconds) {
				this.isPlaying = true;
				if (this._player) {
					if (seconds !== undefined) this.seekTo(seconds);
					this._player.play();
				}

				return this;
			},
			pause: function(seconds) {
				this.isPlaying = false;
				if (this._player) {
					if (seconds !== undefined) this.seekTo(seconds);
					this._player.pause();
				}

				return this;
			},
			seekTo: function(seconds) {
				if (this._player) this._player.seekTo(seconds);

				return this;
			},
			skip: function() {
				if (this._player) {
					this.trigger('skip');
					this._player.remove();
				}

				var item = this._queue.pop();

				if (item) {
					this._player = new {
						'youtube': YouTube,
						'vimeo': Vimeo,
						'soundcloud': SoundCloud
					}[item.type](item.url, this._container);

					var self = this;
					this._player.on('ready', function() {
						self._attachListeners();
						if (self.isPlaying) self._player.play();
						else self._player.pause();

						self._player.setVolume(self.volume);
					});
				} else this._player = null;

				return this;
			},
			setVolume: function(volume) {
				this.volume = volume;
				if (this._player) this._player.setVolume(volume);
			},
			mute: function() {
				this.prevVolume = this.prevVolume || this.volume;
				this.setVolume(0);
			},
			unmute: function() {
				this.setVolume(this.prevVolume);
				this.prevVolume = null;
			},
			on: function(eventName, callback) {
				var events = eventName.split(' ');
				if (eventName == 'all') {
					for (var i = 0; i < allEvents.length; i++) {
						this.on(allEvents[i], callback);
					}
				} else if (eventName == 'skip') this._skipListeners.push(callback);
				else if (events.length == 1) {
					if (this._player) this._player.on(eventName, callback);

					if (!this._listeners[eventName]) this._listeners[eventName] = [];
					this._listeners[eventName].push(callback);
				} else for (var i = 0; i < events.length; i++) this.on(events[i], callback);

				return this;
			},
			trigger: function(eventName) {
				var listeners = eventName == 'skip' ? this._skipListeners : this._listeners[eventName];
				if (listeners) for (var i = 0; i < listeners.length; i++) listeners[i]({type: eventName});
			},
			remove: function() {
				if (this._player) this._player.remove();
			},
			_container: null,
			_player: null,
			_queue: [],
			_listeners: {},
			_skipListeners: [],
			_attachListeners: function() {
				for (var eventName in this._listeners) {
					var callbacks = this._listeners[eventName];
					for (var i = 0; i < callbacks.length; i++) this._player.on(eventName, callbacks[i]);
				}
			}
		};

		return Nacho;
	}
);