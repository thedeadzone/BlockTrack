function startOthers() {
    let slug = $('#slug').data('slug');
    let token = '';
    let targetId = '';
    let html = '<span class="badge badge-pill badge-primary pull-right">In Transport</span>';
    let html_footer = '<div class="card-footer bg-transparent"><button type="button" id="activate-scanner" href="#" class="btn btn-primary align-center-transfer margin-bottom" data-toggle="modal" data-target="#scannerModal">Transfer</button><button type="button" id="refreshData" class="btn btn-secondary align-center-transfer margin-b">Refresh</button></div>';
    let house = '';
    let url = $('.url-home').data('url');

    // If cipher browser, remove the modal that's not used
    if (isCipher && canScanQRCode) {
        $('#scannerModal .modal-body video').addClass('hidden');
    }

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
                                    html = '<span class="badge badge-pill badge-success pull-right">Delivered</span>';
                                    html_footer = '';
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
                                    if (result != web3.eth.accounts[0]) {
                                        if (html_footer != '') {
                                            html_footer = '<div class="card-footer bg-transparent"><button type="button" id="refreshData" class="btn btn-secondary align-center-transfer">Refresh</button></div>';
                                        }
                                    }

                                    $('.page-content-1').append(
                                        '<div class="card border" data-token-id="' + slug + '">' +
                                            '<div class="card-body">' +
                                                '<h5 class="card-title">Parcel ' + slug + html +'</h5>' +
                                                '<p class="card-subtitle text-muted last-update-text">Delivery address:</p>' +
                                                '<p class="card-text text-muted">' + token[4] + '</p>' +
                                            '</div>' +
                                            html_footer +
                                        '</div>');

                                    $('#refreshData').on('click', function() {
                                        location.reload();
                                    });

                                    $('#activate-scanner').on('click', function () {
                                        activateScanner();
                                    });
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
            window.location.replace(url);
            console.error(error);
        }
    });

    function activateScanner() {
        if (isCipher && canScanQRCode) {
            window.web3.currentProvider
                .scanQRCode(/^.+$/)
                .then(data => {
                    myContract.allowedToReceive(slug, data, function (error, result) {
                        if (!error) {
                            if (result) {
                                targetId = data;
                                $('#scannerModal .modal-footer #transfer-close').addClass('hidden');
                                $('#scannerModal .modal-footer #transfer-deny').removeClass('hidden');
                                $('#scannerModal .modal-footer #transfer-confirm').removeClass('hidden');

                                $('#scannerModal .modal-body #confirmation').empty().append(
                                    '<div class="transfer-content">' +
                                    '<p class="align-center">Are you sure you want to transfer the parcel to this address?</p>' +
                                    // '<p class="align-center" id="transfer-id">' + data + '</p>' +
                                    '</div>');

                                ActivateTriggers();
                            } else {
                                $('#scannerModal').modal('hide');
                                createAddressAlert('This person is not allowed to receive the parcel: ', content);
                            }
                        } else {
                            $('#scannerModal').modal('hide');
                            createAddressAlert('You should scan the (refreshed) receiver QR Code, incorrect data: ', data);
                        }
                    });
                })
                .catch(err => {
                    $('#scannerModal').modal('hide');
                    console.log('Error:', err);
                });
        } else {
            let scanner = new Instascan.Scanner({video: document.getElementById('preview')});
            scanner.addListener('scan', function (content) {
                myContract.allowedToReceive(slug, content, function (error, result) {
                    if (!error) {
                        if (result) {
                            targetId = content;
                            $('#scannerModal .modal-body video').addClass('hidden');
                            $('#scannerModal .modal-footer #transfer-close').addClass('hidden');
                            $('#scannerModal .modal-footer #transfer-deny').removeClass('hidden');
                            $('#scannerModal .modal-footer #transfer-confirm').removeClass('hidden');

                            $('#scannerModal .modal-body #confirmation').empty().append(
                                '<div class="transfer-content">' +
                                '<p class="align-center">Are you sure you want to transfer the parcel to this address?</p>' +
                                // '<p class="align-center" id="transfer-id">' + content + '</p>' +
                                '</div>');

                            ActivateTriggers();
                        } else {
                            $('#scannerModal').modal('hide');
                            createAddressAlert('This person is not allowed to receive the parcel: ', content);
                        }
                    } else {
                        $('#scannerModal').modal('hide');
                        createAddressAlert('You should scan the (refreshed) receiver QR Code, incorrect data: ', data);
                    }
                });
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
        }
    }


    function ActivateTriggers() {
        $('#transfer-confirm').on('click', function () {
            myContract.transferTokenTo(slug, targetId, {
                    from: web3.eth.accounts[0],
                    gas: 250000,
                    gasPrice: 2000000000
                }, function (error, result) {
                    if (!error) {
                        $('#scannerModal .modal-footer #transfer-deny').addClass('hidden');
                        $('#scannerModal .modal-footer #transfer-confirm').addClass('hidden');
                        $('#scannerModal .modal-footer #transfer-close').removeClass('hidden');
                        $('#scannerModal .modal-body').empty().append(
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
                        $("#scannerModal").modal('hide');
                    }
                }
            );
        });


        $('#transfer-deny').on('click', function () {
            $('#scannerModal .modal-footer #transfer-deny').addClass('hidden');
            $('#scannerModal .modal-footer #transfer-confirm').addClass('hidden');
            $('#scannerModal .modal-body #confirmation').empty();
            if (!isCipher && !canScanQRCode) {
                $('#scannerModal .modal-body video').removeClass('hidden');
            } else {
                $("#scannerModal").modal('hide');
            }
            $('#scannerModal .modal-footer #transfer-close').removeClass('hidden');
        });
    }
}