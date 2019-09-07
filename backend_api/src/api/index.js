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
    try {
      const { playerName } = req.body;

      console.log('Creating game for player ' + playerName);

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
        `Created new digital twin with address: "${await game.getContractAddress()}"`
      );

      // const plugin = JSON.parse(JSON.stringify(Container.plugins.metadata));

      // plugin.template.properties.cards = {
      //   dataSchema: {
      //     type: 'array',
      //     items: {
      //       type: 'object',
      //       properties: {
      //         index: {
      //           type: 'integer'
      //         },
      //         address: {
      //           type: 'string'
      //         }
      //       }
      //     }
      //   },
      //   permissions: { 0: ['set'] },
      //   type: 'list'
      // };

      const cardListDescription = {
        name: 'quartetGameContainer',
        description: 'quartetGameContainer description',
        author: 'magic (ProofOfMoin Hackathon Group)',
        version: '0.0.1',
        dbcpVersion: 2
      };

      console.log('Create player1cards container');
      // create a container with default template
      //const { player1cards, player2cards, cardDeckAddresses, gameLogs } = await game.createContainers({
      const { player1cards } = await game.createContainers({
        player1cards: { description: cardListDescription } // use later { plugin }
      });
      console.log(
        'Created player1cards container with address:',
        await player1cards.getContractAddress()
      );

      console.log('Set properties for player1cards');
      player1cards.setEntry('username', playerName);
      player1cards.setEntry('hasTurn', true);

      console.log('Create player2cards container');
      const { player2cards } = await game.createContainers({
        player2cards: { description: cardListDescription } // use later { plugin }
      });
      console.log(
        'Created player2cards container with address:',
        await player2cards.getContractAddress()
      );
      player2cards.setEntry('username', '');
      player2cards.setEntry('hasTurn', false);

      console.log('Create cardDeckAddresses container');
      const { cardDeckAddresses } = await game.createContainers({
        cardDeckAddresses: {} //use later: {plugin}
      });

      console.log('Create gameLogs container');
      const { gameLogs } = await game.createContainers({
        gameLogs: {}
      });
      console.log(
        'Created gameLogs with address',
        await gameLogs.getContractAddress()
      );

      //load all cards
      const cardDeckInstance = new DigitalTwin(runtime, {
        accountId: runtime.activeAccount,
        address: cardDeckTwinAddress
      });
      console.log('Fetching cards...');
      const cardsObject = await cardDeckInstance.getEntries();

      const cards = [];
      const cardNames = Object.keys(cardsObject);
      for (let i = 0; i < cardNames.length; i++) {
        cards.push(await cardsObject[cardNames[i]].value.getContractAddress());
      }

      console.log('Shuffling cards...');
      // shuffle cards
      let shuffleCounter = cards.length;

      // While there are elements in the array
      while (shuffleCounter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * shuffleCounter);

        // Decrease counter by 1
        shuffleCounter--;

        // And swap the last element with it
        let temp = cards[shuffleCounter];
        cards[shuffleCounter] = cards[index];
        cards[index] = temp;
      }

      console.log('Add first card to player 1');
      const card1 = cards.pop();
      await player1cards.addListEntries('cards', [card1]);

      console.log('Add second card to player 2');
      const card2 = cards.pop();
      await player2cards.addListEntries('cards', [card2]);

      console.log('Add remaining cards to deck');
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
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });

  // perhaps expose some API metadata at the root
  api.post('/join/:gameId', async (req, res) => {
    try {
      const { gameId } = req.params;
      const { playerName } = req.body;

      console.log('Getting DigitalTwin for gameId', gameId);

      const digitalTwin = new DigitalTwin(runtime, {
        accountId: runtime.activeAccount,
        address: gameId
      });

      console.log('Getting entries of DigitalTwin');
      const containers = await digitalTwin.getEntries();

      const { player1cards, player2cards } = containers;
      const player1 = player1cards.value;
      const player2 = player2cards.value;

      const usernamePlayer1 = await player1.getEntry('username');
      console.log('usernamePlayer1:', usernamePlayer1, '==', playerName, '?');
      if (usernamePlayer1 == playerName) {
        console.log(usernamePlayer1, '==', playerName, '!');
        res.json({
          playerId: await player1.getContractAddress()
        });
        return;
      }

      const usernamePlayer2 = await player2.getEntry('username');
      console.log(usernamePlayer2, '==', playerName, '?');
      if (usernamePlayer2 == playerName) {
        console.log(usernamePlayer2, '==', playerName, '!');
        res.json({
          playerId: await player2.getContractAddress()
        });
        return;
      }

      if (usernamePlayer2 != '') {
        res.sendStatus(403);
        return;
      }

      await player2.setEntry('username', playerName);

      res.json({
        playerId: await player2.getContractAddress()
      });
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
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
  api.get('/status/:gameId?', async (req, res) => {
    try {
      const { gameId } = req.params;
      const { playerId } = req.query;

      console.log('Getting DigitalTwin for gameId', gameId);

      const digitalTwin = new DigitalTwin(runtime, {
        accountId: runtime.activeAccount,
        address: gameId
      });

      console.log('Getting entries of DigitalTwin');
      const containers = await digitalTwin.getEntries();

      const { player1cards, player2cards } = containers;
      const player1 = player1cards.value;
      const player2 = player2cards.value;

      const player1Address = await player1.getContractAddress();
      const player2Address = await player2.getContractAddress();

      var myCards;
      var opponentCards;
      if (player1Address == playerId) {
        myCards = player1cards;
        opponentCards = player2cards;
      } else if (player2Address == playerId) {
        myCards = player2cards;
        opponentCards = player1cards;
      } else {
        res.sendStatus(403);
        return;
      }

      const opponent = (await opponentCards.value.getEntry('username')) != '';
      const myTurn = await myCards.value.getEntry('hasTurn');
      const cards = await myCards.value.getListEntries('cards');

      res.json({
        hasOpponent: opponent,
        myTurn: myTurn,
        card: cards.length > 0 ? cards[0] : {},
        attributeLastRound: ''
      });
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });

  return api;
};
