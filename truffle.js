var HDWalletProvider = require('truffle-hdwallet-provider');
var secret = require('./config/secret.js');

module.exports = {
    networks: {
        // rinkeby: {
        //     host: "127.0.0.1",
        //     port: 8545,
        //     network_id: "4",
        //     from: "0xf5c6acc651ef804471bd7c1f8a1fff04d7f19c9c",
        //     gas: 4600000
        // }
        rinkeby: {
            provider: new HDWalletProvider(secret.MNEMONIC, 'https://rinkeby.infura.io/ALZ6zu5v1wM4s4xnMU7a'),
            network_id: 4,
            gas: 5000000
        }
    }
};
