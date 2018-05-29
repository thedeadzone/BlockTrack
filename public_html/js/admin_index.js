function startOthers() {
    $('#activateScanner').on('click', function () {
        activateScanner();
    });

    $('#refreshData').on('click', function() {
        getData();
    });

    getData();

    var url = $('.url-detail').data('url-detail');

    function getData() {
        $('.todo').empty();
        $('.done').empty();

        myContract.totalSupply(function (error, result) {
            if (!error) {
                if (result.length != 0) {
                    var id = 0;
                    var length = result['c'][0];
                    for (i = 0; i < length; i++) {
                        id = i;
                        myContract.getToken.call(id, function (error, result) {
                            if (!error) {
                                if (result.length != 0) {
                                    var done = false;
                                    var div = '';
                                    var badge = '';
                                    var date = '';
                                    var message = '';
                                    var token = result;
                                    myContract.handOff({tokenId: result[0]}, {fromBlock: 0, toBlock: 'latest'}).get(function (error, result) {
                                        if (!error) {
                                            if (result.length != 0 && token[0]['c'] != 0) {
                                                for (i = 0; i < result.length; i++) {
                                                    if (result[i]['args']['delivered'] == true) {
                                                        done = true;
                                                    }
                                                    if (i == result.length - 1) {
                                                        date = new Date(result[i]['args']['time']['c'][0] * 1000);
                                                    }
                                                }

                                                if (done) {
                                                    div = $('.done');
                                                    badge = 'success';
                                                    message = 'Delivered'
                                                } else {
                                                    div = $('.todo');
                                                    badge = 'primary';
                                                    message = 'In Transport';
                                                }

                                                url = url.replace(/\d+/, token[0]);

                                                div.append(
                                                    '<div class="card border" data-token-id="' + id + '">' +
                                                    '<div class="card-body">' +
                                                    '<h5 class="card-title">Parcel ' + token[0] + ' <span class="badge badge-pill badge-' + badge + ' pull-right">' + message + '</span></h5>' +
                                                    '<p class="card-subtitle last-update-text">' + token[4] + '</p>' +
                                                    '<p class="card-subtitle text-muted last-update-text">Last update: ' + date.toLocaleTimeString("en-us", timeOptions) + '</p>' +
                                                    '</div>' +
                                                    '<div class="card-footer bg-transparent">' +
                                                    '<div class="row">' +
                                                    '<div class="col-6">' +
                                                    '<a href="' + url + '" class="card-link">Details</a>' +
                                                    '</div>' +
                                                    '<div class="col-6">' +
                                                    '<p class="card-text pull-right text-muted">' + token[2] + '</p>' +
                                                    '</div>' +
                                                    '</div>' +
                                                    '</div>' +
                                                    '</div>');
                                            }
                                        } else {
                                            console.error(error);
                                        }
                                    });
                                } else {
                                    console.error(error);
                                }
                            }
                        });
                    }
                } else {
                    console.error(error);
                }
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
                                $('#scannerModal').modal('hide');
                            }
                        });
                    } else {
                        $('#scannerModal').modal('hide');
                        createAddressAlert('This is not an id: ', data);
                    }
                })
                .catch(err => {
                    $('#scannerModal').modal('hide');
                    console.log('Error:', err);
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

    $('#registerParcel').on('click', function() {
        $('#parcelModal #form-parcel').removeClass('hidden');
        $('#parcelModal .modal-body .alert.alert-primary').addClass('hidden');
    });

    $('#registerShippingCompany').on('click', function() {
        $('#shippingModal #form-shipping').removeClass('hidden');
        $('#shippingModal .modal-body .alert.alert-primary').addClass('hidden');
    });

    $('#registerDeliverer').on('click', function() {
        $('#delivererModal #form-deliverer').removeClass('hidden');
        $('#delivererModal .modal-body .alert.alert-primary').addClass('hidden');
    });

    $('.form-shippingcompany').on('submit', function(e) {
        e.preventDefault();
        myContract.registerShippingCompany($('#shippingcompany-address').val(), $('#shippingcompany-name').val(), {
                from: web3.eth.accounts[0],
                gas: 200000,
                gasPrice: 2000000000
            }, function (error, result) {
                if (!error) {
                    $('#shippingModal #form-shippingcompany').removeClass('hidden').addClass('hidden');
                    $('#shippingModal .modal-body .alert.alert-primary').empty().append(
                        'Transaction <u id="shipping-transfer-hash">executed!</u> Results will be reflected in ~30 seconds.'
                    );

                    $('#shipping-transfer-hash').popover({
                        content: "<a target='_blank' href='https://rinkeby.etherscan.io/tx/" + result + "'>" + result + "</a>",
                        html: true,
                        placement: "bottom"
                    });
                } else {
                    $("#shippingModal").modal('hide');
                }
            }
        );
    });

    $('.form-deliverer').on('submit', function(e) {
        e.preventDefault();
        myContract.registerDeliverer($('#deliverer-address').val(), $('#deliverer-name').val(), $('#deliverer-location').val(), {
                from: web3.eth.accounts[0],
                gas: 200000,
                gasPrice: 2000000000
            }, function (error, result) {
                if (!error) {
                    $('#delivererModal .form-deliverer').addClass('hidden');
                    $('#delivererModal .modal-body .alert.alert-primary').removeClass('hidden').empty().append(
                        'Transaction <u id="deliverer-transfer-hash">executed!</u> Results will be reflected in ~30 seconds.'
                        );

                    $('#deliverer-transfer-hash').popover({
                        content: "<a target='_blank' href='https://rinkeby.etherscan.io/tx/" + result + "'>" + result + "</a>",
                        html: true,
                        placement: "bottom"
                    });
                } else {
                    $("#delivererModal").modal('hide');
                }
            }
        );
    });

    $('.form-parcel').on('submit', function(e) {
        e.preventDefault();
        myContract.registerParcel($('#parcel-address').val(), $('#parcel-name').val(), $('#parcel-location').val(), {
                from: web3.eth.accounts[0],
                gas: 2000000,
                gasPrice: 2000000000
            }, function (error, result) {
                if (!error) {
                    $('#parcelModal .form-parcel').addClass('hidden');
                    $('#parcelModal .modal-body .alert.alert-primary').removeClass('hidden').empty().append(
                        'Transaction <u id="parcel-transfer-hash">executed!</u> Results will be reflected in ~30 seconds.'
                    );

                    $('#parcel-transfer-hash').popover({
                        content: "<a target='_blank' href='https://rinkeby.etherscan.io/tx/" + result + "'>" + result + "</a>",
                        html: true,
                        placement: "bottom"
                    });
                } else {
                    $("#parcelModal").modal('hide');
                }
            }
        );
    });
}