// require blockchain-core dependencies
const Web3 = require('web3');

// require blockchain-core
const { Ipfs, createDefaultRuntime, DigitalTwin, Container } = require('@evan.network/api-blockchain-core');

// ipfs configuration for evan.network testnet storage
const ipfsConfig = {host: 'ipfs.test.evan.network', port: '443', protocol: 'https'};
// web3 provider config (currently evan.network testcore)
const web3Provider = 'wss://testcore.evan.network/ws'

//const MNEMONIC = process.env.MNENOMIC;
//const ACCOUTPW = process.env.ACCOUNTPW;

const cardDeckTwinAddress = "0xC12748b85e24529FF691CCd0c902aDB9232897E5";
const player1ID = "0xfc0f02e112Ac3C8D49480ec7ddfc548eD687AF5a";
const player2ID = "0xfc0f02e112Ac3C8D49480ec7ddfc548eD687AF5a";

async function create_game() {
  // initialize dependencies
  const provider = new Web3.providers.WebsocketProvider(
    web3Provider,
    { clientConfig: { keepalive: true, keepaliveInterval: 5000 } });
  const web3 = new Web3(provider, { transactionConfirmationBlocks: 1 });
  const dfs = new Ipfs({ dfsConfig: ipfsConfig });

  // create runtime
  const runtime_gameMaster = await createDefaultRuntime(
    web3,
    dfs,
    {
      //mnemonic: MNEMONIC,
      //password: ACCOUNTPW
        mnemonic: 'earth voice also distance drum dutch cloth february mixed harsh ancient wait',
        password: 'tG<\\P7~nJ}FGoD'
    }
  );

  // creat a new twin with a description
  const description = {
    name: 'New crypto quartet game',
    description: 'evan.network crypto quartet card game',
    author: 'magic (ProofOfMoin Hackathon Group)',
    version: '0.0.1',
    dbcpVersion: 2,
  };

  const game = await DigitalTwin.create(
    runtime_gameMaster, { accountId: runtime_gameMaster.activeAccount, description });
  console.log(`created new digital twin 'game' with address: "${await game.getContractAddress()}"`);

  //
  const plugin = JSON.parse(JSON.stringify(Container.plugins.metadata));

  plugin.template.properties.cards = {
      dataSchema: {
          type: 'array',
          items: {
              type: 'object',
              properties: {
                  index: {
                      type: 'integer'
                  },
                  address: {
                      type: 'string'
                  },
              },
          },
      },
      permissions: { 0: ['set'] },
      type: 'list',
  };

  const cardListDescription = {
    name: 'quartetGameContainer',
    description: 'quartetGameContainer description',
    author: 'magic (ProofOfMoin Hackathon Group)',
    version: '0.0.1',
    dbcpVersion: 2,
  };

  // create a container with default template
  //const { player1cards, player2cards, cardDeckAddresses, gameLogs } = await game.createContainers({
  const { player1cards } = await game.createContainers({
    player1cards: {plugin, description: cardListDescription},
  });
  const { player2cards } = await game.createContainers({
    player2cards: {plugin, description: cardListDescription},
  });
  const { cardDeckAddresses } = await game.createContainers({
    cardDeckAddresses: {}, //use later: {plugin}
  });
  const { gameLogs } = await game.createContainers({
    gameLogs: {},
  });
  console.log('created containers');
  //console.log(`container address "${await cardDeckAddresses.getContractAddress()}"`)


  //load all cards
  const cardDeckInstance = new DigitalTwin(runtime_gameMaster, {accountId: runtime_gameMaster.activeAccount, address: cardDeckTwinAddress})
  console.log("fetching entries...");
  const cardsObject = await cardDeckInstance.getEntries();

  //console.dir(cardsObject);

  const cards = [];
  const cardNames = Object.keys(cardsObject);
  for(let i=0; i<cardNames.length; i++){
    cards.push(await cardsObject[cardNames[i]].value.getContractAddress());
  }
  console.dir(cards);


  //shuffle cards
  let shuffleCounter = cards.length;

  // While there are elements in the array
  while (shuffleCounter > 0) {
      // Pick a random index
      let index = Math.floor(Math.random() * counter);

      // Decrease counter by 1
      shuffleCounter--;

      // And swap the last element with it
      let temp = cards[shuffleCounter];
      cards[shuffleCounter] = cards[index];
      cards[index] = temp;
  }

  console.log("Cards are now shuffled:")
  console.dir(cards);


  // add data to container
  await cardDeckAddresses.addListEntries('cards', cards);
  console.dir(await cardDeckAddresses.getListEntries('cards'));


  //give access to container
  await player1cards.shareProperties([
    { accountId: player1ID, read: ['cards'] }
  ]);

  await player2cards.shareProperties([
    { accountId: player2ID, read: ['cards'] }
  ]);

  await gameLogs.shareProperties([
    { accountId: player1ID, write: ['moves'] },
    { accountId: player2ID, write: ['moves'] }
  ]);

  console.log('done');

  //return game.getContractAddress();
}

create_game();