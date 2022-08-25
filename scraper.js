// Top level message ID to identify last message sent to relay channel
let lastMessageId = null;
let intervalId = null;
let LAST_MESSAGE_POSITION = 2;

function _getTimestampAndReply(contents) {
  let timestamp = null;
  let isReply = false;
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
      }
    }
  }
  return { timestamp, isReply };
}

function _getUsername(isReply, detailsList, messagesList) {
  let username = null;
  if (isReply) {
    username = `${detailsList[2]} replying to ${detailsList[0]}`;
    detailsList = detailsList.slice(2);
  } else if (detailsList[1] === " — ") {
    username = detailsList[0];
  } else if (detailsList[1] == 'BOT') {
    username = `${detailsList[0]} - BOT`
  } else {
    let start = lastMessageSent;
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

function getLatestMessage(start = LAST_MESSAGE_POSITION, cb = () => {}) {
  const currentChannelMessages = _getCurrentChannelMessages();
  let lastMessageSent = currentChannelMessages.length - start;
  const lastMessageContents = currentChannelMessages[lastMessageSent];

  lastMessageId = lastMessageContents.id;
  const { timestamp, isReply } = _getTimestampAndReply(lastMessageContents);

  const messageDetailsList = lastMessageContents.innerText.split('\n');
  // `innerText` has no context of emoji or uploaded picture
  if (messageDetailsList.length === 3) {
    messageDetailsList.push('emoji and/or picture');
  }
  
  const username = _getUsername(isReply, messageDetailsList, currentChannelMessages)
  _sendMessageToServer(username, messageDetailsList, timestamp, cb);
}

async function leeeeeech() {
  if (!lastMessageId) {
    getLatestMessage(LAST_MESSAGE_POSITION);
    intervalId = setTimeout(leeeeeech, 5000);
    return;
  }
  const currentChannelMessages = _getCurrentChannelMessages();
  let lastMessage = currentChannelMessages[currentChannelMessages.length - LAST_MESSAGE_POSITION];
  if (lastMessage.id == lastMessageId) {
    intervalId = setTimeout(leeeeeech, 5000);
    return;
  } else {
    clearInterval(intervalId);
    let count = 2;
    const currentChannelMessages = document.querySelector("ol[data-list-id='chat-messages']").children;
    let start = currentChannelMessages.length - 3;
    let contents = currentChannelMessages[start];
    while (contents.id !== lastMessageId) {
      contents = currentChannelMessages[start];
      count++;
      start--;
    }

    const runLatestMessage = () => {
      if (count >= 2) {
        getLatestMessage(count, () => {
          count--;
          setTimeout(runLatestMessage, 1000);
          // runLatestMessage();
        });
      } else {
        intervalId = setTimeout(leeeeeech, 5000);
      }
    }
    runLatestMessage();
  }
};

leeeeeech();