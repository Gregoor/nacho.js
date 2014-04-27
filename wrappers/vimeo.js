define(
	['./players/vimeo'],
	function() {
		var Vimeo = function(videoId) {
			var id = 'vimeo-' + Math.round(Math.random() * 100000),
				iframe = document.createElement('iframe');
			iframe.id = id;
			iframe.src = 'http://player.vimeo.com/video/' + videoId + '?api=1&player_id=' + id;

//			iframe.style.display = 'none';
			document.body.appendChild(iframe);

			this._player = $f(iframe);
			this._element = iframe;
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
			on: function(eventName, callback) {
				var self = this;
				this._player.addEvent(eventName, function(e) {
					callback({type: eventName, position: self._player.api('getCurrentTime')});
				});
			},
			remove: function() {
				this._element.remove();
			},
			_player: null,
			_element: null
		};

		return Vimeo;
	}
);