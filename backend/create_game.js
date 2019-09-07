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

  // create a container with default template
  const { player1Cards, player2Cards, cardDeck, gameLogs } = await cardDeck.createContainers({
    player1Cards: {},
    player2Cards: {},
    cardDeck: {},
    gameLogs: {},
  });
  console.log(`container address "${await player1Cards.getContractAddress()}"`)
  console.log(`container address "${await player2Cards.getContractAddress()}"`)
  console.log(`container address "${await cardDeck.getContractAddress()}"`)
  console.log(`container address "${await gameLogs.getContractAddress()}"`)

  // add data to container
  await cardDeck.setEntry(
    'characteristics',
    {
        name: 'Ripple',
        value: '0.3',
        marketRank: '#3',
        issueDate: '2013-02-02',
    });

  console.log('done');

  return game.getContractAddress();
}

create_game();