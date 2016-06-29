module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "jquery": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-console":0
    },
    "globals": {
        "API_URL": true,
        "google": true,
        "gapi": true,
        "Chart": true,
        "ChartUtils": true,
        "moment": true,
        "DAQI": true,
        "getDAQIStatus": true,
        "Materialize": true,
        "SENSORWEB_URL": true
    }
};
