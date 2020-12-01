//bomweather.js:

Module.register("bomweather",{
	// Default module config.
	defaults: {
		text: "Hello World!",
		bomdata: '',

	},

	start: function() {
		this.sendSocketNotification('LOAD_BOM_FORECAST', 'http://www.bom.gov.au/fwo/IDN11060.xml');
		setInterval(() => {
			this.sendSocketNotification('LOAD_BOM_FORECAST', 'http://www.bom.gov.au/fwo/IDN11060.xml');
		}, 1000 * 60 * 60);
	},
		
	// Override dom generator.
	getDom: function() {
	        const wrapper = document.createElement('div');
		wrapper.innerHTML = this.config.text + this.bomdata;
		return wrapper;
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === 'LOAD_BOM_FORECAST_RECEIVED') {
			this.bomdata = payload;
			this.updateDom();
			console.log(payload);
		}
	}

});
