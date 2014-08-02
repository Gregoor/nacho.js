define(
	['./lib/listenable'],//, './players/soundcloud'],
	function(Listenable) {
		var SoundCloud = function(url) {
			new Listenable(this);

			var self = this, iframe = document.createElement('iframe');
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

			self._player.bind('ready', function() {
				self.trigger('ready');
			});

			['play', 'pause', 'seek'].forEach(function(eventName) {
				self._player.bind(eventName, function() {
					self._player.getPosition(function(position) {
						self.trigger(eventName, position / 1000);
					});
				});
			});

			this._player.bind('playProgress', function(e) {
				if (e.relativePosition == 1) self.trigger('finish');
			});
		};

		SoundCloud.prototype = {
			play: function() {
				var self = this;
				setTimeout(function() {
					self._player.play();
				}, 500);
			},
			pause: function() {
				this._player.pause();
			},
			getCurrentTime: function() {
				return this._player.getPosition() / 1000;
			},
			seekTo: function(seconds) {
				this._player.seekTo(1000 * seconds);
			},
			setVolume: function(volume) {
				this._player.setVolume(volume);
			},
			remove: function() {
				this._element.remove();
			}
		};

		return SoundCloud;
	}
);