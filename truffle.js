var HDWalletProvider = require('truffle-hdwallet-provider');
var secret = require('./config/secret.js');

module.exports = {
    networks: {
        rinkeby: {
            provider: new HDWalletProvider(secret.MNEMONIC, 'https://rinkeby.infura.io/ALZ6zu5v1wM4s4xnMU7a'),
            network_id: 4,
            gas: 5000000
        },
        ropsten: {
            provider: new HDWalletProvider(secret.MNEMONIC, 'https://ropsten.infura.io/ALZ6zu5v1wM4s4xnMU7a'),
            network_id: 3,
            gas: 5000000
        },
        kovan: {
            provider: new HDWalletProvider(secret.MNEMONIC, 'https://kovan.infura.io/ALZ6zu5v1wM4s4xnMU7a'),
            network_id: 42,
            gas: 5000000
        }
    }
};
