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


  const { card1, card2, card3, card4, card5, card6, card7, card8, card9, card10,
          card11, card12, card13, card14, card15, card16, card17, card18, card19, card20
    } = await cardDeck.createContainers({
    card1: {},
    card2: {},
    card3: {},
    card4: {},
    card5: {},
    card6: {},
    card7: {},
    card8: {},
    card9: {},
    card10: {},
    card11: {},
    card12: {},
    card13: {},
    card14: {},
    card15: {},
    card16: {},
    card17: {},
    card18: {},
    card19: {},
    card20: {},
  });

  console.log(`card1 container address: "${await card1.getContractAddress()}"`);
  console.log(`card2 container address: "${await card2.getContractAddress()}"`);
  console.log(`card3 container address: "${await card3.getContractAddress()}"`);
  console.log(`card4 container address: "${await card4.getContractAddress()}"`);
  console.log(`card5 container address: "${await card5.getContractAddress()}"`);
  console.log(`card6 container address: "${await card6.getContractAddress()}"`);
  console.log(`card7 container address: "${await card7.getContractAddress()}"`);
  console.log(`card8 container address: "${await card8.getContractAddress()}"`);
  console.log(`card9 container address: "${await card9.getContractAddress()}"`);
  console.log(`card10 container address: "${await card10.getContractAddress()}"`);
  console.log(`card11 container address: "${await card11.getContractAddress()}"`);
  console.log(`card12 container address: "${await card12.getContractAddress()}"`);
  console.log(`card13 container address: "${await card13.getContractAddress()}"`);
  console.log(`card14 container address: "${await card14.getContractAddress()}"`);
  console.log(`card15 container address: "${await card15.getContractAddress()}"`);
  console.log(`card16 container address: "${await card16.getContractAddress()}"`);
  console.log(`card17 container address: "${await card17.getContractAddress()}"`);
  console.log(`card18 container address: "${await card18.getContractAddress()}"`);
  console.log(`card19 container address: "${await card19.getContractAddress()}"`);
  console.log(`card20 container address: "${await card20.getContractAddress()}"`);


  // add data to container
  await card1.setEntry(
    'attribute',
    {
      "Name": "Bitcoin",
      "MarketCap": "187156716235", //$
      "Price": "10443.39", //$
      "Rank": 1,
      "IssueDate": "2008-11-01",
      "TwitterFollowers": "978200",
      "Id": 1
    }
  );

  await card2.setEntry(
    'attribute',
    {
      "Name": "Ethereum",
      "MarketCap": "18758687888", //$
      "Price": "174.27", //$
      "Rank": 2,
      "IssueDate": "2014-07-24",
      "TwitterFollowers": "447900",
      "Id": 2
    }
  );

  await card3.setEntry(
    'attribute',
    {
      "Name": "XRP",
      "MarketCap": "11133991363", //$
      "Price": "0.26", //$
      "Rank": 3,
      "IssueDate": "2013-02-02",
      "TwitterFollowers": "938000",
      "Id": 3
    }
  );

  await card4.setEntry(
    'attribute',
    {
      "Name": "Bitcoin Cash",
      "MarketCap": "5316132970", //$
      "Price": "295.50", //$
      "Rank": 4,
      "IssueDate": "2017-08-01",
      "TwitterFollowers": "978100",
      "Id": 4
    }
  );

  await card5.setEntry(
    'attribute',
    {
      "Name": "LiteCoin",
      "MarketCap": "4331263774", //$
      "Price": "68.53", //$
      "Rank": 5,
      "IssueDate": "2011-10-07",
      "TwitterFollowers": "451930",
      "Id": 5
    }
  );

  await card6.setEntry(
    'attribute',
    {
      "Name": "Tether",
      "MarketCap": "4069905958", //$
      "Price": "1.00", //$
      "Rank": 6,
      "IssueDate": "2015-03-06",
      "TwitterFollowers": "34340",
      "Id": 6
    }
  );

  await card7.setEntry(
    'attribute',
    {
      "Name": "Binance Coin",
      "MarketCap": "3511935336", //$
      "Price": "22.58", //$
      "Rank": 7,
      "IssueDate": "2017-07-01",
      "TwitterFollowers": "1032129",
      "Id": 7
    }
  );

  await card8.setEntry(
    'attribute',
    {
      "Name": "EOS",
      "MarketCap": "3098263029", //$
      "Price": "3.33", //$
      "Rank": 8,
      "IssueDate": "2017-06-01",
      "TwitterFollowers": "0",
      "Id": 8
    }
  );

  await card9.setEntry(
    'attribute',
    {
      "Name": "Bitcoin SV",
      "MarketCap": "2366806513", //$
      "Price": "132.56", //$
      "Rank": 9,
      "IssueDate": "2018-11-15",
      "TwitterFollowers": "2228",
      "Id": 9
    }
  );

  await card10.setEntry(
    'attribute',
    {
      "Name": "Monero",
      "MarketCap": "1335236173", //$
      "Price": "77.65", //$
      "Rank": 10,
      "IssueDate": "2014-04-18",
      "TwitterFollowers": "320350",
      "Id": 10
    }
  );

  await card11.setEntry(
    'attribute',
    {
      "Name": "Stellar",
      "MarketCap": "1194494703", //$
      "Price": "0.06", //$
      "Rank": 11,
      "IssueDate": "2014-31-07",
      "TwitterFollowers": "275730",
      "Id": 11
    }
  );

  await card12.setEntry(
    'attribute',
    {
      "Name": "Cardano",
      "MarketCap": "1177107013", //$
      "Price": "0.05", //$
      "Rank": 12,
      "IssueDate": "2015-05-29",
      "TwitterFollowers": "154410",
      "Id": 12
    }
  );

  await card13.setEntry(
    'attribute',
    {
      "Name": "UNUS SED LEO",
      "MarketCap": "1066211567", //$
      "Price": "1.07", //$
      "Rank": 13,
      "IssueDate": "2019-05-20",
      "TwitterFollowers": "507930",
      "Id": 13
    }
  );

  await card14.setEntry(
    'attribute',
    {
      "Name": "Huobi Token",
      "MarketCap": "983355508", //$
      "Price": "4.00", //$
      "Rank": 14,
      "IssueDate": "2018-02-03",
      "TwitterFollowers": "125600",
      "Id": 14
    }
  );

  await card15.setEntry(
    'attribute',
    {
      "Name": "TRON",
      "MarketCap": "981221389", //$
      "Price": "0.01", //$
      "Rank": 15,
      "IssueDate": "2017-09-13",
      "TwitterFollowers": "460790",
      "Id": 15
    }
  );

  await card16.setEntry(
    'attribute',
    {
      "Name": "Ethereum Classic",
      "MarketCap": "748451158", //$
      "Price": "6.61", //$
      "Rank": 16,
      "IssueDate": "2015-07-30",
      "TwitterFollowers": "229960",
      "Id": 16
    }
  );

  await card17.setEntry(
    'attribute',
    {
      "Name": "Dash",
      "MarketCap": "745266363", //$
      "Price": "82.57", //$
      "Rank": 17,
      "IssueDate": "2014-01-18",
      "TwitterFollowers": "319290",
      "Id": 17
    }
  );

  await card18.setEntry(
    'attribute',
    {
      "Name": "IOTA",
      "MarketCap": "658575184", //$
      "Price": "0.23", //$
      "Rank": 18,
      "IssueDate": "2016-07-11",
      "TwitterFollowers": "120120",
      "Id": 18
    }
  );

  await card19.setEntry(
    'attribute',
    {
      "Name": "Tezos",
      "MarketCap": "650474011", //$
      "Price": "0.98", //$
      "Rank": 19,
      "IssueDate": "2017-07-01",
      "TwitterFollowers": "44410",
      "Id": 19
    }
  );

  await card20.setEntry(
    'attribute',
    {
      "Name": "NEO",
      "MarketCap": "641068648", //$
      "Price": "9.09", //$
      "Rank": 20,
      "IssueDate": "2014-02-01",
      "TwitterFollowers": "323830",
      "Id": 20
    }
  );

  console.log('done');
}

create_cardDeck();