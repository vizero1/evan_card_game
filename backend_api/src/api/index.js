const { DigitalTwin, Container } = require('@evan.network/api-blockchain-core');
import _ from 'lodash';
import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import {
  createDigitalTwin,
  configurePlugin,
  createCardsContainer,
  loadAllCardAddresses,
  playerContainersForGameId
} from './utils';

const cardDeckTwinAddress = '0xaB3E7dbfB997606EAd9E5E7778fc00404d8368D4';

var state = {
  makeMoveInProgress: {}
};

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
      // res.json({
      //   playerId: '0xCcB420C8265221D7c553B6a8f0651BCA8FAa96bB',
      //   gameId: '0x6EA694103DFCAE3b96D68D75645B2366321f6B9f'
      // });

      // return;
      const { playerName } = req.query;

      console.log('Creating digitalTwin for player:', playerName);
      const game = await createDigitalTwin(runtime);
      const gameAddress = await game.getContractAddress();
      console.log('Created new digital twin with address:', gameAddress);

      const plugin = configurePlugin();

      const [player1cards, player2cards] = await Promise.all([
        createCardsContainer(
          runtime,
          game,
          plugin,
          'player1cards',
          playerName,
          true
        ),
        createCardsContainer(runtime, game, plugin, 'player2cards', '', false)
      ]);

      res.json({
        playerId: await player1cards.getContractAddress(),
        gameId: await game.getContractAddress()
      });

      console.log('Setting username of player1 to:', playerName);
      await player1cards.setEntry('username', playerName);

      console.log('Setting hasTurn of player1 to:', true);
      await player1cards.setEntry('hasTurn', true);

      console.log('Setting score of player1 to:', 0);
      await player1cards.setEntry('score', 0);

      console.log('Setting username of player2 to:', '');
      await player2cards.setEntry('username', '');

      console.log('Setting hasTurn of player2 to:', false);
      await player2cards.setEntry('hasTurn', false);

      console.log('Setting score of player2 to:', 0);
      await player2cards.setEntry('score', 0);

      console.log('Setting entrie Done!');
      var cards = await loadAllCardAddresses(runtime);

      console.log('Adding cards to player 1');
      const cardsForPlayer1 = cards.splice(0, cards.length / 2);
      await player1cards.addListEntries('cards', cardsForPlayer1);

      console.log('Adding cards to player 2');
      const card2 = cards;
      await player2cards.addListEntries('cards', card2);

      console.log('Done');
      // res.json({
      //   playerId: await player1cards.getContractAddress(),
      //   gameId: await game.getContractAddress()
      // });
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });

  // perhaps expose some API metadata at the root
  api.post('/join/:gameId', async (req, res) => {
    try {
      const { gameId } = req.params;
      const { playerName } = req.query;

      console.log(`${playerName} wants to join game ${gameId}`);

      const {
        player1container,
        player2container
      } = await playerContainersForGameId(runtime, gameId);

      console.warn(await player1container.getDescription());

      const usernamePlayer1 = await player1container.getEntry('username');

      console.log('Is playerName player1?');
      if (usernamePlayer1 == playerName) {
        console.log(usernamePlayer1, '==', playerName, '!');
        res.json({
          playerId: await player1container.getContractAddress()
        });
        return;
      }

      const usernamePlayer2 = await player2container.getEntry('username');
      console.log('Is playerName player2?');
      if (usernamePlayer2 == playerName) {
        console.log(usernamePlayer2, '==', playerName, '!');
        res.json({
          playerId: await player2container.getContractAddress()
        });
        return;
      }

      console.log('Is player2 set?');
      if (usernamePlayer2 != '') {
        console.log('Yes');
        res.sendStatus(403);
        return;
      }

      await player2container.setEntry('username', playerName);

      res.json({
        playerId: await player2container.getContractAddress()
      });
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });

  // perhaps expose some API metadata at the root
  api.post('/move/:gameId', async (req, res) => {
    try {
      const { gameId } = req.params;
      const { playerId, attribute } = req.query;

      state.makeMoveInProgress[gameId] = true;

      const {
        player1container,
        player2container
      } = await playerContainersForGameId(runtime, gameId);

      const player1Address = await player1container.getContractAddress();
      const player2Address = await player2container.getContractAddress();

      var myCards;
      var opponentCards;
      if (player1Address == playerId) {
        myCards = player1container;
        opponentCards = player2container;
      } else if (player2Address == playerId) {
        myCards = player2container;
        opponentCards = player1container;
      } else {
        res.sendStatus(403);
        return;
      }

      var [
        myCardsAddressesOriginal,
        opponentCardsAddressesOriginal
      ] = await Promise.all([
        myCards.getListEntries('cards'),
        opponentCards.getListEntries('cards')
      ]);

      const myCardsAddresses = _.sortBy(myCardsAddressesOriginal, 'index');
      const opponentCardsAddresses = _.sortBy(
        opponentCardsAddressesOriginal,
        'index'
      );

      const myCurrentCardContainer = new Container(runtime, {
        accountId: runtime.activeAccount,
        address: myCardsAddresses[0].address
      });

      const opponentCurrentCardContainer = new Container(runtime, {
        accountId: runtime.activeAccount,
        address: opponentCardsAddresses[0].address
      });

      const myCurrentCardOriginalIndex = _.findIndex(myCardsAddressesOriginal, {
        address: await myCurrentCardContainer.getContractAddress()
      });

      const opponentCurrentCardOriginalIndex = _.findIndex(
        opponentCardsAddressesOriginal,
        {
          address: await opponentCurrentCardContainer.getContractAddress()
        }
      );

      console.log('Fetching cards...');
      const [myCurrentCard, opponentCurrentCard] = await Promise.all([
        myCurrentCardContainer.getEntry('attribute'),
        opponentCurrentCardContainer.getEntry('attribute')
      ]);

      const myValue = myCurrentCard[attribute];
      const opponentValue = opponentCurrentCard[attribute];

      var hasWon = false;
      switch (attribute) {
        case 'MarketCap':
        case 'Price':
        case 'TwitterFollowers':
          console.log(parseFloat(myValue), '>', parseFloat(opponentValue), '?');
          hasWon = parseFloat(myValue) > parseFloat(opponentValue);
          break;
        case 'Rank':
          console.log(myValue, '>', opponentValue, '?');
          hasWon = myValue > opponentValue;
          break;
        case 'IssueDate':
          hasWon = Date.parse(myValue) > Date.parse(opponentValue);
          break;
        default:
          throw 'invalid attribute';
      }

      const removeOpponentCardPromise = runtime.dataContract.removeListEntry(
        await opponentCards.getContractAddress(),
        'cards',
        myCurrentCardOriginalIndex,
        runtime.activeAccount
      );

      const removeMyCardPromise = runtime.dataContract.removeListEntry(
        await myCards.getContractAddress(),
        'cards',
        myCurrentCardOriginalIndex,
        runtime.activeAccount
      );

      if (hasWon) {
        const myScore = await myCards.getEntry('score');
        await myCards.setEntry('score', myScore + 1);

        await Promise.all([
          removeOpponentCardPromise,
          opponentCards.setEntry('hasTurn', false)
        ]);

        await Promise.all([
          removeMyCardPromise,
          myCards.setEntry('hasTurn', true)
        ]);
      } else {
        const opponentScore = await opponentCards.getEntry('score');
        await opponentCards.setEntry('score', opponentScore + 1);

        await Promise.all([
          removeOpponentCardPromise,
          opponentCards.setEntry('hasTurn', true)
        ]);

        await Promise.all([
          removeMyCardPromise,
          myCards.setEntry('hasTurn', false)
        ]);
      }

      res.json({
        hasWon: hasWon
      });
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    } finally {
      state.makeMoveInProgress[gameId] = false;
    }
  });

  // perhaps expose some API metadata at the root
  api.get('/status/:gameId?', async (req, res) => {
    try {
      const { gameId } = req.params;
      const { playerId } = req.query;

      if (state.makeMoveInProgress[gameId]) {
        res.sendStatus(409);
        return;
      }

      const {
        player1container,
        player2container
      } = await playerContainersForGameId(runtime, gameId);

      const player1Address = await player1container.getContractAddress();
      const player2Address = await player2container.getContractAddress();

      var myCards;
      var opponentCards;
      if (player1Address == playerId) {
        myCards = player1container;
        opponentCards = player2container;
      } else if (player2Address == playerId) {
        myCards = player2container;
        opponentCards = player1container;
      } else {
        res.sendStatus(403);
        return;
      }

      const [
        opponentName,
        myTurn,
        cards,
        myScore,
        opponentScore
      ] = await Promise.all([
        opponentCards.getEntry('username'),
        myCards.getEntry('hasTurn'),
        myCards.getListEntries('cards'),
        myCards.getEntry('score'),
        opponentCards.getEntry('score')
      ]);

      const opponent = opponentName != '';

      const sortedCards = _.sortBy(cards, 'index');

      const cardDeckInstance = new Container(runtime, {
        accountId: runtime.activeAccount,
        address: sortedCards[0].address
      });

      console.log('Fetching cards...');
      const card = await cardDeckInstance.getEntry('attribute');

      res.json({
        hasOpponent: opponent,
        myTurn: myTurn,
        card: card,
        myScore: myScore,
        opponentScore: opponentScore
      });
    } catch (error) {
      console.error(error);
      res.json({
        hasOpponent: false,
        myTurn: false,
        card: {},
        myScore: 0,
        opponentScore: 0
      });
    }
  });

  return api;
};
