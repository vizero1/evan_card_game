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

  // perhaps expose some API metadata at the root
  api.post('/createGame', async (req, res) => {
    const description = {
      name: 'New crypto quartet game',
      description: 'evan.network crypto quartet card game',
      author: 'magic (ProofOfMoin Hackathon Group)',
      version: '0.0.1',
      dbcpVersion: 2
    };

    console.log('Create digital twin');
    const digitalTwin = await DigitalTwin.create(main.runtime, {
      accountId: main.runtime.activeAccount,
      description
    });

    res.json({ digitalTwin });
  });

  return api;
};
