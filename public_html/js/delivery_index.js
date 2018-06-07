function startOthers() {
    let finished = [0];
    let url = $('.url-detail').data('url-detail');
    let refreshing = true;

    // if cipher browser, remove the modal that's not used
    if (isCipher && canScanQRCode) {
        $('#scannerModal .modal-body video').addClass('hidden');
        $('.container-fluid.blue-color-1 .card-body').append(
            '<button type="button" id="activateScanner" href="#" class="btn btn-primary button-lg align-center-transfer margin-bottom">Scan Parcel QR Code</button>'
        );
    } else {
        $('.container-fluid.blue-color-1 .card-body').append(
            '<button type="button" id="activateScanner" data-toggle="modal" data-target="#scannerModal" href="#" class="btn btn-primary button-lg align-center-transfer margin-bottom">Scan Parcel QR Code</button>'
        );
    }

    // Added in via Javascript to prevent clicking the button before its correctly initiated.
    $('.container-fluid.blue-color-1 .card-body').append(
        '<button type="button" id="activate-qr" data-toggle="modal" data-target="#qrcodeModal" href="#" class="btn btn-primary button-lg align-center-transfer margin-bottom">Show My QR Code</button>' +
        '<button type="button" id="refreshData" href="#" class="btn btn-secondary button-lg align-center-transfer">Refresh</button>'
    );

    // Activates the scanner button with on click action
    $('#activateScanner').on('click', function () {
        activateScanner();
    });

    // If refresh button is pressed, refresh all the data.
    $('#refreshData').on('click', function() {
        getData();
    });

    getData();

    // If the current adres is the owner of an transaction it automatically refreshes the page if not being done currently.
    myContract.handOff({owner: web3.eth.accounts[0]}, {fromBlock: 'latest', toBlock: 'pending'}, function(error, result) {
        if (!error) {
            if (!refreshing) {
                refreshing = true;
                getData();
            }
        }
    });

    // If the current adres is the receiver of an transaction it automatically refreshes the page if not being done currently.
    myContract.handOff({receiver: web3.eth.accounts[0]}, {fromBlock: 'latest', toBlock: 'pending'}, function(error, result) {
        if (!error) {
            if (!refreshing) {
                refreshing = true;
                getData();
            }
        }
    });

    // Gets all the data based on the adres
    function getData() {
        // Gets the secret that's used for the QR code
        myContract.getSecret(function (error, result) {
            if (!error) {
                if (result.length !== 0) {
                    $('#qrcodeModal').find('.modal-body').empty().append('<img class="img-fluid" src="https://chart.googleapis.com/chart?cht=qr&chl='+ result +'&choe=UTF-8&chs=500x500">');
                } else {
                    $('#qrcodeModal').find('.modal-body').empty().append('<img class="img-fluid" src="https://chart.googleapis.com/chart?cht=qr&chl='+ web3.eth.accounts[0] +'&choe=UTF-8&chs=500x500">');
                }
            } else {
                $('#qrcodeModal').find('.modal-body').empty().append('<img class="img-fluid" src="https://chart.googleapis.com/chart?cht=qr&chl='+ web3.eth.accounts[0] +'&choe=UTF-8&chs=500x500">');
            }
        });

        finished = [0];
        $('.todo').empty();
        $('.done').empty();

        // Gets all tokens based on the owner and then appends them to the page content
        // No content messages get applied if there is no parcels being delivered.
        myContract.tokensOfOwner(web3.eth.accounts[0], function (error, result) {
            if (!error) {
                if (result.length !== 0) {
                    var date = '';
                    var length = result.length;
                    jQuery.each(result, function(i, val) {
                        var tokenId = val['c'][0];
                        // Get token related information
                        myContract.getToken.call(val, function (error, result) {
                            if (!error) {
                                if (result.length !== 0) {
                                    var token = result;
                                    // Get all handoffs for the token from the getToken function
                                    myContract.handOff({tokenId: result[0]}, { fromBlock: 0, toBlock: 'latest'}).get(function(error, result) {
                                        if (!error) {
                                            if (result.length !== 0) {
                                                date = new Date(result[result.length-1]['args']['time']['c'][0] * 1000);
                                                url = url.replace(/\d+/, token[0]);
                                                finished.push(token[0]['c'][0]);

                                                // Append token information to the page
                                                $('.todo').append(
                                                    '<div class="card border" data-token-id="' + token[0] + '">' +
                                                    '<div class="card-body">' +
                                                    '<h5 class="card-title">Parcel ' + token[0] + ' <span class="badge badge-pill badge-primary pull-right">In transport</span></h5>' +
                                                    '<p class="card-subtitle">' + token[4] + '</p>' +
                                                    '<p class="card-subtitle text-muted last-update-text">Last update: ' + date.toLocaleTimeString("en-us", timeOptions) + '</p>' +
                                                    '</div>' +
                                                    '<div class="card-footer bg-transparent">' +
                                                    '<div class="row">' +
                                                    '<div class="col-6">' +
                                                    '<a href="' + url + '" class="card-link">Details</a>' +
                                                    '</div>' +
                                                    '<div class="col-6">' +
                                                    '<p class="card-text align-center text-muted">' + token[2] + '</p>' +
                                                    '</div>' +
                                                    '</div>' +
                                                    '</div>' +
                                                    '</div>');
                                            }
                                        }
                                        if (i == length-1) {
                                            runOther();
                                        }
                                    });
                                }
                            }
                        });
                    });
                } else {
                    runOther();

                    $('.todo').append(
                        '<div class="card border no-data-card">' +
                        '<div class="card-body">' +
                        '<h5 class="card-title">No Parcels To Deliver</h5>' +
                        '<p class="card-subtitle text-muted last-update-text">(for now)</p>' +
                        '</div>' +
                        '</div>');
                }
            } else {
                console.error(error);
            }
        });
    }

    // Get's the information for all tokens that are not in the todo list but have been owned by the adres
    function runOther() {
        // Get all handoffs for the token
        myContract.handOff({owner: web3.eth.accounts[0]}, {
            fromBlock: 0,
            toBlock: 'latest'
        }).get(function (error, result) {
            if (!error) {
                if (result.length !== 0) {
                    let badge = '';
                    let date = '';
                    let message = '';
                    let handOff = result;
                    let data = [];

                    for (i = handOff.length -1; i >= 0; i--) {
                        let count = i;
                        let tokenId = handOff[count]['args']['tokenId']['c'];

                        // If token is added to the page, add it to the array so there is no duplicates
                        if (jQuery.inArray(handOff[count]['args']['tokenId']['c'][0], finished) == -1) {
                            finished.push(handOff[count]['args']['tokenId']['c'][0]);
                            data.push([tokenId[0], handOff[count]['args']['time']['c'][0], handOff[count]]);
                        } else {
                            if (handOff.length - 1 == count) {
                                $('.done').append(
                                    '<div class="card border no-data-card">' +
                                        '<div class="card-body">' +
                                            '<h5 class="card-title">No Parcels Delivered</h5>' +
                                            '<p class="card-subtitle text-muted last-update-text">(for now)</p>' +
                                        '</div>' +
                                    '</div>');
                            }
                        }
                    }

                    for (i = 0; i < data.length; i++) {
                        let count = i;
                        // Get token related information
                        myContract.getToken.call(data[i][0], function (error, result) {
                            if (!error) {
                                if (result.length !== 0) {
                                    let done = false;
                                    date = new Date(data[count][1] * 1000);
                                    if (data[count][2]['args']['delivered'] === true) {
                                        done = true;
                                    }

                                    if (done) {
                                        badge = 'success';
                                        message = 'Delivered'
                                    } else {
                                        badge = 'primary';
                                        message = 'In Transport';
                                    }

                                    url = url.replace(/\d+/, result[0]);

                                    // Add token related information to the page
                                    $('.done').append(
                                        '<div class="card border" data-token-id="' + result[0] + '">' +
                                        '<div class="card-body">' +
                                        '<h5 class="card-title">Parcel ' + result[0] + ' <span class="badge badge-pill badge-' + badge + ' pull-right">' + message + '</span></h5>' +
                                        // '<p class="card-subtitle last-update-text">' + result[4] + '</p>' +
                                        '<p class="card-subtitle text-muted last-update-text">Last update: ' + date.toLocaleTimeString("en-us", timeOptions) + '</p>' +
                                        '</div>' +
                                        '<div class="card-footer bg-transparent">' +
                                        '<div class="row">' +
                                        '<div class="col-6">' +
                                        '<a href="' + url + '" class="card-link">Details</a>' +
                                        '</div>' +
                                        '<div class="col-6">' +
                                        '<p class="card-text align-center text-muted">' + result[2] + '</p>' +
                                        '</div>' +
                                        '</div>' +
                                        '</div>' +
                                        '</div>');
                                }
                            } else {
                                console.error(error);
                            }
                        });
                    }
                    refreshing = false;
                } else {
                    refreshing = false;
                    $('.done').append(
                        '<div class="card border no-data-card">' +
                        '<div class="card-body">' +
                        '<h5 class="card-title">No Parcels Delivered</h5>' +
                        '<p class="card-subtitle text-muted last-update-text">(for now)</p>' +
                        '</div>' +
                        '</div>');
                }
            } else {
                refreshing = false;
                console.error(error);
            }
        });
    }

    // Activates the QR scanner to go to the token detailpage
    function activateScanner() {
        if (isCipher && canScanQRCode) {
            // Scanner for mobile Cipher browser
            window.web3.currentProvider
                .scanQRCode(/^.+$/)
                .then(data => {
                    if (isInt(data)) {
                        // based on scanned data a check is initiated if the token exists
                        myContract.getToken.call(data, function (error, result) {
                            if (!error && result.length !== 0) {
                                window.location = url.replace(/\d+/, data);
                            } else {
                                createAddressAlert('This is not a correct id: ', data);
                                $('#scannerModal').modal('hide')
                            }
                        });
                    } else {
                        $('#scannerModal').modal('hide');
                        createAddressAlert('This is not an id: ', data);
                    }
                })
                .catch(err => {
                    $('#scannerModal').modal('hide');
                    console.log('Error:', err)
                })
        } else {
            // Scanner for computer browser
            let scanner = new Instascan.Scanner({ video: document.getElementById('preview')});
            scanner.addListener('scan', function (content) {
                if (isInt(content)) {
                    // based on scanned data a check is initiated if the token exists
                    myContract.getToken.call(content, function (error, result) {
                        if (!error && result.length !== 0) {
                            console.log(content);
                            scanner.stop();
                            window.location = url.replace(/\d+/, content);
                        } else {
                            createAddressAlert('This is not a correct id: ', content);
                        }
                    });
                } else {
                    createAddressAlert('This is not an id: ', content);
                }
            });

            // Selects the second camera if there is multiple options, for mobile phones this is the back camera.
            Instascan.Camera.getCameras().then(function (cameras) {
                if (cameras.length > 0) {
                    if (cameras[1]) {
                        scanner.mirror = false;
                        scanner.start(cameras[1]);
                    } else {
                        scanner.mirror = true;
                        scanner.start(cameras[0]);
                    }
                } else {
                    console.error('No cameras found.');
                }
            }).catch(function (e) {
                console.error(e);
            });
        }
    }
}