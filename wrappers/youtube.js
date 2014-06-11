define(
	['./players/youtube'],
	function() {
		var YouTube = function(url, container) {
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
						callback({type: eventName, position: self._player.getCurrentTime()});
					}
				});
				else if(eventName == 'ready') this._player.addEventListener('onReady', function() {
					callback({type: eventName});
				});
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