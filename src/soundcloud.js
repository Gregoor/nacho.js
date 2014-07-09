define(
	['./lib/listenable', './players/soundcloud'],
	function(Listenable) {
		var SoundCloud = function(url) {
			new Listenable(this);

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

			iframe.style.display = 'none';
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
			getCurrentTime: function() {
				return this._player.getPosition() / 1000;
			},
			seekTo: function(seconds) {
				this.seekTo(1000 * seconds);
			},
			setVolume: function(volume) {
				this._player.setVolume(volume);
			},
			on: function(eventName, callback) {
				var self = this;
				if (eventName == 'finish') this._player.bind('playProgress', function(e) {
					if (e.relativePosition == 1) callback({type: eventName});
				});
				else this._player.bind(eventName, function(e) {
					self._player.getPosition(function(position) {
						callback({type: eventName, position: position / 1000});
					});
				});
			},
			remove: function() {
				this._element.remove();
			}
		};

		return SoundCloud;
	}
);