const slack = require("slack");
const bot   = slack.rtm.client();
const token = process.env.SLACK_TOKEN;

const BOT_USER_ID = "U47MBDHLL";

function isDMMessage (message) {
  return /\bdm/i.test(message) && /<@U[0-9A-Z]+>/.test(message);
}

function findRecipient (message) {
  return /<@(U[0-9A-Z]+)>/.exec(message)[1];
}

function sendNagMessage (channel, sender, recipient) {
  const text = `<@${sender}> has sent a DM to <@${recipient}>! :grinning:`;
  slack.chat.postMessage({token, channel, text, as_user: true}, function(err) {
    if (err) {
      console.error("Error sending message", err);
    } else {
      console.log("Sent message:", text);
    }
  });
}

bot.message(function({user, channel, text}) {
  if (isDMMessage(text) && user !== BOT_USER_ID) {
    sendNagMessage(channel, user, findRecipient(text));
  }
});


bot.listen({token});
