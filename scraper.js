const latestMessages = document.querySelector("ol[data-list-id='chat-messages']").children;
const contents = latestMessages[latestMessages.length -2];
const timestamp = contents.children[0].children[0].children[1].children[1].children[0].attributes.datetime.value;
var information = { embeds: [{ title: 'foo', description: 'bar' }], content: 'foood'};

const relayServer = 'localhost:1337/leech';

fetch(relayServer, {method: 'POST', body: JSON.stringify(information), headers: new Headers({'Content-type': 'application/json', 'accept': 'application/json'})});
