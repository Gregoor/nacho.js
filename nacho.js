define(
	['./lib/listenable.js', './wrappers/youtube', './wrappers/vimeo', './wrappers/soundcloud'],
	function(Listenable, YouTube, Vimeo, SoundCloud) {
		var Nacho = function(container) {
			new Listenable(this);

			var self = this;
			this._container = container;
			this.on('finish', function() {
				self.skip();
			});
		};

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
						self._player.on(self.forkListeners('play', 'pause', 'seek', 'finish'));
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
			remove: function() {
				if (this._player) this._player.remove();
			},
			_container: null,
			_player: null,
			_queue: []
		};

		return Nacho;
	}
);