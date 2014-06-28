define(
	['../lib/listenable.js', './players/vimeo'],
	function(Listenable) {
		var Vimeo = function(url, container) {
			new Listenable(this);

			var self = this,
				id = 'vimeo-' + Math.round(Math.random() * 100000),
				iframe = document.createElement('iframe');
			iframe.id = id;
			iframe.src = 'http://player.vimeo.com/video/' + url.split('.com/')[1] + '?api=1&player_id=' + id;

			if (container) container.appendChild(iframe)
			else {
				iframe.style.display = 'none';
				document.body.appendChild(iframe);
			}

			this._player = $f(iframe);
			this._element = iframe;
			this._player.addEvent('ready', function() {
				self._isReady = true;
				for (var eventName in self._unattachedListeners) {
					var listeners = self._unattachedListeners[eventName];
					for (var i = 0; i < listeners.length; i++) self.on(eventName, listeners[i]);
				}
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
			on: function(eventName, callback) {
				var self = this;
				if (!this._isReady) {
					if (!this._unattachedListeners[eventName]) this._unattachedListeners[eventName] = [];
					this._unattachedListeners[eventName].push(callback);
				} else this._player.addEvent(eventName, function(e) {
					self._player.api('getCurrentTime', function(position) {
						callback({type: eventName, position: position});
					});
				});
			},
			remove: function() {
				this._element.remove();
			},
			_isReady: false,
			_player: null,
			_element: null,
			_unattachedListeners: {}
		};

		return Vimeo;
	}
);