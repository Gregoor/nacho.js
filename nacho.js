define(
	['./src/lib/listenable', './src/youtube', './src/vimeo', './src/soundcloud'],
	function(Listenable, YouTube, Vimeo, SoundCloud) {
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
				this.prevVolume = null;
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

		return Nacho;
	}
);