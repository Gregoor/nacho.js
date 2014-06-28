define(function() {
	var Listenable = function(obj) {
		var self = this;
		this.obj = obj;

		['on', 'trigger', 'forkListeners'].forEach(function(method) {
			if (obj[method]) throw 'Method name collision: ' + method;
			obj[method] = function() {
				return self[method].apply(self, arguments);
			};
		});
	};

	Listenable.prototype = {
		on: function(eventName, callback) {

			if (typeof eventName == 'string') { // in case of an eventMap
				var events = eventName.split(' ');

				if (events.length == 1) {
					if (!this._listeners[eventName]) this._listeners[eventName] = [];
					this._listeners[eventName].push(callback);
				} else for (var j = 0; j < events.length; j++) this.on(events[j], callback);
			} else {
				var eventMap = eventName;
				events = Object.keys(eventMap);
				for (var i = 0; i < events.length; i++) {
					var event = events[i],
						callbacks = eventMap[event];

					if (typeof callbacks != 'object') callbacks = [callbacks];

					for (var j = 0; j < callbacks.length; j++) this.on(event, callbacks[j]);
				}
			}

			return this.obj;
		},
		trigger: function(eventName) {
			var listeners = this._listeners[eventName].concat(this._listeners['all']);
			if (listeners) for (var i = 0; i < listeners.length; i++) {
				listeners[i].apply(this.obj, Array.prototype.slice.call(arguments, 1));
			}

			return this.obj;
		},
		forkListeners: function(eventName) {
			if (eventName == 'all' || !eventName) return this._listeners;

			var listeners = {};
			for (var i = 0; i < arguments.length; i++) {
				var curEvent = arguments[i];
				listeners[curEvent] = this._listeners[curEvent];
			}
			return listeners;
		},
		_listeners: {}
	};

	return Listenable;
});