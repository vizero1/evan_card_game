const { DigitalTwin, Container } = require('@evan.network/api-blockchain-core');
import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';

const cardDeckTwinAddress = '0xC12748b85e24529FF691CCd0c902aDB9232897E5';

export default ({ config, runtime }) => {
  let api = Router();

  // mount the facets resource
  api.use('/facets', facets({ config, runtime }));

  // perhaps expose some API metadata at the root
  api.get('/', (req, res) => {
    res.json({ version });
  });

  api.post('/game', async (req, res) => {
    const { playerName } = req.body;

    console.log('Create game for player ' + playerName);

    // create a new twin with a description
    const description = {
      name: 'New crypto quartet game',
      description: 'evan.network crypto quartet card game',
      author: 'magic (ProofOfMoin Hackathon Group)',
      version: '0.0.1',
      dbcpVersion: 2
    };

    const game = await DigitalTwin.create(runtime, {
      accountId: runtime.activeAccount,
      description
    });
    console.log(
      `created new digital twin with address: "${await game.getContractAddress()}"`
    );

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
            }
          }
        }
      },
      permissions: { 0: ['set'] },
      type: 'list'
    };

    const cardListDescription = {
      name: 'quartetGameContainer',
      description: 'quartetGameContainer description',
      author: 'magic (ProofOfMoin Hackathon Group)',
      version: '0.0.1',
      dbcpVersion: 2
    };

    console.log('Create player1cards container');
    // create a container with default template

    const { player1cards } = await game.createContainers({
      player1cards: { plugin, description: cardListDescription }
    });
    console.log('Set properties for player1cards');
    player1cards.setEntry('username', playerName);
    player1cards.setEntry('hasTurn', true);

    console.log('Create player2cards container');
    const { player2cards } = await game.createContainers({
      player2cards: { plugin, description: cardListDescription }
    });
    console.log('Create cardDeckAddresses container');
    const { cardDeckAddresses } = await game.createContainers({
      cardDeckAddresses: {} //use later: {plugin}
    });

    console.log('Create gameLogs container');
    const { gameLogs } = await game.createContainers({
      gameLogs: {}
    });
    console.log('created containers');
    console.log(
      `container address "${await cardDeckAddresses.getContractAddress()}"`
    );

    //load all cards
    const cardDeckInstance = new DigitalTwin(runtime, {
      accountId: runtime.activeAccount,
      address: cardDeckTwinAddress
    });
    console.log('fetching entries...');
    const cardsObject = await cardDeckInstance.getEntries();

    //console.dir(cardsObject);

    const cards = [];
    const cardNames = Object.keys(cardsObject);
    for (let i = 0; i < cardNames.length; i++) {
      cards.push(await cardsObject[cardNames[i]].value.getContractAddress());
    }
    console.dir(cards);

    // //shuffle cards
    // let shuffleCounter = cards.length;

    // // While there are elements in the array
    // while (shuffleCounter > 0) {
    //   // Pick a random index
    //   let index = Math.floor(Math.random() * counter);

    //   // Decrease counter by 1
    //   shuffleCounter--;

    //   // And swap the last element with it
    //   let temp = cards[shuffleCounter];
    //   cards[shuffleCounter] = cards[index];
    //   cards[index] = temp;
    // }

    // console.log('Cards are now shuffled:');
    // console.dir(cards);

    // add data to container
    await cardDeckAddresses.addListEntries('cards', cards);

    // //give access to container
    // await player1cards.shareProperties([
    //   { accountId: player1ID, read: ['cards'] }
    // ]);

    // await player2cards.shareProperties([
    //   { accountId: player2ID, read: ['cards'] }
    // ]);

    // await gameLogs.shareProperties([
    //   { accountId: player1ID, write: ['moves'] },
    //   { accountId: player2ID, write: ['moves'] }
    // ]);

    res.json({
      playerId: await player1cards.getContractAddress(),
      gameId: await game.getContractAddress()
    });
  });

  // perhaps expose some API metadata at the root
  api.post('/join/:gameId', async (req, res) => {
    const { gameId } = req.params;
    const { playerName } = req.body;

    console.log('Getting DigitalTwin');

    const digitalTwin = await DigitalTwin(runtime, {
      accountId: runtime.activeAccount,
      address: gameId
    });

    console.log('Getting entries of DigitalTwin');
    const containers = await digitalTwin.getEntries();

    console.dir(containers);
    const { player1Cards, player2Cards } = containers;

    console.log(req.body);

    console.log(playerName, 'joins', gameId);

    res.json({
      gameId: 'Long-ID',
      playerId: 'long-player-id'
    });
  });

  // perhaps expose some API metadata at the root
  api.post('/move/:gameId', async (req, res) => {
    const { gameId } = req.params;
    const { playerId, attribute } = req.body;
    console.log(
      'Player ' + playerId + ' selected attribute ' + attribute + ' for game ',
      gameId
    );

    res.json({
      won: true
    });
  });

  // perhaps expose some API metadata at the root
  api.get('/status/:gameId', async (req, res) => {
    const { gameId } = req.params;
    const { playerId, attribute } = req.body;

    res.json({
      opponent: true,
      myTurn: true,
      card: {
        attribute: 'asdf'
      },
      attribute: ''
    });
  });

  return api;
};
