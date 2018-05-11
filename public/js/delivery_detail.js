function startOthers() {
    let slug = $('#slug').data('slug');
    let token = '';
    let targetId = '';
    let html = '<div class="progress-bar" role="progressbar" style="width: 100%">In Transport</div>';
    let house = '';

    myContract.getToken(slug, function (error, result) {
        if (!error) {
            if (result.length !== 0) {
                token = result;

                myContract.handOff({tokenId: slug}, {fromBlock: 0, toBlock: 'latest'}).get(function (error, result) {
                    if (!error) {
                        if (result.length !== 0) {
                            let i = 0;
                            for (i = result.length - 1; i >= 0; i--) {
                                house = '';
                                if (result[i]['args']['delivered'] === true) {
                                    house = '<i class="fas fa-home"></i>';
                                    html = '<div class="progress-bar bg-success" role="progressbar" style="width: 100%">Delivered</div>';
                                }

                                let date = new Date(result[i]['args']['time'] * 1000);

                                $('.page-content-2 #first-list').append(
                                    '<li>' +
                                    '<span></span>' +
                                    '<div class="title token-2-' + i + '" tabindex="0" data-trigger="focus">' + result[i]["args"]["receiverName"] + ' ' + house + '</div>' +
                                    '<div class="info">' + result[i]["args"]["location"] + '</div>' +
                                    '<div class="name token-3-' + i + '" tabindex="0" data-trigger="focus">' + date.toLocaleTimeString("en-us", timeOptions) + '</div>' +
                                    '</li>');

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

                            myContract.ownerOf.call(slug, function (error, result) {
                                if (!error && result.length !== 0) {
                                    if (result === web3.eth.accounts[0]) {
                                        $('.page-content-1').append(
                                            '<div class="card border" data-token-id="' + slug + '">' +
                                            '<div class="card-body">' +
                                            '<h5 class="card-title">Parcel ' + slug + '</h5>' +
                                            '<p class="card-subtitle text-muted last-update-text">Delivery address:</p>' +
                                            '<p class="card-text text-muted">' + token[3] + '</p>' +
                                            '</div>' +
                                            '<div class="card-footer bg-transparent">' +
                                            '<a id="activate-scanner" data-toggle="modal" data-target="#scannerModal" href="#" class="button button-lg align-center-transfer">Transfer</a>' +
                                            '</div>' +
                                            '</div>');

                                            $('#activate-scanner').on('click', function () {
                                                activateScanner();
                                            });
                                    } else {
                                        $('.page-content-1').append(
                                            '<div class="card border" data-token-id="' + slug + '">' +
                                            '<div class="card-body">' +
                                            '<h5 class="card-title">Parcel ' + slug + '</h5>' +
                                            '<p class="card-subtitle text-muted last-update-text">Delivery address:</p>' +
                                            '<p class="card-text text-muted">' + token[3] + '</p>' +
                                            '</div>' +
                                            '<div class="card-footer bg-transparent">' +
                                            '<div class="progress">' +
                                            html +
                                            '</div>' +
                                            '</div>' +
                                            '</div>');
                                    }
                                }
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
        let scanner = new Instascan.Scanner({video: document.getElementById('preview')});
        scanner.addListener('scan', function (content) {
            if (web3.isAddress(web3.toChecksumAddress(content))) {
                myContract.allowedToReceive(slug, content, function (error, result) {
                    console.log(result);
                    if (!error) {
                        if (result) {
                            scanner.stop();
                            targetId = content;
                            $('#scannerModal .modal-body video').toggleClass('hidden');
                            $('#scannerModal .modal-footer #transfer-close').toggleClass('hidden');
                            $('#scannerModal .modal-footer #transfer-deny').toggleClass('hidden');
                            $('#scannerModal .modal-footer #transfer-confirm').toggleClass('hidden');

                            $('#scannerModal .modal-body').append(
                                '<div class="transfer-content">' +
                                '<p class="align-center">Are you sure this is the right address?</p>' +
                                '<p class="align-center" id="transfer-id">' + content + '</p>' +
                                '</div>');

                            ActivateTriggers();
                        } else {
                            let alert =
                                $('<div class="alert alert-danger alert-dismissable">' +
                                    '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
                                    '<p class="alert-top">This address is not allowed to receive the parcel: </p><p class="long-address"><small>'+ content +'</small></p></div>');
                            alert.appendTo("#alerts");
                            alert.slideDown();
                            setTimeout(function () {
                                alert.slideToggle();
                            }, 5000);
                        }
                    }
                });

            } else {
                let alert =
                    $('<div class="alert alert-danger alert-dismissable">' +
                        '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
                        '<p class="alert-top">This is not a correct address: </p><p class="long-address"><small>'+ content +'</small></p></div>');
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
                    scanner.mirror = false;
                    scanner.start(cameras[0]);
                }
            } else {
                console.error('No cameras found.');
            }
        }).catch(function (e) {
            console.error(e);
        });

        function ActivateTriggers() {
            $('#transfer-confirm').on('click', function () {
                myContract.transferTokenTo(targetId, slug, {
                        from: web3.eth.accounts[0],
                        gas: 200000,
                        gasPrice: 2000000000
                    }, function (error, result) {
                        if (!error) {
                            var url = $('.url-finish-transfer').data('url');

                            $('#scannerModal .modal-footer #transfer-deny').toggleClass('hidden');
                            $('#scannerModal .modal-footer #transfer-confirm').toggleClass('hidden');
                            $('#scannerModal .modal-body .transfer-content').empty();
                            $('#scannerModal .modal-footer #transfer-close').toggleClass('hidden');
                            $('#scannerModal .modal-body').append(
                                '<div class="alert alert-primary">' +
                                'Parcel <u id="transfer-hash">transferred!</u> Results will be reflected in ~30 seconds.' +
                                '</div>');

                            $('#transfer-close').on('click', function () {
                                window.location.replace(url);
                            });

                            $('#transfer-hash').popover({
                                content: "<a target='_blank' href='https://rinkeby.etherscan.io/tx/" + result + "'>" + result + "</a>",
                                html: true,
                                placement: "bottom"
                            });

                            console.log(result);
                            console.log("https://rinkeby.etherscan.io/tx/" + result);
                        } else {
                            // console.error(error);
                        }
                    }
                );
            });



            $('#transfer-deny').on('click', function () {
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
}