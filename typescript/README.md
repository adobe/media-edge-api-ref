# Media Edge API - TypeScript Reference Implementation

## Getting started

### Update configurations

Go to the file ```/ts/config.ts```:
 - provide ```CONFIG_ID``` in the placeholder with datastream id that you configured before. 
(check: https://experienceleague.adobe.com/docs/experience-platform/datastreams/configure.html?lang=en)
 - add the value for ```BASE_URL``` according to our documentation.

### Build and run the project
```bash
. ~/.bashrc
nvm use v21.6.0
npm install
npm start
```

---
**NOTES**

- By default, the project will run on  ```localhost:8080```.
- Keep in mind that certain ad-blocking extensions might lead to blocked requests.

---
