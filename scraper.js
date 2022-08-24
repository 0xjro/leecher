let lastMessageId = null;

async function getLatestMessage(start = 0) {
  const latestMessages = document.querySelector("ol[data-list-id='chat-messages']").children;

  let beginning = latestMessages.length - (2 + start);
  const contents = latestMessages[beginning];

  lastMessageId = contents.id;
  let timestamp = null;
  try {
    timestamp = contents.children[0].children[0].children[1].children[1].children[0].attributes.datetime.value;
  } catch (e) {
    try {
      timestamp = contents.children[0].children[0].children[0].children[0].attributes.datetime.value;
    } catch (e) {
      // replies
    }
  }

  let messageDetails = contents.innerText.split('\n');
  let username = null;
  if (messageDetails[1] === " — ") {
    username = messageDetails[0];
  } else if (messageDetails[1] == 'BOT') {
    username = `${messageDetails[0]} - BOT`
  } else {
    let start = beginning;
    start--;
    while(username === null) {
      let previousMessage = latestMessages[start];
      let previousMessageDetails = previousMessage.innerText.split('\n');
      if (previousMessageDetails[1] === " — ") {
        username = previousMessageDetails.shift();
      }
      start--;
    }
  }

  let message = messageDetails.slice(3).join('\n');
  let readableTimestamp = `${new Date(timestamp).toLocaleDateString()} - ${new Date(timestamp).toLocaleTimeString()}`;


  var information = { embeds: [{ title: username, description: message }], content: readableTimestamp};

  const relayServer = 'http://127.0.0.1:31337/leech';

  await fetch(relayServer, {method: 'POST', body: JSON.stringify(information), headers: new Headers({'Content-type': 'application/json', 'accept': 'application/json'})});
}

setInterval(async () => {
  // debugger;
  if (!lastMessageId) {
    return getLatestMessage();
  } 
  const latestMessages = document.querySelector("ol[data-list-id='chat-messages']").children;
  let lastMessage = latestMessages[latestMessages.length - 2];
  if (lastMessage.id == lastMessageId) {
    return;
  } else {
    let count = 0;
    const latestMessages = document.querySelector("ol[data-list-id='chat-messages']").children;
    let start = latestMessages.length - 3;
    let contents = latestMessages[start];
    while (contents.id !== lastMessageId) {
      contents = latestMessages[start];
      count++;
      start--;
    }
    while (count >= 0) {
      await getLatestMessage(count);
      count--;
    }
  }
}, 5000);