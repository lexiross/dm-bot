const slack = require("slack");
const bot   = slack.rtm.client();
const token = process.env.SLACK_TOKEN;

const BOT_USER_ID = "U47MBDHLL";
const WRITING_A_WHOLE_DAMN_ESSAY_THRESHOLD = 30000; // 30 seconds
const YOU_PROBABLY_FORGOT_YOU_WERE_TYPING_THRESHOLD = 60000; // 1 minute

function userChannelKey (user, channel) {
  return `${user}${channel}`;
}

function isDMMessage (message) {
  return /\bdm/i.test(message) && /<@U[0-9A-Z]+>/.test(message) && message.length < 30;
}

function findRecipient (message) {
  return /<@(U[0-9A-Z]+)>/.exec(message)[1];
}

function atMention (user) {
  return `<@${user}>`;
}

function sendMessage (channel, text) {
  slack.chat.postMessage({token, channel, text, as_user: true}, function(err) {
    if (err) {
      console.error("Error sending message", err);
    } else {
      console.log("Sent message:", text);
    }
  });
}

bot.message(function({user, channel, text}) {
  delete typingStartTimes[userChannelKey(user, channel)];
  if (isDMMessage(text) && user !== BOT_USER_ID) {
    sendMessage(channel, `${atMention(user)} has sent a DM to ${atMention(findRecipient(text))}! :grinning:`);
  }
});

// Log "is typing a lot"
const typingStartTimes = {};
bot.user_typing(function({user, channel, text}) {
  const key = userChannelKey(user, channel);
  const now = Date.now();

  if (!typingStartTimes[key]) {
    typingStartTimes[key] = now;
  } else if (
    now - typingStartTimes[key] > WRITING_A_WHOLE_DAMN_ESSAY_THRESHOLD
    && now - typingStartTimes[key] < YOU_PROBABLY_FORGOT_YOU_WERE_TYPING_THRESHOLD
  ) {
    delete typingStartTimes[key];
    sendMessage(channel, `${atMention(user)} is sure typing a lot! :grinning:`)
  }
});

bot.listen({token});