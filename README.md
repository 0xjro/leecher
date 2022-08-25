# leeecher

observer a channel's messages and relay it to your own server via weebhook.

### instructions
- install node.js on your machine
- `npm install`
- run `node server.js` from root directory of repository
- on a chrome browser, login & open channel you'd like to leech
- open the developer tools and copy pasta `scraper.js` in the console.

the scraper will check every 5 seconds for new messages and will hit the weebhook on a 1 second throttle.

:3