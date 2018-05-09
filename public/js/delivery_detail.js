$(document).ready(function() {
    var slug = $('#slug').data('slug');
    var token = '';
    var targetId = '';

    myContract.getToken(slug, function(error, result) {
        if (!error) {
            if (result.length != 0) {
                token = result;

                myContract.handOff({tokenId: slug}, {
                    fromBlock: 0,
                    toBlock: 'latest'
                }).get(function (error, result) {
                    if (!error) {
                        if (result.length != 0) {
                            var i = 0;
                            var badge = 'transparent';

                            for (i = result.length - 1; i >= 0; i--) {
                                if (result[i]['args']['delivered'] == true) {
                                    badge = 'success';
                                }

                                var date = new Date(result[i]['args']['time'] * 1000);
                                var owner = result[i]['args']['owner'];

                                $('.page-content-2').append(
                                    '<div class="card text-center">' +
                                    '<div class="card-header">' +
                                    '<p>' + 'Previous' + ' > ' + result[i]["args"]["location"] + '</p>' +
                                    '</div>' +
                                    '<div class="card-body">' +
                                    '<h5 class="card-title token-1-' + i + '">' + result[i]["args"]["receiverName"] + '</h5>' +
                                    '<p class="card-text token-2-' + i + ' text-muted">' + result[i]["args"]["delivererName"] + '</p>' +
                                    '</div>' +
                                    '<div class="card-footer">' +
                                    '<p class="text-muted token-3-' + i + '">' + date.toLocaleTimeString("en-us", timeOptions) + '</p>' +
                                    '</div>' +
                                    '</div>');
                                $('.token-1-' + i).popover({
                                    content: "<a target='_blank' href='https://rinkeby.etherscan.io/address/" + result[i]['args']['receiver'] + "'>" + result[i]['args']['receiver'] + "</a>",
                                    html: true,
                                    placement: "bottom"
                                });
                                $('.token-2-' + i).popover({
                                    content: "<a target='_blank' href='https://rinkeby.etherscan.io/address/" + result[i]['args']['owner'] + "'>" + result[i]['args']['owner'] + "</a>",
                                    html: true,
                                    placement: "bottom"
                                });
                                $('.token-3-' + i).popover({
                                    content: "<a target='_blank' href='https://rinkeby.etherscan.io/tx/" + result[i]['transactionHash'] + "'>" + result[i]['transactionHash'] + "</a>",
                                    html: true,
                                    placement: "bottom"
                                });
                            }

                            $('.page-content-1').append(
                                '<div class="card border" data-token-id="' + slug + '">' +
                                '<div class="card-body">' +
                                '<h5 class="card-title">Package ' + slug + '</h5>' +
                                '<p class="card-subtitle text-muted last-update-text">Delivery address:</p>' +
                                '<p class="card-text text-muted">' + token[3] + '</p>' +
                                '</div>' +
                                '<div class="card-footer bg-transparent">' +
                                '<a id="activate-scanner" data-toggle="modal" data-target="#scannerModal" href="#" class="button button-lg align-center-transfer">Transfer</a>' +
                                '</div>' +
                                '</div>' +
                                '<hr>');

                            $('#activate-scanner').on('click', function () {
                                activateScanner();
                            });
                        } else {
                            console.log('No data');
                        }
                    } else
                        console.error(error);
                });
            } else {
                console.log('No data');
            }
        } else {
            console.error(error);
        }
    });

    function activateScanner() {
        let scanner = new Instascan.Scanner({ video: document.getElementById('preview') });
        scanner.addListener('scan', function (content) {
            scanner.stop();
            targetId = content;
            $('#scannerModal .modal-body video').toggleClass('hidden');
            $('#scannerModal .modal-footer #transfer-close').toggleClass('hidden');
            $('#scannerModal .modal-footer #transfer-deny').toggleClass('hidden');
            $('#scannerModal .modal-footer #transfer-confirm').toggleClass('hidden');

            $('#scannerModal .modal-body').append(
                '<div class="transfer-content">' +
                    '<p class="align-center">Are you sure this is the right address?</p>' +
                    '<p class="align-center" id="transfer-id">'+ content +'</p>' +
                '</div>');

            ActivateTriggers();
        });
        Instascan.Camera.getCameras().then(function (cameras) {
            if (cameras.length > 0) {
                scanner.start(cameras[0]);
            } else {
                console.error('No cameras found.');
            }
        }).catch(function (e) {
            console.error(e);
        });

        function ActivateTriggers(){
            $('#transfer-confirm').on('click', function() {
                myContract.transferTokenTo(targetId, slug, {
                        from:web3.eth.accounts[0],
                        gas:200000,
                        gasPrice: 2000000000
                    }, function(error, result) {
                        if (!error) {
                            var url = $('.url-finish-transfer').data('url');

                            $('#scannerModal .modal-footer #transfer-deny').toggleClass('hidden');
                            $('#scannerModal .modal-footer #transfer-confirm').toggleClass('hidden');
                            $('#scannerModal .modal-body .transfer-content').empty();
                            $('#scannerModal .modal-footer #transfer-close').toggleClass('hidden');
                            $('#scannerModal .modal-body').append(
                                '<div class="alert alert-primary">' +
                                    'Parcel succesfully <u id="transfer-hash">transferred!</u>' +
                                '</div>');

                            $('#transfer-close').on('click', function() {
                                window.location.replace(url);
                            });

                            $('#transfer-hash').popover({content: "<a target='_blank' href='https://rinkeby.etherscan.io/tx/"+result+"'>"+result+"</a>", html: true, placement: "bottom"});

                            console.log(result);
                            console.log("https://rinkeby.etherscan.io/tx/" + result);
                            // TODO: Hier komt transaction hash + link er naar op rinkeby.etherscan
                        } else {
                            // console.error(error);
                        }
                    }
                );
            });

            $('#transfer-deny').on('click', function() {
                scanner.start();
                $('#scannerModal .modal-footer #transfer-deny').toggleClass('hidden');
                $('#scannerModal .modal-footer #transfer-confirm').toggleClass('hidden');
                $('#scannerModal .modal-body .transfer-content').empty();
                $('#scannerModal .modal-body video').toggleClass('hidden');
                $('#scannerModal .modal-footer #transfer-close').toggleClass('hidden');
            });
        }
        // TODO: checken of address klopt voor je functie uitvoert klopt
    }
});