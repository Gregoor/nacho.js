define(
	['./lib/listenable', './players/vimeo'],
	function(Listenable) {
		var Vimeo = function(url, container) {
			new Listenable(this);

			var self = this,
				id = 'vimeo-' + Math.round(Math.random() * 100000),
				iframe = document.createElement('iframe');
			iframe.id = id;
			iframe.src = 'http://player.vimeo.com/video/' + url.split('.com/')[1] + '?api=1&player_id=' + id;

			if (container) container.appendChild(iframe);
			else {
				iframe.style.display = 'none';
				document.body.appendChild(iframe);
			}

			this._player = $f(iframe);
			this._element = iframe;

			['play', 'pause', 'seek', 'ready', 'finish'].forEach(function(eventName) {
				self._player.addEvent(eventName, function() {
					if (eventName == 'ready') self.trigger(eventName);
					self._player.api('getCurrentTime', function(position) {
						self.trigger(eventName, position);
					})
				})
			});
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
			remove: function() {
				this._element.remove();
			}
		};

		return Vimeo;
	}
);