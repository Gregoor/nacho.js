define(
	['./wrappers/youtube', './wrappers/vimeo', './wrappers/soundcloud'],
	function(YouTube, Vimeo, SoundCloud) {
		var Nacho = function(videoContainer) {
			this.on('finish', this.skip);
		};

		Nacho.prototype = {
			isPlaying: true,
			volume: 100,
			queue: function(type, url) {
				this._queue.push({type: type, url: url});
				if (this._player == null) this.skip();

				return this;
			},
			play: function() {
				this.isPlaying = true;
				if (this._player) this._player.play();

				return this;
			},
			pause: function() {
				this.isPlaying = false;
				if (this._player) this._player.pause();

				return this;
			},
			seekTo: function(seconds) {
				if (this._player) this._player.seekTo(seconds);

				return this;
			},
			skip: function() {
				this.trigger('skip');

				if (this._player) this._player.remove();

				var item = this._queue.pop();

				if (item) {
					this._player = new {
						'youtube': YouTube,
						'vimeo': Vimeo,
						'soundcloud': SoundCloud
					}[item.type](item.url);
					this._attachListeners();

					var self = this;
					this._player.on('ready', function() {
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
			on: function(eventName, callback) {
				var events = eventName.split(' ');
				if (events.length == 1) {
					if (this._player) this._player.on(eventName, callback);

					if (!this._listeners[eventName]) this._listeners[eventName] = [];
					this._listeners[eventName].push(callback);
				} else for (var i = 0; i < events.length; i++) this.on(events[i], callback);

				return this;
			},
			trigger: function(eventName) {
				var listeners = this._listeners[eventName];
				if (listeners) for (var i = 0; i < listeners.length; i++) listeners[i](eventName)
			},
			_player: null,
			_queue: [],
			_listeners: {},
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