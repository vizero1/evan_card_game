// require blockchain-core dependencies
const Web3 = require('web3');

// require blockchain-core
const { Ipfs, createDefaultRuntime } = require('@evan.network/api-blockchain-core');

// ipfs configuration for evan.network testnet storage
const ipfsConfig = {host: 'ipfs.test.evan.network', port: '443', protocol: 'https'};
// web3 provider config (currently evan.network testcore)
const web3Provider = 'wss://testcore.evan.network/ws'

async function init() {
  // initialize dependencies
  const provider = new Web3.providers.WebsocketProvider(
    web3Provider,
    { clientConfig: { keepalive: true, keepaliveInterval: 5000 } });
  const web3 = new Web3(provider, null, { transactionConfirmationBlocks: 1 });
  const dfs = new Ipfs({ dfsConfig: ipfsConfig });

  // create runtime
  const runtime = await createDefaultRuntime(
    web3,
    dfs,
    {
      mnemonic: 'earth voice also distance drum dutch cloth february mixed harsh ancient wait',
      password: 'tG<\\P7~nJ}FGoD'
    }
  );
  console.dir(runtime);
}

init();