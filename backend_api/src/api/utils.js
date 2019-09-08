import _ from 'lodash';

const {
  DigitalTwin,
  Container,
  ModificationType,
  PropertyType
} = require('@evan.network/api-blockchain-core');

const cardDeckTwinAddress = '0xC12748b85e24529FF691CCd0c902aDB9232897E5';

export const createDigitalTwin = async runtime => {
  // create a new twin with a description
  const description = {
    name: 'New crypto quartet game',
    description: 'evan.network crypto quartet card game',
    author: 'magic (ProofOfMoin Hackathon Group)',
    version: '0.0.1',
    dbcpVersion: 2
  };

  return await DigitalTwin.create(runtime, {
    accountId: runtime.activeAccount,
    description
  });
};

export const createCardsContainer = async (
  runtime,
  digitalTwin,
  plugin,
  name
) => {
  console.log('Creating cards container for', name);

  const cardListDescription = {
    name: 'quartetGameContainer',
    description: 'quartetGameContainer description',
    author: 'magic (ProofOfMoin Hackathon Group)',
    version: '0.0.1',
    dbcpVersion: 2
  };

  const container = await digitalTwin.createContainers({
    [name]: { plugin, description: cardListDescription }
  });

  console.log(
    'Created cards container for container ' + name + 'with address:',
    await container[name].getContractAddress()
  );

  await runtime.rightsAndRoles.setOperationPermission(
    await container[name].getContractAddress(),
    runtime.activeAccount,
    0,
    'cards',
    PropertyType.ListEntry,
    ModificationType.Remove,
    true
  );

  return container[name];
};

export const configurePlugin = () => {
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

  return plugin;
};

export const loadAllCardAddresses = async runtime => {
  console.log('Get digital twin for all cards', cardDeckTwinAddress);
  const cardDeckInstance = new DigitalTwin(runtime, {
    accountId: runtime.activeAccount,
    address: cardDeckTwinAddress
  });

  console.log('Loading all cards...');
  const cardsObject = await cardDeckInstance.getEntries();

  console.log('Shuffling cards...');
  const cardKeys = _.shuffle(Object.keys(cardsObject));

  const cards = await Promise.all(
    cardKeys.map(async (key, index) => {
      return {
        index: index,
        address: await cardsObject[key].value.getContractAddress()
      };
    })
  );
  console.log('Loaded cards', cards);
  return cards;
};

export const digitalTwinForGameId = (runtime, gameId) => {
  console.log('Getting DigitalTwin for gameId', gameId);

  return new DigitalTwin(runtime, {
    accountId: runtime.activeAccount,
    address: gameId
  });
};

export const playerContainersForGameId = async (runtime, gameId) => {
  const digitalTwin = digitalTwinForGameId(runtime, gameId);

  const containers = await digitalTwin.getEntries();
  const { player1cards, player2cards } = containers;

  return {
    player1container: player1cards.value,
    player2container: player2cards.value
  };
};
