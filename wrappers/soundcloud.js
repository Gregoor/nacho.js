define(
	['./players/soundcloud'],
	function() {
		var SoundCloud = function(url) {
			var iframe = document.createElement('iframe');
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

//			iframe.style.display = 'none';
			document.body.appendChild(iframe);

			this._player = SC.Widget(iframe);
			this._element = iframe;
		};

		SoundCloud.prototype = {
			play: function() {
				this._player.play();
			},
			pause: function() {
				this._player.pause();
			},
			seekTo: function(seconds) {
				this.seekTo(1000 * seconds);
			},
			setVolume: function(volume) {
				this._player.setVolume(volume);
			},
			on: function(eventName, callback) {
				this._player.bind(eventName, callback);
			},
			remove: function() {
				this._element.remove();
			},
			_player: null,
			_element: null
		};

		return SoundCloud;
	}
);