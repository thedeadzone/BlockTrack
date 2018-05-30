window.addEventListener('load', function() {

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        web3 = new Web3(web3.currentProvider);
    } else {
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        // web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        // web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/ALZ6zu5v1wM4s4xnMU7a"));
    }

    let roles = ['user', 'deliverer', 'admin'];

    startApp();
});

let timeOptions = {
    year: "numeric", month: "short",
    day: "numeric", hour: "numeric", minute: "2-digit",
    hour12: false
};

function startApp() {
    // Checks if mobile browser Cipher is used for camera/QR code use.
    isCipher = !!window.__CIPHER__;
    canScanQRCode = !!(
        window.web3 &&
        window.web3.currentProvider &&
        window.web3.currentProvider.scanQRCode
    );


    let coinbase = web3.eth.coinbase;
    let account = web3.eth.accounts[0];
    web3.eth.defaultAccount = web3.eth.accounts[0];
    let network = getNetwork();
    let accountInterval = setInterval(function () {
        if (web3.eth.accounts[0] !== account) {
            account = web3.eth.accounts[0];
            location.reload();
        }
    }, 100);

    //TODO: Check for right network or display stuff otherwise

    // Hardcoded address to the contract being used
    myContract = web3.eth.contract([
        {
            "constant": true,
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_tokenId",
                    "type": "uint256"
                }
            ],
            "name": "getApproved",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_to",
                    "type": "address"
                },
                {
                    "name": "_tokenId",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_from",
                    "type": "address"
                },
                {
                    "name": "_to",
                    "type": "address"
                },
                {
                    "name": "_tokenId",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_owner",
                    "type": "address"
                },
                {
                    "name": "_index",
                    "type": "uint256"
                }
            ],
            "name": "tokenOfOwnerByIndex",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_from",
                    "type": "address"
                },
                {
                    "name": "_to",
                    "type": "address"
                },
                {
                    "name": "_tokenId",
                    "type": "uint256"
                }
            ],
            "name": "safeTransferFrom",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_tokenId",
                    "type": "uint256"
                }
            ],
            "name": "exists",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_index",
                    "type": "uint256"
                }
            ],
            "name": "tokenByIndex",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_tokenId",
                    "type": "uint256"
                }
            ],
            "name": "ownerOf",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_owner",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "owner",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_to",
                    "type": "address"
                },
                {
                    "name": "_approved",
                    "type": "bool"
                }
            ],
            "name": "setApprovalForAll",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_from",
                    "type": "address"
                },
                {
                    "name": "_to",
                    "type": "address"
                },
                {
                    "name": "_tokenId",
                    "type": "uint256"
                },
                {
                    "name": "_data",
                    "type": "bytes"
                }
            ],
            "name": "safeTransferFrom",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_tokenId",
                    "type": "uint256"
                }
            ],
            "name": "tokenURI",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_owner",
                    "type": "address"
                },
                {
                    "name": "_operator",
                    "type": "address"
                }
            ],
            "name": "isApprovedForAll",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "transferOwnership",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "receiver",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "time",
                    "type": "uint64"
                },
                {
                    "indexed": false,
                    "name": "delivered",
                    "type": "bool"
                },
                {
                    "indexed": false,
                    "name": "delivererName",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "name": "receiverName",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "name": "location",
                    "type": "string"
                }
            ],
            "name": "handOff",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "name": "deliverer",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "name",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "name": "company",
                    "type": "string"
                }
            ],
            "name": "delivererRegistered",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "previousOwner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "OwnershipTransferred",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "_tokenId",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_approved",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "_tokenId",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_operator",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "_approved",
                    "type": "bool"
                }
            ],
            "name": "ApprovalForAll",
            "type": "event"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_tokenId",
                    "type": "uint256"
                },
                {
                    "name": "_receiver",
                    "type": "address"
                }
            ],
            "name": "allowedToReceive",
            "outputs": [
                {
                    "name": "allowed",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_receiver",
                    "type": "address"
                }
            ],
            "name": "balanceOfReceiver",
            "outputs": [
                {
                    "name": "count",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_tokenId",
                    "type": "uint256"
                }
            ],
            "name": "getToken",
            "outputs": [
                {
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "name": "mintedAt",
                    "type": "uint64"
                },
                {
                    "name": "shippingCompany",
                    "type": "string"
                },
                {
                    "name": "receivingAddress",
                    "type": "address"
                },
                {
                    "name": "receivingPostalAddress",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_owner",
                    "type": "address"
                }
            ],
            "name": "tokensOfOwner",
            "outputs": [
                {
                    "name": "ownerTokens",
                    "type": "uint256[]"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_receiver",
                    "type": "address"
                }
            ],
            "name": "parcelsOfReceiver",
            "outputs": [
                {
                    "name": "receiverParcels",
                    "type": "uint256[]"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_to",
                    "type": "address"
                },
                {
                    "name": "_tokenId",
                    "type": "uint256"
                }
            ],
            "name": "transferTokenTo",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_shippingCompany",
                    "type": "address"
                },
                {
                    "name": "_name",
                    "type": "string"
                }
            ],
            "name": "registerShippingCompany",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_deliverer",
                    "type": "address"
                },
                {
                    "name": "_name",
                    "type": "string"
                },
                {
                    "name": "_location",
                    "type": "string"
                }
            ],
            "name": "registerDeliverer",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_deliverer",
                    "type": "address"
                },
                {
                    "name": "_receivingAddress",
                    "type": "address"
                },
                {
                    "name": "_receivingPostalAddress",
                    "type": "string"
                }
            ],
            "name": "registerParcel",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]).at('0xb909e18d89cb4621b9c7cf6e99c832bebb7754b2');
    startOthers();

    // myContract.totalSupply.call(function(error, result) {
    //         if (!error)
    //             console.log(JSON.stringify(result));
    //         else
    //             console.error(error);
    //     }
    // );
    //
    // myContract.name.call(function(error, result) {
    //         if (!error)
    //             console.log(result);
    //         else
    //             console.error(error);
    //     }
    // );
    //
    // web3.eth.getBalance(coinbase, function(error, result){
    // if(!error)
    //     console.log(web3.fromWei(result.toNumber()), 'ether');
    // else
    //     console.error(error);
    // });
}

function getNetwork() {
    let netId = web3.version.network;
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

function isInt(value) {
    return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
}

function createAddressAlert(message, content) {
    let alert =
        $('<div class="alert alert-danger alert-dismissable">' +
            '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
            '<p class="alert-top">'+ message +'</p><p class="long-address"><small>' + content + '</small></p></div>');
    alert.appendTo("#alerts");
    alert.slideDown();
    setTimeout(function () {
        alert.slideToggle();
    }, 10000);
}