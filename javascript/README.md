# Media Edge API - JavaScript Reference Implementation

## Getting started

### Update configurations

In the ```/src/js/xdm-collector-config.js``` file:
- provide ```configIdValue``` in the placeholder with datastream id that you configured before. 
(check: https://experienceleague.adobe.com/docs/experience-platform/datastreams/configure.html?lang=en)
- add the value for ```apiBaseUrl``` acording to our documentation.


### Building the project
```bash
. ~/.bashrc
nvm use v21.6.0
npm install -d
./node_modules/.bin/webpack
```

### Running the project
```bash
. ~/.bashrc
nvm use v21.6.0
./node_modules/.bin/http-server dist
```

---
**NOTES**

- By default, the project will run on ```localhost:8080```.
- Due to the limitations of ```webpack```, if you modify the code, you have to delete the generated ```dist``` folder 
and run the previous commands again.
- Keep in mind that certain ad-blocking extensions might lead to blocked requests.

---
