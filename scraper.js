// Top level message ID to identify last message sent to relay channel
let lastMessageId = null;
let intervalId = null;
const LAST_MESSAGE_POSITION = 2;
// 5 second cooldown
const COOLDOWN_INTERVAL_MS = 5000;
// 1 second throttle for sending messages to webhook
const COOLDOWN_THROTTLE_MS = 1000;

leeeeeech();

function leeeeeech() {
  if (!lastMessageId) {
    getLatestMessage(LAST_MESSAGE_POSITION);
    intervalId = setTimeout(leeeeeech, COOLDOWN_INTERVAL_MS);
    return;
  }
  const currentChannelMessages = _getCurrentChannelMessages();
  let positionToCheck = currentChannelMessages.length - LAST_MESSAGE_POSITION;
  let lastMessage = currentChannelMessages[positionToCheck];
  // Last message was already leeched
  if (lastMessage.id == lastMessageId) {
    intervalId = setTimeout(leeeeeech, COOLDOWN_INTERVAL_MS);
    return;
  // New message(s) found
  } else {
    let startOfNewMessages = _findStartOfNewMessages(currentChannelMessages, positionToCheck);
    // Recursive function to throttle messages sent to webhook
    const runLatestMessage = () => {
      if (startOfNewMessages >= LAST_MESSAGE_POSITION) {
        getLatestMessage(startOfNewMessages, () => {
          startOfNewMessages--;
          setTimeout(runLatestMessage, COOLDOWN_THROTTLE_MS);
        });
      } else {
        intervalId = setTimeout(leeeeeech, COOLDOWN_INTERVAL_MS);
      }
    }
    runLatestMessage();
  }
};

function getLatestMessage(start = LAST_MESSAGE_POSITION, cb = () => {}) {
  const currentChannelMessages = _getCurrentChannelMessages();
  let lastMessageSent = currentChannelMessages.length - start;
  const lastMessageContents = currentChannelMessages[lastMessageSent];

  lastMessageId = lastMessageContents.id;
  const { timestamp, isReply, skip } = _getTimestampAndReply(lastMessageContents);

  // new messages bar ------------------------
  if (skip) return cb();

  const messageDetailsList = lastMessageContents.innerText.split('\n');
  // `innerText` has no context of emoji or uploaded picture
  if (messageDetailsList.length === 3) {
    messageDetailsList.push('emoji and/or picture');
  }
  
  const username = _getUsername(isReply, messageDetailsList, currentChannelMessages, lastMessageSent);
  _sendMessageToServer(username, messageDetailsList, timestamp, cb);
}

function _getTimestampAndReply(contents) {
  let timestamp = null;
  let isReply = false;
  let skip = false;
  try {
    // new message from new user
    timestamp = contents.children[0].children[0].children[1].children[1].children[0].attributes.datetime.value;
  } catch (e) {
    try {
      // same user from previous message
      timestamp = contents.children[0].children[0].children[0].children[0].attributes.datetime.value;
    } catch (e) {
      // replies
      isReply = true;
      try {
        timestamp = contents.children[0].children[1].children[1].children[1].children[0].attributes.datetime.value;
      } catch (e) {
        console.log('unknown error trying to get timestamp', contents);
        if (contents.id === '---new-messages-bar') {
          skip = true;
        }
      }
    }
  }
  return { timestamp, isReply, skip };
}

function _getUsername(isReply, detailsList, messagesList, lastMessage) {
  let username = null;
  if (isReply) {
    username = `${detailsList[2]} replying to ${detailsList[0]}`;
    detailsList = detailsList.slice(2);
  } else if (detailsList[1] === " — ") {
    username = detailsList[0];
  } else if (detailsList[1] == 'BOT') {
    username = `${detailsList[0]} - BOT`
  } else {
    let start = lastMessage;
    start--;
    while(username === null) {
      let previousMessage = messagesList[start];
      let previousMessageDetails = previousMessage.innerText.split('\n');
      if (previousMessageDetails[1] === " — ") {
        username = previousMessageDetails.shift();
      }
      start--;
    }
  }
  return username;
}

function _sendMessageToServer(name, messageList, messageTimestamp, callback) {
  let message = messageList.slice(3).join('\n');
  let readableTimestamp = `${new Date(messageTimestamp).toLocaleDateString()} - ${new Date(messageTimestamp).toLocaleTimeString()}`;
  var information = { embeds: [{ title: name, description: message, footer: {text: readableTimestamp} }]};

  const relayServer = 'http://127.0.0.1:31337/leech';

  fetch(
    relayServer,
    {
      method: 'POST',
      body: JSON.stringify(information),
      headers: new Headers({'Content-type': 'application/json', 'accept': 'application/json'})
    }
  ).then(() => {
    callback();
  });
}

function _getCurrentChannelMessages() {
  return document.querySelector("ol[data-list-id='chat-messages']").children;
}

function _findStartOfNewMessages(channelMessages, position) {
  clearInterval(intervalId);
  let startOfNewMessages = LAST_MESSAGE_POSITION;
  position--;
  let currentMessage = channelMessages[position];
  if (!currentMessage.id) {
    // TODO: figure out why this might happen
    // debugger;
    // -- for now just skip
    return startOfNewMessages;
  }
  while (currentMessage.id !== lastMessageId) {
    startOfNewMessages++;
    position--;
    currentMessage = channelMessages[position];
  }
  return startOfNewMessages;
}