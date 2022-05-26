const fs = require('fs');
const AltAlertBot = require('./AltAlertBot.js');

const config = JSON.parse(fs.readFileSync('./config.json'));

config.botAccounts.forEach(bot => {
  bot.botInstance = new AltAlertBot(bot.screenName, config.consumerKey, config.consumerSecret, bot.accessTokenKey, bot.accessTokenSecret, bot.infoUrl);
  console.log(`Created bot ${bot.screenName}`);
})