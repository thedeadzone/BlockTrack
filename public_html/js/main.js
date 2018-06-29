window.addEventListener('load', function() {

    // Check if web3 is injected by browser (Metamask/Cipher)
    if (typeof web3 !== 'undefined') {
        // Use the injected provider
        web3 = new Web3(web3.currentProvider);
    } else {
        // Show error screen incase no web3 provider detected.
        $('#errorModal').modal('show');
    }

    // Add possible roles to an array
    roles = ['parcels', 'delivery', 'admin'];
    roleName = '';

    // After ensuring web3 exists you can start rest of the app
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

    role = '';
    let account = web3.eth.accounts[0];

    // Automatic refresh of all pages if account is switched in web3 provider.
    let accountInterval = setInterval(function () {
        if (web3.eth.accounts[0] !== account) {
            account = web3.eth.accounts[0];
            location.reload();
        }
    }, 100);

    if (!account) {
        $('#error-title').text('Ethereum provider/wallet locked');
        $('#error-text').text('Please unlock your wallet.');
        $('#errorModal').modal('show');
    } else {
        web3.eth.defaultAccount = web3.eth.accounts[0];

        let networkId = getNetwork();
        let address = '';

        // Added backup networks based on provider that can be used as backup for presentation
        if (networkId == 4) {
            // Rinkeby
            address = '0x8259748d306abf12983f62bfb0968c490b6aa98d';
        } else if (networkId == 42) {
            // Kovan
            address = '0xe30f8f7e92fd4a8dc960fc3ab8dfc7459459682e';
        } else {
            // Display error for incorrect Ethereum net used
            $('#error-title').text('Incorrect network');
            $('#error-text').text('Please swap to the rinkeby testnet (4) in your web3 provider.');
            $('#errorModal').modal('show');
        }

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
                        "name": "_secret",
                        "type": "bytes32"
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
                        "name": "_address",
                        "type": "address"
                    }
                ],
                "name": "addressIsRole",
                "outputs": [
                    {
                        "name": "role",
                        "type": "uint64"
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
                        "name": "_tokenId",
                        "type": "uint256"
                    },
                    {
                        "name": "_secret",
                        "type": "bytes32"
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
                "constant": true,
                "inputs": [],
                "name": "getSecret",
                "outputs": [
                    {
                        "name": "secret",
                        "type": "bytes32"
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
        ]).at(address);

        // Enforces access restriction on user.
        myContract.addressIsRole(web3.eth.accounts[0], function(error, result) {
            if (!error) {
                if (result.length !== 0) {
                    role = result;
                    roleName = roles[role];

                    if (roleName != window.location.pathname.replace(/^\/([^\/]*).*$/, '$1') && window.location.pathname.replace(/^\/([^\/]*).*$/, '$1') != null) {
                        if (window.location.pathname.replace(/^\/([^\/]*).*$/, '$1') !== 'admin') {
                            let url = $('.url').data('url-customer');
                            if (role == 1) {
                                url = $('.url').data('url-deliverer');
                            } else if (role == 2) {
                                url = $('.url').data('url-shippingcompany');
                            }

                            window.location.replace(url);
                        }
                    }

                    startOthers();
                }
            }
        });
    }
}

// Returns the used network id.
function getNetwork() {
    let netId = web3.version.network;
    switch (netId) {
        case "1":
            console.log('This is mainnet');
            return netId;
            break;
        case "2":
            console.log('This is the deprecated Morden test network.');
            return netId;
            break;
        case "3":
            console.log('This is the ropsten test network.');
            return netId;
            break;
        case "4":
            console.log('This is the Rinkeby test network.');
            return netId;
            break;
        case "42":
            console.log('This is the Kovan test network.');
            return netId;
            break;
        default:
            console.log('This is an unknown network.')
            return netId;
    }

    return netId;
}

// Checks if value is an int
function isInt(value) {
    return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
}

// Creates the display error when called
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