define(function() {
	var Listenable = function(obj) {
		var self = this;
		this.obj = obj;
		this._listeners = {};

		['on', 'trigger', 'forkListeners'].forEach(function(method) {
			if (obj[method]) throw 'Method name collision: ' + method;
			obj[method] = function() {
				return self[method].apply(self, arguments);
			};
		});
	};

	Listenable.prototype = {
		on: function(eventName, callback) {
			if (typeof eventName == 'string') {
				var events = eventName.split(' ');

				if (events.length == 1) {
					if (!this._listeners[eventName]) this._listeners[eventName] = [];
					this._listeners[eventName].push(callback);
				} else for (var i = 0; i < events.length; i++) this.on(events[i], callback);
			} else {
				var eventMap = eventName;
				events = Object.keys(eventMap);
				for (var j = 0; j < events.length; j++) {
					var event = events[j],
						callbacks = eventMap[event];

					if (typeof callbacks != 'object') callbacks = [callbacks];

					for (var k = 0; k < callbacks.length; k++) if (callbacks[k]) this.on(event, callbacks[k]);
				}
			}

			return this.obj;
		},
		trigger: function(eventName) {
			if (eventName == 'all') throw 'Triggering all events is an anti-pattern because \n';
			var eventListeners	=	this._listeners[eventName],
				allListeners	=	this._listeners['all'];

			if (eventListeners) for (var i = 0; i < eventListeners.length; i++) {
				eventListeners[i].apply(this.obj, Array.prototype.slice.call(arguments, 1));
			}

			if (allListeners) for (var i = 0; i < allListeners.length; i++) {
				allListeners[i].apply(this.obj, arguments);
			}

			return this.obj;
		}
	};

	return Listenable;
});