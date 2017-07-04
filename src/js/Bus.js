const Bus = {
	emit: function(id, params){
		this._lazyInit(id);
		this.listeners[id].forEach(function(listener){
			setTimeout(listener.listenerFunction.bind(listener.context, params), 0);
		});
	},
	listen: function(id, listenerFunction, context){
		this._lazyInit(id);
		this.listeners[id].push({listenerFunction: listenerFunction, context: context});
	},
	_lazyInit: function(id){
		if (!this.listeners){
			this.listeners = {};
		}
		if (!this.listeners[id]){
			this.listeners[id] = [];
		}
	}
}

module.exports = Bus;