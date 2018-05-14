function startOthers() {
    let finished = [0];
    let url = $('.url-detail').data('url-detail');

    const isCipher = !!window.__CIPHER__;
    const canScanQRCode = !!(
        window.web3 &&
        window.web3.currentProvider &&
        window.web3.currentProvider.scanQRCode
    );

    $('#activate-scanner').on('click', function () {
        activateScanner();
    });

    if (isCipher && canScanQRCode) {
        $('#scannerModal .modal-body video').addClass('hidden');
    }

    $('#qrcodeModal').find('.modal-body').append('<img class="img-fluid" src="https://chart.googleapis.com/chart?cht=qr&chl='+ web3.eth.accounts[0] +'&choe=UTF-8&chs=500x500">');

    myContract.tokensOfOwner(web3.eth.accounts[0], function (error, result) {
        if (!error) {
            if (result.length !== 0) {
                var i = 0;
                var date = '';
                var token = '';
                var count = 0;
                var tokenId = 0;
                var length = result.length;
                for (i = 0; i < result.length; i++) {
                    tokenId = result[i]['c'][i];
                    count = i;
                    myContract.getToken.call(tokenId, function (error, result) {
                        if (!error) {
                            if (result.length !== 0) {
                                token = result;
                                myContract.handOff({tokenId: tokenId}, { fromBlock: 0, toBlock: 'latest'}).get(function(error, result) {
                                    if (!error) {
                                        if (result.length !== 0) {
                                            date = new Date(result[result.length-1]['args']['time']['c'][0] * 1000);
                                            url = url.replace(/\d+/, tokenId);
                                            finished.push(tokenId);

                                            $('.todo').append(
                                                '<div class="card border" data-token-id="' + tokenId + '">' +
                                                    '<div class="card-body">' +
                                                            '<h5 class="card-title">Parcel ' + tokenId + ' <span class="badge badge-pill badge-primary pull-right">In transport</span></h5>' +
                                                            '<p class="card-subtitle text-muted last-update-text">Last update: ' + date.toLocaleTimeString("en-us", timeOptions) + '</p>' +
                                                    '</div>' +
                                                    '<div class="card-footer bg-transparent">' +
                                                        '<div class="row">' +
                                                            '<div class="col-6">' +
                                                                '<a href="' + url + '" class="card-link">Details</a>' +
                                                            '</div>' +
                                                            '<div class="col-6">' +
                                                                '<p class="card-text align-center text-muted">' + token[1] + '</p>' +
                                                            '</div>' +
                                                        '</div>' +
                                                    '</div>' +
                                                '</div>');
                                        }
                                    }
                                    if (i == length) {
                                        runOther();
                                    }
                                });
                            }
                        }
                    });
                }
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
                    let ids = [];

                    for (i = handOff.length -1; i >= 0; i--) {
                        let count = i;
                        let tokenId = handOff[count]['args']['tokenId']['c'];

                        if (jQuery.inArray(handOff[count]['args']['tokenId']['c'][0], finished) == -1) {
                            if ($.inArray(tokenId[0], ids[0]) == -1) {
                                ids.push([tokenId[0], handOff[count]['args']['time']['c'][0]]);
                            }
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

                    for (i = 0; i < ids.length; i++) {
                        let count = i;
                        myContract.getToken.call(ids[i][0], function (error, result) {
                            if (!error) {
                                if (result.length !== 0) {
                                    let done = false;
                                    date = new Date(ids[count][1] * 1000);

                                    if (handOff[count]['args']['delivered'] === true) {
                                        done = true;
                                    }

                                    if (done) {
                                        badge = 'success';
                                        message = 'Delivered'
                                    } else {
                                        badge = 'primary';
                                        message = 'In Transport';
                                    }

                                    url = url.replace(/\d+/, ids[count][0]);

                                    $('.done').append(
                                        '<div class="card border" data-token-id="' + ids[count][0] + '">' +
                                        '<div class="card-body">' +
                                        '<h5 class="card-title">Parcel ' + ids[count][0] + ' <span class="badge badge-pill badge-' + badge + ' pull-right">' + message + '</span></h5>' +
                                        '<p class="card-subtitle text-muted last-update-text">Last update: ' + date.toLocaleTimeString("en-us", timeOptions) + '</p>' +
                                        '</div>' +
                                        '<div class="card-footer bg-transparent">' +
                                        '<div class="row">' +
                                        '<div class="col-6">' +
                                        '<a href="' + url + '" class="card-link">Details</a>' +
                                        '</div>' +
                                        '<div class="col-6">' +
                                        '<p class="card-text align-center text-muted">' + result[1] + '</p>' +
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
                                $("#scannerModal").modal('hide');
                                createAddressAlert('This is not a correct id: ', data);
                            }
                        });
                    } else {
                        $("#scannerModal").modal('hide');
                        createAddressAlert('This is not an id: ', data);
                    }
                })
                .catch(err => {
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