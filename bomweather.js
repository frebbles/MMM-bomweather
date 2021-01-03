//bomweather.js:

Module.register("bomweather",{
	// Default module config.
	defaults: {
		location: "Canberra",
		locationState: "ACT",
		bomdata: '',
	        iconset: 'highcontrast',	
		animationSpeed: 1000,
		appendLocationNameToHeader: true,
                iconTable: {
                        "1": "wi-day-sunny",
                        "2": "wi-forecast-io-clear-day",
                        "3": "wi-cloudy",
                        "4": "wi-cloudy",
                        "6": "wi-day-haze",
                        "8": "wi-day-rain",
                        "9": "wi-day-windy",
                        "10": "wi-day-fog",
                        "11": "wi-day-showers",
                        "12": "wi-day-rain",
                        "13": "wi-dust",
                        "14": "wi-day-sleet",
                        "15": "wi-day-snow",
                        "16": "wi-day-thunderstorm",
                        "17": "wi-day-showers",
                        "18": "wi-day-storm-showers",
                        "19": "wi-tornado"
                },
		tableClass: "small",
		calendarClass: "calendar",
		showRainChance: "true",
		showRainAmount: "true",
		colored: "true",
		units: "metric",

	},


        // Define required scripts.
        getScripts: function () {
                return ["moment.js"];
        },

        // Define required scripts.
        getStyles: function () {
                return ["weather-icons.css", "bomweather.css"];
        },

	start: function() {
		this.forecast = [];
		this.loaded = false;
		moment.locale(config.language);
		this.updateTimer = null;

		console.log("Loading " + this.config.location + " in " + this.config.locationState);
		this.sendSocketNotification('LOAD_BOM_FORECAST', this.getUrl(this.config.locationState));
		setInterval(() => {
			this.sendSocketNotification('LOAD_BOM_FORECAST', this.getUrl(this.config.locationState));
		}, 1000 * 60 * 60);
	},
		
	// Override dom generator.
	getDom: function() {
		console.log("bomweather: Rendering");
		var wrapper = document.createElement("div");
		if (this.config.location === "" ) {
                        wrapper.innerHTML = "Please set the correct location in the config for module: " + this.name + ".";
                        wrapper.className = "dimmed light small";
                        return wrapper;
                }

                if (!this.loaded) {
                        wrapper.innerHTML = "Loading...";
                        wrapper.className = "dimmed light small";
                        return wrapper;
                }

		var showRadar = 0;
                var table = document.createElement("table");
                table.className = this.config.tableClass;
                for (var f in this.forecast) {
                        var forecast = this.forecast[f];
console.log("FORECAST " + f);
console.log(forecast);
                        var row = document.createElement("tr");
                        if (this.config.colored) {
                                row.className = "colored";
                        }
                        table.appendChild(row);

                        var dayCell = document.createElement("td");
                        dayCell.className = "day";
                        dayCell.innerHTML = forecast.day;
                        row.appendChild(dayCell);

                        var iconCell = document.createElement("td");
                        iconCell.className = "bright weather-icon";
                        row.appendChild(iconCell);

                        var icon = document.createElement("span");
                        icon.className = "wi weathericon " + this.config.iconTable[forecast.icon];
                        iconCell.appendChild(icon);

                        var degreeLabel = "";
                        if (this.config.units === "metric" || this.config.units === "imperial") {
                                degreeLabel += "°";
                        }
                        if (this.config.scale) {
                                switch (this.config.units) {
                                        case "metric":
                                                degreeLabel += "C";
                                                break;
                                        case "imperial":
                                                degreeLabel += "F";
                                                break;
                                        case "default":
                                                degreeLabel = "K";
                                                break;
                                }
                        }

                        if (this.config.decimalSymbol === "" || this.config.decimalSymbol === " ") {
                                this.config.decimalSymbol = ".";
                        }
                        var maxTempCell = document.createElement("td");
                        maxTempCell.innerHTML = forecast.maxTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
                        maxTempCell.className = "align-right bright max-temp";
                        row.appendChild(maxTempCell);

                        var minTempCell = document.createElement("td");
                        minTempCell.innerHTML = forecast.minTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
                        minTempCell.className = "align-right min-temp";
                        row.appendChild(minTempCell);

			if (this.config.showRainChance) {
				var rainCCell = document.createElement("td");
				rainCCell.innerHTML = forecast.rainChance;
				rainCCell.className = "align-right bright rain";
				row.appendChild(rainCCell);
				if ((f == 0) && (forecast.rainChance != "0%")) {
				 showRadar = 1;
				}
			}

                        if (this.config.showRainAmount) {
                                var rainCell = document.createElement("td");
                                if (!forecast.rainAmount) {
                                        rainCell.innerHTML = " ";
                                } else {
	                                rainCell.innerHTML = forecast.rainAmount;
				}
                                rainCell.className = "align-right bright rain bom-smallrma";
                                row.appendChild(rainCell);
                        }
	
                        if (this.config.fade && this.config.fadePoint < 1) {
                                if (this.config.fadePoint < 0) {
                                        this.config.fadePoint = 0;
                                }
                                var startingPoint = this.forecast.length * this.config.fadePoint;
                                var steps = this.forecast.length - startingPoint;
                                if (f >= startingPoint) {
                                        var currentStep = f - startingPoint;
                                        row.style.opacity = 1 - (1 / steps) * currentStep;
                                }
                        }
                }

                if (this.config.radarImage && showRadar) {
                        var radarImg = document.createElement("img");
                        radarImg.setAttribute("src", this.config.radarImage);
                        radarImg.setAttribute("width", "340px");
                        var radarCell = document.createElement("td");
			radarCell.setAttribute("colspan", "42");
                        radarCell.appendChild(radarImg);
                        var radarRow = document.createElement("tr");
                        radarRow.appendChild(radarCell);
                        table.append(radarRow);

                }

		console.log("bomweather: Rendering complete");
		console.log(table);
                return table;

	},

        // Override getHeader method.
        getHeader: function () {
                if (this.config.appendLocationNameToHeader) {
                        if (this.data.header) return this.data.header + " " + this.fetchedLocationName;
                        else return this.fetchedLocationName;
                }

                return this.data.header ? this.data.header : "";
        },

        /* getParams(compliments)
         * Generates an url with api parameters based on the config.
         *
         * return String - URL params.
         */
        getUrl: function () {

        switch (this.config.locationState) {
            case "ACT":
            case "NSW":
                return "http://www.bom.gov.au/fwo/IDN11060.xml";
                break;
            case "NT":
                return "http://www.bom.gov.au/fwo/IDD10207.xml";
                break;
            case "QLD":
                return "http://www.bom.gov.au/fwo/IDQ11295.xml";
                break;
            case "SA":
                return "http://www.bom.gov.au/fwo/IDS10044.xml";
                break;
            case "TAS":
                return "http://www.bom.gov.au/fwo/IDT16710.xml";
                break;
            case "VIC":
                return "http://www.bom.gov.au/fwo/IDV10753.xml";
                break;
            case "WA":
                return "http://www.bom.gov.au/fwo/IDW14199.xml";
                break;
            default:
                break;
        }

                return undefined;
        },

	parseXml: function(xmlStr) {
            return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
        },


        /* processWeather(data)
         * Uses the received data to set the various values.
         *
         * argument data object - Weather information received form openweather.org.
         */
        processWeather: function (data) {

        this.fetchedLocationName = this.config.location;
        this.forecast = [];
        var lastDay = null;
        var forecastData = {};
        var xmlDoc = this.parseXml(data);
        var areas = xmlDoc.getElementsByTagName('area');
	console.log(areas);

        for(var i=0; i<areas.length; i++){
	    
            console.log(areas[i].attributes.description.value + " == "+ this.config.location);

            if (areas[i].attributes.description.value == this.config.location) {
		console.log("Found " + this.config.location + " in dataset");
                fpdays = areas[i].getElementsByTagName('forecast-period');
		// BOM Dataset is weird, may need to iterate to skip doubled up areas
		while (fpdays.length < 1) {
		    i++;
	            fpdays = areas[i].getElementsByTagName('forecast-period');
		}
                for (var fp=0; fp<fpdays.length; fp++) {
                    var day = 0;
                    var icon = 0;
                    var maxTemp = 0;
                    var minTemp = 0;
                    var rain = 0;
		    var rainChance = 0;

                    day = moment(fpdays[fp].attributes.getNamedItem('start-time-local').value, "YYYY-MM-DD hh:mm:ss").format("ddd");
                    hour = moment(fpdays[fp].attributes.getNamedItem('start-time-local').value, "YYYY-MM-DD hh:mm:ss").format("H");
                    els = fpdays[fp].getElementsByTagName('element');

                    for (var e=0; e<els.length; e++) {
                        if (els[e].attributes.type.value == 'forecast_icon_code') {
                            icon = els[e].firstChild.data;
                        }
                        if (els[e].attributes.type.value == 'air_temperature_minimum') {
                            minTemp = els[e].firstChild.data;
                        }
                        if (els[e].attributes.type.value == 'air_temperature_maximum') {
                            maxTemp = els[e].firstChild.data;
                        }
                        if (els[e].attributes.type.value == 'precipitation_range') {
                            rain = els[e].firstChild.data;
                        }
                    }
                    els = fpdays[fp].getElementsByTagName('text');
                    for (var et=0; et<els.length; et++) {
                        if (els[et].attributes.type.value == 'probability_of_precipitation') {
                            rainChance = els[et].firstChild.data;
                        }
                    }
                    forecastData = {
                                            day: day,
                                            icon: icon,
                                            maxTemp: maxTemp?maxTemp:"-",
                                            minTemp: minTemp?minTemp:"-",
                                            rainAmount: rain,
			    		    rainChance: rainChance
                                    };
                    this.forecast.push(forecastData);
		    console.log(forecastData);

                    // Stop processing when maxNumberOfDays is reached
                    if (this.forecast.length === this.config.maxNumberOfDays) {
                        break;
                    }
                }
		this.show(this.config.animationSpeed, { lockString: this.identifier });
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
		return;
            }
        }

                //Log.log(this.forecast);
                this.show(this.config.animationSpeed, { lockString: this.identifier });
                this.loaded = true;
                this.updateDom(this.config.animationSpeed);
        },


	socketNotificationReceived: function(notification, payload) {
		if (notification === 'LOAD_BOM_FORECAST_RECEIVED') {
			this.bomdata = this.processWeather(payload);
			this.updateDom();
			console.log("Got payload");
		}
	}

});
