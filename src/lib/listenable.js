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
				if (events.length == 1) this._addListener(eventName, callback, 'single');
				else for (var i = 0; i < events.length; i++) {
					this._addListener(events[i], callback, 'multi');
				}
			} else this._onMap(eventName);

			return this.obj;
		},
		_addListener: function(eventName, callback, type) {
			if (!this._listeners[eventName]) this._listeners[eventName] = [];
			this._listeners[eventName].push({callback: callback, type: type});
		},
		_onMap: function(eventMap) {
			var events = Object.keys(eventMap);
			for (var j = 0; j < events.length; j++) {
				var event = events[j],
					callbacks = eventMap[event];

				if (typeof callbacks != 'object') callbacks = [callbacks];

				for (var k = 0; k < callbacks.length; k++) if (callbacks[k]) {
					this._addListener(event, callbacks[k], 'single');
				}
			}
		},
		trigger: function(eventName) {
			if (eventName == 'all') throw 'Triggering all events is an anti-pattern because \n';
			var eventListeners	=	this._listeners[eventName],
				allListeners	=	this._listeners['all'];

			if (eventListeners) for (var i = 0; i < eventListeners.length; i++) {
				var listener = eventListeners[i];
				this._triggerCallback(listener.callback, arguments, listener.type == 'multi');
			}

			if (allListeners) for (var j = 0; j < allListeners.length; j++) {
				this._triggerCallback(allListeners[j].callback, arguments, true);
			}

			return this.obj;
		},
		_triggerCallback: function(callback, args, withEventName) {
			callback.apply(this.obj, Array.prototype.slice.call(args, withEventName ? 0 : 1));
		}
	};

	return Listenable;
});