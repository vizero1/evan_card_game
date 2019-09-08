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
      const { playerName } = req.query;

      console.log('Creating digitalTwin for player:', playerName);
      const game = await createDigitalTwin(runtime);
      const gameAddress = await game.getContractAddress();
      console.log('Created new digital twin with address:', gameAddress);

      const plugin = configurePlugin();

      const [player1cards, player2cards] = await Promise.all([
        createCardsContainer(game, plugin, 'player1cards', playerName, true),
        createCardsContainer(game, plugin, 'player2cards', '', false)
      ]);

      console.log('Setting username of player1 to:', playerName);
      await player1cards.setEntry('username', playerName);

      console.log('Setting hasTurn of player1 to:', true);
      await player1cards.setEntry('hasTurn', true);

      console.log('Setting username of 2 to:', '');
      await player2cards.setEntry('username', '');

      console.log('Setting hasTurn of 2 to:', false);
      await player2cards.setEntry('hasTurn', false);

      console.log('Setting entrie Done!');
      var cards = await loadAllCardAddresses(runtime);

      console.log('Adding cards to player 1');
      const cardsForPlayer1 = cards.splice(0, cards.length / 2);
      await player1cards.addListEntries('cards', cardsForPlayer1);

      console.log('Adding cards to player 2');
      const card2 = cards;
      await player2cards.addListEntries('cards', card2);

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
        myCurrentCardContainer.getEntry('characteristics'),
        opponentCurrentCardContainer.getEntry('characteristics')
      ]);

      const myValue = myCurrentCard[attribute];
      const opponentValue = myCurrentCard[attribute];

      var hasWon = false;
      switch (attribute) {
        case 'value':
          hasWon = true; //parseFloat(myValue) > parseFloat(opponentValue);
          break;
        case 'marketRank':
          hasWon = false; //
          break;
        case 'issueDate':
          hasWon = true; //
          break;
        default:
          throw 'invalid attribute';
      }

      if (hasWon) {
        // const movedCard = opponentCardsAddresses.splice(0, 1);
        console.log('I have won against card'); //, movedCard.address);

        console.log(
          'Remove card at index',
          myCurrentCardOriginalIndex,
          'from opponent deck'
        );
        await runtime.dataContract.removeListEntry(
          await opponentCards.getContractAddress(),
          'cards',
          myCurrentCardOriginalIndex
        );

        // console.log('Writing new card addresses list for opponent');
        // await opponentCards.value.addListEntries(
        //   'cards',
        //   opponentCardsAddresses
        // );

        // const myPlayedCard = myCardsAddresses.splice(0, 1);

        console.log(
          'Remove card at index',
          myCurrentCardOriginalIndex,
          'from my deck'
        );
        await runtime.dataContract.removeListEntry(
          await myCards.getContractAddress(),
          'cards',
          myCurrentCardOriginalIndex
        );

        // console.log('Writing new card addresses list for me');
        // await myCards.value.addListEntries('cards', myCardsAddresses);
      } else {
        const movedCard = myPlayedCardAddresses.splice(0, 1);
        await myPlayedCard.value.addListEntries('cards', myPlayedCardAddresses);

        const opponentPlayedCard = opponentCardsAddresses.splice(0, 1);
        opponentCardsAddresses.push(opponentPlayedCard);
        opponentCardsAddresses.push(movedCard);

        await opponentCards.value.addListEntries(
          'cards',
          opponentCardsAddresses
        );
      }

      res.json({
        hasWon: hasWon
      });
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });

  // perhaps expose some API metadata at the root
  api.get('/status/:gameId?', async (req, res) => {
    try {
      const { gameId } = req.params;
      const { playerId } = req.query;

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

      const opponent = (await opponentCards.getEntry('username')) != '';
      const myTurn = await myCards.getEntry('hasTurn');
      var cards = await myCards.getListEntries('cards');

      cards.sort((a, b) => {
        return a.index - b.index;
      });

      const cardDeckInstance = new Container(runtime, {
        accountId: runtime.activeAccount,
        address: cards[0].address
      });

      console.log('Fetching cards...');
      const card = await cardDeckInstance.getEntry('characteristics');

      res.json({
        hasOpponent: opponent,
        myTurn: myTurn,
        card: card
      });
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });

  return api;
};
