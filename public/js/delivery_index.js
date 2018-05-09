$(document).ready(function() {
    var finished = [];
    var targetId = '';
    var url = $('.url-detail').data('url-detail');

    $('#activate-scanner').on('click', function () {
        activateScanner();
    });

    myContract.handOff({owner: web3.eth.accounts[0]}, { fromBlock: 0, toBlock: 'latest'}).get(function(error, result) {
        if (!error) {
            if (result.length != 0) {
                var i = 0;
                var badge = '';
                var date = '';
                var message = '';
                var tokenId = result[i]['args']['tokenId']['c'];
                var handOff = result;

                for (i = 0; i < result.length; i++) {
                    var count = i;
                    finished.push(result[count]['args']['tokenId']['c'][0]);

                    myContract.getToken.call(result[count]['args']['tokenId']['c'][0], function (error, result) {
                        if (!error) {
                            if (result.length != 0) {
                                var done = false;

                                if (handOff[count]['args']['delivered'] == true) {
                                    done = true;
                                }

                                date = new Date(handOff[count]['args']['time']['c'][0] * 1000);

                                if (done) {
                                    badge = 'success';
                                    message = 'Delivered'
                                } else {
                                    badge = 'primary';
                                    message = 'In Transport';
                                }

                                $('.customer-done').append(
                                    '<div class="card border" data-token-id="' + tokenId + '">' +
                                    '<div class="card-body">'+
                                    '<h5 class="card-title">Parcel ' + tokenId + ' <span class="badge badge-pill badge-'+badge+' pull-right">'+message+'</span></h5>' +
                                    '<p class="card-subtitle text-muted last-update-text">Last update: ' + date.toLocaleTimeString("en-us", timeOptions) + '</p>' +
                                    '</div>' +
                                    '<div class="card-footer bg-transparent">'+
                                    '<div class="row">'+
                                    // '<div class="col-6">'+
                                    // '<a href="' + url + '" class="card-link">Details</a>'+
                                    // '</div>'+
                                    '<div class="col-12">'+
                                    '<p class="card-text align-center text-muted">' + result[1] + '</p>'+
                                    '</div>'+
                                    '</div>'+
                                    '</div>'+
                                    '</div>');
                            } else {
                                console.log('No data');
                            }
                        } else {
                            console.error(error);
                        }
                    });
                }
            } else {
                $('.customer-done').append(
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

    myContract.handOff({receiver: web3.eth.accounts[0]}, { fromBlock: 0, toBlock: 'latest'}).get(function(error, result) {
        if (!error) {
            if (result.length != 0) {
                var i = 0;
                var badge = '';
                var date = '';
                var message = '';
                var tokenId = result[i]['args']['tokenId']['c'];
                var handOff = result;

                for (i = 0; i < result.length; i++) {
                    var count = i;
                    if (!finished.includes(result[count]['args']['tokenId']['c'][0])) {
                        myContract.getToken.call(result[count]['args']['tokenId']['c'][0], function (error, result) {
                            if (!error) {
                                if (result.length != 0) {
                                    var done = false;

                                    if (handOff[count]['args']['delivered'] == true) {
                                        done = true;
                                    }

                                    date = new Date(handOff[count]['args']['time']['c'][0] * 1000);

                                    if (done) {
                                        badge = 'success';
                                        message = 'Delivered'
                                    } else {
                                        badge = 'primary';
                                        message = 'In Transport';
                                    }

                                    url = url.replace(/\d+/, tokenId);

                                    $('.customer-todo').append(
                                        '<div class="card border" data-token-id="' + tokenId + '">' +
                                            '<div class="card-body">' +
                                                '<h5 class="card-title">Parcel ' + tokenId + ' <span class="badge badge-pill badge-' + badge + ' pull-right">' + message + '</span></h5>' +
                                                '<p class="card-subtitle text-muted last-update-text">Last update: ' + date.toLocaleTimeString("en-us", timeOptions) + '</p>' +
                                            '</div>' +
                                            '<div class="card-footer bg-transparent">' +
                                                '<div class="row">' +
                                                    '<div class="col-6">' +
                                                        '<a href="' + url + '" class="card-link">Details</a>' +
                                                    '</div>' +
                                                    '<div class="col-6">' +
                                                        '<p class="card-text pull-right text-muted">' + result[1] + '</p>' +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>');
                                } else {
                                    console.error(error);
                                }
                            }
                        });
                    } else {
                        $('.customer-todo').append(
                            '<div class="card border no-data-card">' +
                            '<div class="card-body">' +
                            '<h5 class="card-title">All parcels delivered.</h5>' +
                            '<p class="card-subtitle text-muted last-update-text">(for now)</p>' +
                            '</div>' +
                            '</div>');
                    }
                }
            } else {
                $('.customer-todo').append(
                    '<div class="card border no-data-card">' +
                        '<div class="card-body">' +
                            '<h5 class="card-title">All parcels delivered.</h5>' +
                            '<p class="card-subtitle text-muted last-update-text">(for now)</p>' +
                        '</div>' +
                    '</div>');
            }
        } else {
            console.error(error);
        }
    });

    function activateScanner() {
        let scanner = new Instascan.Scanner({ video: document.getElementById('preview')});
        scanner.addListener('scan', function (content) {
            console.log(content);
            scanner.stop();
            window.location = url.replace(/\d+/, content);
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
});