function startOthers() {
    let slug = $('#slug').data('slug');
    let targetId = '';
    let html = '<span class="badge badge-pill badge-primary pull-right">In Transport</span>';
    let html_footer = '<div class="card-footer bg-transparent"><button type="button" id="activate-scanner" href="#" class="btn btn-warning align-center-transfer margin-bottom" data-toggle="modal" data-target="#scannerModal">Scan Receiver QR</button><button type="button" id="refreshData" class="btn btn-secondary align-center-transfer margin-b">Refresh</button></div>';
    let url = $('.url').data('url-deliverer');

    // If cipher browser, remove the modal that's not used
    if (isCipher && canScanQRCode) {
        $('#scannerModal .modal-body video').addClass('hidden');
        html_footer = '<div class="card-footer bg-transparent"><button type="button" id="activate-scanner" href="#" class="btn btn-warning align-center-transfer margin-bottom">Scan Receiver QR</button><button type="button" id="refreshData" class="btn btn-secondary align-center-transfer margin-b">Refresh</button></div>';
    }

    // Gets all information for the current token
    myContract.getToken(slug, function (error, result) {
        if (!error) {
            if (result.length !== 0) {
                token = result;

                // Get all handoff events that the token has had + the status of the token at this time.
                myContract.handOff({tokenId: slug}, {fromBlock: 0, toBlock: 'latest'}).get(function (error, result) {
                    if (!error) {
                        if (result.length !== 0) {
                            let i = 0;
                            for (i = result.length - 1; i >= 0; i--) {
                                let house = '';
                                if (result[i]['args']['delivered'] === true) {
                                    house = '<i class="fas fa-home"></i>';
                                    html = '<span class="badge badge-pill badge-success pull-right">Delivered</span>';
                                    html_footer = '';
                                }

                                let date = new Date(result[i]['args']['time'] * 1000);

                                $('.page-content-2 #first-list').append(
                                    '<li>' +
                                    '<span></span>' +
                                    '<div class="title" tabindex="0" data-trigger="focus">' + result[i]["args"]["receiverName"] + ' ' + house + '</div>' +
                                    '<div class="info">' + result[i]["args"]["location"] + '</div>' +
                                    '<div class="name token-3-' + i + '" tabindex="0" data-trigger="focus">' + date.toLocaleTimeString("en-us", timeOptions) + '</div>' +
                                    '</li>');

                                // Popover with link to the transaction on etherscan
                                $('.token-3-' + i).popover({
                                    content: "<a target='_blank' href='https://rinkeby.etherscan.io/tx/" + result[i]['transactionHash'] + "'>" + result[i]['transactionHash'] + "</a>",
                                    html: true,
                                    placement: "bottom"
                                });
                            }

                            // Checks the token owner based on the token
                            myContract.ownerOf.call(slug, function (error, result) {
                                if (!error && result.length !== 0) {
                                    if (result != web3.eth.accounts[0]) {
                                        if (html_footer != '') {
                                            html_footer = '<div class="card-footer bg-transparent"><button type="button" id="refreshData" class="btn btn-secondary align-center-transfer">Refresh</button></div>';
                                        }
                                    }

                                    // Add token information to the page
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

    // Activates the scanner on phone/computer
    function activateScanner() {
        if (isCipher && canScanQRCode) {
            // Scanner for mobile Cipher browser
            window.web3.currentProvider
                .scanQRCode(/^.+$/)
                .then(data => {
                    // Check if the scanned value is allowed to receive the package, if so then you can confirm the transaction
                    myContract.allowedToReceive(slug, data, function (error, result) {
                        if (!error) {
                            if (result) {
                                targetId = data;
                                ActivateTriggers();
                            } else {
                                createAddressAlert('This person is not allowed to receive the parcel: ', content);
                            }
                        } else {
                            createAddressAlert('You should scan the (refreshed) receiver QR Code, incorrect data: ', data);
                        }
                    });
                })
                .catch(err => {
                    console.log('Error:', err);
                });
        } else {
            // Scanner for computer browser
            let scanner = new Instascan.Scanner({video: document.getElementById('preview')});
            scanner.addListener('scan', function (content) {
                // Check if the scanned value is allowed to receive the package, if so then you can confirm the transaction
                myContract.allowedToReceive(slug, content, function (error, result) {
                    if (!error) {
                        if (result) {
                            targetId = content;
                            $('#scannerModal .modal-body video').addClass('hidden');
                            $('#scannerModal .modal-footer #transfer-close').addClass('hidden');

                            ActivateTriggers();
                        } else {
                            $('#scannerModal').modal('hide');
                            createAddressAlert('This person is not allowed to receive the parcel: ', content);
                        }
                    } else {
                        $('#scannerModal').modal('hide');
                        createAddressAlert('You should scan the (refreshed) Receiver QR Code, incorrect data: ', data);
                    }
                });
            });

            // Selects the second camera if there is multiple options, for mobile phones this is the back camera.
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

    // Once called it will display the confirmation request via the external web3 provider
    function ActivateTriggers() {
        myContract.transferTokenTo(slug, targetId, {
                from: web3.eth.accounts[0],
                gas: 250000,
                gasPrice: 2000000000
            }, function (error, result) {
                if (!error) {
                    $("#scannerModal").modal('show');
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
            });
    }
}