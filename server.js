'use strict';

const line = require('@line/bot-sdk');
const express = require('express');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'sticker') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  let url = 'https://stickershop.line-scdn.net/stickershop/v1/sticker/'+event.message.stickerId+'/iPhone/sticker_key@2x.png'

  sendEmoji(url);
  //createEmoji(url);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

//---------------------これ以下Discord------------------------------//

const Discord = require('discord.js');
const client_dis = new Discord.Client();

var fs = require('fs');
var emojis = JSON.parse(fs.readFileSync('./memo.json', 'utf8'));

client_dis.on('ready', () => {
    console.log(`Logged in as ${client_dis.user.tag}!`);
});

client_dis.on('disconnect', () => {
  console.log(`Logged in as ${client_dis.user.tag}!`);
  fs.writeFileSync('./memo.json', JSON.stringify(emojis));
});

client_dis.on('message', msg => {
    if(msg.author.bot) return;
    var str = msg.content.split(' ');
    switch(str[0]){
      case '/add':
        emojis[str[2]]=str[1];
        msg.reply(str[1]);
        fs.writeFileSync('./memo.json', JSON.stringify(emojis));
        break;
      case '/find':
        for (let key in emojis) {
          if(emojis[key]===str[1]){
            msg.reply(key);
            break;
          }
        }
        break;
      case 's':
        sendEmoji(emojis[str[1]]);
        break;
    }
});

function createEmoji(url){
    //client_dis.channels.cache.get('602424007530119171').send('メッセージ');
    let guild_id = '602415458947301383';
    let guild = client_dis.guilds.cache.get(guild_id);
    guild.createEmoji(url, id+'_LINE')
  .then(emoji => console.log(`Created new emoji with name ${emoji.name}`))
  .catch(console.error);
}

function sendEmoji(url){
    client_dis.channels.cache.get('602424007530119171').send(url);
}

// Discordへの接続
client_dis.login(process.env.BOT_TOKEN);