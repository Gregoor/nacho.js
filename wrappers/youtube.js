define(
	['../lib/listenable.js', './players/youtube'],
	function(Listenable) {
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
				videoId: url.split('?v=')[1],
				playerVars: {
					controls: 0
				}
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
			},
			_player: null,
			_element: null
		};

		return YouTube;
	}
);