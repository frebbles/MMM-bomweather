== MagicMirror BOM Weather plugin

Module to display weather from the Aust. Bureau of Meteorology

Commit with bomweather as target, module name is bomweather, git repo is MMM-bomweather for consistency with MagicMirror repo's

Installation
------------
To install, run the following commands
```
cd ~/MagicMirror/modules
git clone --depth=1 https://github.com/frebbles/MMM-bomweather.git bomweather
```

It's important to name the folder `bomweather` so Magic Mirror loads it correctly.

Configuration
-------------
Add the following minimal implementation to the `config.js`
```
    {
      module: "bomweather",
      position: "top_left",
      config: {
        location: "Canberra",
        locationState: "ACT",
      }
    },
```

The location comes the place names referenced in the BOM forecast XMLs. The XML files used for each state can be found in [`bomweather/bomweather.js`](https://github.com/frebbles/MMM-bomweather/blob/079c8e56f765b6713f6ca8fa7b53632d123976b9/bomweather.js#L207).