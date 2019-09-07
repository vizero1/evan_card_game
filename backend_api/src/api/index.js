import { DigitalTwin } from '@evan.network/api-blockchain-core';
import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';

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

    const description = {
      name: 'New crypto quartet game',
      description: 'evan.network crypto quartet card game',
      author: 'magic (ProofOfMoin Hackathon Group)',
      version: '0.0.1',
      dbcpVersion: 2
    };

    console.log('Create digital twin');
    const digitalTwin = await DigitalTwin.create(runtime, {
      accountId: runtime.activeAccount,
      description
    });

    res.json({
      playerId: 'Random-Id',
      gameId: await digitalTwin.getContractAddress()
    });
  });

  // perhaps expose some API metadata at the root
  api.post('/join/:gameId', async (req, res) => {
    const { gameId } = req.params;
    const { playerName } = req.body;
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
