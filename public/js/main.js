window.addEventListener('load', function() {

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        web3 = new Web3(web3.currentProvider);
    } else {
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    // Now you can start your app & access web3 freely:
    startApp();
});

function startApp() {
    var coinbase = web3.eth.coinbase;
    var account = web3.eth.accounts[0];
    var network = getNetwork();
    var accountInterval = setInterval(function() {
        if (web3.eth.accounts[0] !== account) {
            account = web3.eth.accounts[0];
            location.reload();
        }
    }, 100);

    web3.eth.getBalance(coinbase, function(error, result){
    if(!error)
        console.log(web3.fromWei(result.toNumber()), 'ether');
    else
        console.error(error);
    });



}

function getNetwork() {
    var netId =  web3.version.network;
    switch (netId) {
        case "1":
            console.log('This is mainnet');
            break;
        case "2":
            console.log('This is the deprecated Morden test network.');
            break;
        case "3":
            console.log('This is the ropsten test network.');
            break;
        case "4":
            console.log('This is the Rinkeby test network.');
            break;
        case "42":
            console.log('This is the Kovan test network.');
            break;
        default:
            console.log('This is an unknown network.')
    }

    return netId;
}