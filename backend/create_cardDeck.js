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

async function create_cardDeck() {
  // initialize dependencies
  const provider = new Web3.providers.WebsocketProvider(
    web3Provider,
    { clientConfig: { keepalive: true, keepaliveInterval: 5000 } });
  const web3 = new Web3(provider, { transactionConfirmationBlocks: 1 });
  const dfs = new Ipfs({ dfsConfig: ipfsConfig });

  // create runtime
  const runtime = await createDefaultRuntime(
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
    name: 'Crypto quartet',
    description: 'evan.network crypto quartet card game',
    author: 'magic (ProofOfMoin Hackathon Group)',
    version: '0.0.1',
    dbcpVersion: 2,
  };

  const cardDeck = await DigitalTwin.create(
    runtime, { accountId: runtime.activeAccount, description });
  console.log(`created new digital twin with address "${await cardDeck.getContractAddress()}"`);

  // create a container with default template
  const { card1, card2, card3, card4 } = await cardDeck.createContainers({
    card1: {},
    card2: {},
    card3: {},
    card4: {},
  });
  console.log(`container address "${await card1.getContractAddress()}"`)
  console.log(`container address "${await card2.getContractAddress()}"`)
  console.log(`container address "${await card3.getContractAddress()}"`)
  console.log(`container address "${await card4.getContractAddress()}"`)

  // add data to container
  await card1.setEntry(
    'characteristics',
    {
      name: 'Bitcoin',
      value: '9400',
      marketRank: '#1',
      issueDate: '2008-11-01',
    });

    await card2.setEntry(
    'characteristics',
    {
        name: 'Ethereum',
        value: '155',
        marketRank: '#2',
        issueDate: '2014-07-24',
    });

    await card3.setEntry(
    'characteristics',
    {
        name: 'Ripple',
        value: '0.3',
        marketRank: '#3',
        issueDate: '2013-02-02',
    });

    await card4.setEntry(
    'characteristics',
    {
        name: 'EOS',
        value: '3',
        marketRank: '#7',
        issueDate: '2017-07-02',
    });

  console.log('done');

}

create_cardDeck();