define(
	['./players/youtube'],
	function() {
		var YouTube = function(videoId) {
			var self = this,
				id = 'youtube-' + Math.round(Math.random() * 100000);

			this._element = document.createElement('div');
			this._element.id = id;
//			this._element.style.display = 'none';
			document.body.appendChild(this._element);

			this._player = new YT.Player(id, {
				videoId: videoId
			});

		};

		YouTube.prototype = {
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
			on: function(eventName, callback) {
				var self = this,
					eventCode = {
						'play': YT.PlayerState.PLAYING,
						'pause': YT.PlayerState.PAUSED,
						'finish': YT.PlayerState.ENDED
					}[eventName];

				if (eventCode !== undefined) this._player.addEventListener('onStateChange', function(e) {
					if (e.data == eventCode) {
						callback({ type: eventName, position: self._player.getCurrentTime() });
					}
				});
				else if(eventName == 'ready') this._player.addEventListener('onReady', function() {
					callback({type: eventName});
				});
			},
			remove: function() {
				this._player.destroy();
				this._element.remove();
			},
			_player: null,
			_element: null
		};

		return YouTube;
	}
);