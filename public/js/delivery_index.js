function startOthers() {
    let finished = [];
    let url = $('.url-detail').data('url-detail');

    $('#activate-scanner').on('click', function () {
        activateScanner();
    });

    myContract.handOff({owner: web3.eth.accounts[0]}, { fromBlock: 0, toBlock: 'latest'}).get(function(error, result) {
        if (!error) {
            if (result.length !== 0) {
                let i = 0;
                let badge = '';
                let date = '';
                let message = '';
                let handOff = result;

                for (i = result.length-1; i >= 0; i--) {
                    let count = i;
                    let tokenId = handOff[count]['args']['tokenId']['c'];
                    finished.push(handOff[count]['args']['tokenId']['c'][0]);

                    myContract.getToken.call(result[count]['args']['tokenId']['c'][0], function (error, result) {
                        if (!error) {
                            if (result.length !== 0) {
                                let done = false;
                                date = new Date(handOff[count]['args']['time']['c'][0] * 1000);

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

                                $('.done').append(
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
        runOther();
    });

    function runOther() {
        myContract.handOff({receiver: web3.eth.accounts[0]}, { fromBlock: 0, toBlock: 'latest'}).get(function(error, result) {
            if (!error) {
                if (result.length !== 0) {
                    let i = 0;
                    let badge = '';
                    let date = '';
                    let message = '';
                    let handOff = result;
                    let block = false;

                    for (i = 0; i < result.length; i++) {
                        let tokenId = result[i]['args']['tokenId']['c'];
                        let count = i;
                        if (!finished.includes(result[count]['args']['tokenId']['c'][0])) {
                            block = true;
                            myContract.getToken.call(result[count]['args']['tokenId']['c'][0], function (error, result) {
                                if (!error) {
                                    if (result.length !== 0) {
                                        let done = false;

                                        if (handOff[count]['args']['delivered'] === true) {
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

                                        $('.todo').append(
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
                        }
                    }
                    if (!block) {
                        $('.todo').append(
                            '<div class="card border no-data-card">' +
                            '<div class="card-body">' +
                            '<h5 class="card-title">All parcels delivered.</h5>' +
                            '<p class="card-subtitle text-muted last-update-text">(for now)</p>' +
                            '</div>' +
                            '</div>');
                    }
                } else {
                    $('.todo').append(
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

    }

    function activateScanner() {
        let scanner = new Instascan.Scanner({ video: document.getElementById('preview')});
        scanner.addListener('scan', function (content) {
            if (isInt(content)) {
                myContract.getToken.call(content, function (error, result) {
                    if (!error && result.length !== 0) {
                        console.log(content);
                        scanner.stop();
                        window.location = url.replace(/\d+/, content);
                    } else {
                        let alert =
                            $('<div class="alert alert-danger alert-dismissable">' +
                                '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
                                'This is not a correct id: '+ content +'.</div>');
                        alert.appendTo("#alerts");
                        alert.slideDown();
                        setTimeout(function () {
                            alert.slideToggle();
                        }, 5000);
                    }
                });
            } else {
                let alert =
                    $('<div class="alert alert-danger alert-dismissable">' +
                        '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
                        'This is not an id: '+ content +'.</div>');
                alert.appendTo("#alerts");
                alert.slideDown();
                setTimeout(function () {
                    alert.slideToggle();
                }, 5000);
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