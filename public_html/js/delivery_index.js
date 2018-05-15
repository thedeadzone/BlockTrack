function startOthers() {
    let finished = [0];
    let url = $('.url-detail').data('url-detail');

    // if cipher browser, remove the modal that's not used
    if (isCipher && canScanQRCode) {
        $('#scannerModal .modal-body video').addClass('hidden');
    }

    // Added in via Javascript to prevent clicking the button before its correctly initiated.
    $('.container-fluid.blue-color-1 .card-body').append(
        '<button type="button" id="activateScanner" data-toggle="modal" data-target="#scannerModal" href="#" class="btn btn-primary button-lg align-center-transfer margin-bottom">Scan QR Code</button>' +
        '<button type="button" id="activate-qr" data-toggle="modal" data-target="#qrcodeModal" href="#" class="btn btn-secondary button-lg align-center-transfer margin-bottom">Show my QR Code</button>' +
        '<button type="button" id="refreshData" href="#" class="btn btn-secondary button-lg align-center-transfer margin-bottom">Refresh</button>'
    );

    // Activates the scanner button with on click action
    $('#activateScanner').on('click', function () {
        activateScanner();
    });

    $('#refreshData').on('click', function() {
        getData();
    });

    $('#qrcodeModal').find('.modal-body').append('<img class="img-fluid" src="https://chart.googleapis.com/chart?cht=qr&chl='+ web3.eth.accounts[0] +'&choe=UTF-8&chs=500x500">');

    getData();

    function getData() {
        finished = [0];
        $('.todo').empty();
        $('.done').empty();

        myContract.tokensOfOwner(web3.eth.accounts[0], function (error, result) {
            if (!error) {
                if (result.length !== 0) {
                    var date = '';
                    var length = result.length;

                    jQuery.each(result, function(i, val) {
                        var tokenId = val['c'][0];
                        myContract.getToken.call(val, function (error, result) {
                            if (!error) {
                                if (result.length !== 0) {
                                    var token = result;
                                    myContract.handOff({tokenId: result[0]}, { fromBlock: 0, toBlock: 'latest'}).get(function(error, result) {
                                        if (!error) {
                                            if (result.length !== 0) {
                                                date = new Date(result[result.length-1]['args']['time']['c'][0] * 1000);
                                                url = url.replace(/\d+/, token[0]);
                                                finished.push(token[0]['c'][0]);

                                                $('.todo').append(
                                                    '<div class="card border" data-token-id="' + token[0] + '">' +
                                                    '<div class="card-body">' +
                                                    '<h5 class="card-title">Parcel ' + token[0] + ' <span class="badge badge-pill badge-primary pull-right">In transport</span></h5>' +
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
                        '<h5 class="card-title">No parcels to deliver</h5>' +
                        '<p class="card-subtitle text-muted last-update-text">(for now)</p>' +
                        '</div>' +
                        '</div>');
                }
            } else {
                console.error(error);
            }
        });
    }

    function runOther() {
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

                        if (jQuery.inArray(handOff[count]['args']['tokenId']['c'][0], finished) == -1) {
                            finished.push(handOff[count]['args']['tokenId']['c'][0]);
                            data.push([tokenId[0], handOff[count]['args']['time']['c'][0], handOff[count]]);
                        } else {
                            if (handOff.length - 1 == count) {
                                $('.done').append(
                                    '<div class="card border no-data-card">' +
                                        '<div class="card-body">' +
                                            '<h5 class="card-title">No parcels delivered</h5>' +
                                            '<p class="card-subtitle text-muted last-update-text">(for now)</p>' +
                                        '</div>' +
                                    '</div>');
                            }
                        }
                    }

                    for (i = 0; i < data.length; i++) {
                        let count = i;
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

                                    $('.done').append(
                                        '<div class="card border" data-token-id="' + result[0] + '">' +
                                        '<div class="card-body">' +
                                        '<h5 class="card-title">Parcel ' + result[0] + ' <span class="badge badge-pill badge-' + badge + ' pull-right">' + message + '</span></h5>' +
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
                } else {
                    $('.done').append(
                        '<div class="card border no-data-card">' +
                        '<div class="card-body">' +
                        '<h5 class="card-title">No parcels delivered</h5>' +
                        '<p class="card-subtitle text-muted last-update-text">(for now)</p>' +
                        '</div>' +
                        '</div>');
                }
            } else {
                console.error(error);
            }
        });
    }

    function activateScanner() {
        if (isCipher && canScanQRCode) {
            window.web3.currentProvider
                .scanQRCode(/^.+$/)
                .then(data => {
                    if (isInt(data)) {
                        myContract.getToken.call(data, function (error, result) {
                            if (!error && result.length !== 0) {
                                window.location = url.replace(/\d+/, data);
                            } else {
                                createAddressAlert('This is not a correct id: ', data);
                                $('#scannerModal').modal('hide')
                            }
                        });
                    } else {
                        $('#scannerModal').modal('hide')
                        createAddressAlert('This is not an id: ', data);
                    }
                })
                .catch(err => {
                    $('#scannerModal').modal('hide')
                    console.log('Error:', err)
                })
        } else {
            let scanner = new Instascan.Scanner({ video: document.getElementById('preview')});
            scanner.addListener('scan', function (content) {
                if (isInt(content)) {
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