function startOthers() {
    myContract.parcelsOfReceiver(web3.eth.accounts[0], function (error, result) {
        if (!error) {
            if (result.length !== 0) {
                let i = 0;

                for (i = 0; i < result.length; i++) {
                    let tokenId = result[i];
                    myContract.getToken.call(tokenId, function (error, result) {
                        if (!error) {
                            if (result.length !== 0) {
                                let date = '';
                                let token = result;

                                myContract.handOff({tokenId: tokenId}, {fromBlock: 0, toBlock: 'latest'}).get(function (error, result) {
                                    if (!error) {
                                        if (result.length !== 0) {
                                            for (i = 0; i < result.length; i++) {
                                                if (i === result.length - 1) {
                                                    date = new Date(result[i]['args']['time']['c'][0] * 1000);
                                                }
                                            }
                                            let url = $('.url-detail').data('url-detail').replace(/\d+/, tokenId);

                                            $('.customer-todo').append(
                                                '<div class="card border" data-token-id="' + tokenId + '">' +
                                                    '<div class="card-body">' +
                                                        '<h5 class="card-title">Parcel ' + tokenId + ' <span class="badge badge-pill badge-primary pull-right">In Transport</span></h5>' +
                                                        '<p class="card-subtitle text-muted last-update-text">Last update: ' + date.toLocaleTimeString("en-us", timeOptions) + '</p>' +
                                                    '</div>' +
                                                    '<div class="card-footer bg-transparent">' +
                                                        '<div class="row">' +
                                                            '<div class="col-6">' +
                                                                '<a href="' + url + '" class="card-link">Details</a>' +
                                                            '</div>' +
                                                            '<div class="col-6">' +
                                                                '<p class="card-text pull-right text-muted">' + token[1] + '</p>' +
                                                            '</div>' +
                                                        '</div>' +
                                                    '</div>' +
                                                '</div>');
                                        } else {
                                            console.log('No data');
                                        }
                                    } else {
                                        console.error(error);
                                    }
                                });
                            } else {
                                console.log('No data');
                            }
                        } else {
                            console.error(error);
                        }
                    });
                }
            } else {
            $('.customer-todo').append(
                '<div class="card border no-data-card">' +
                    '<div class="card-body">' +
                        '<h5 class="card-title">No parcels expected.</h5>' +
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
            if (result.length !== 0) {
                let i = 0;
                let date = '';
                let tokenId = result[i]['args']['tokenId']['c'];
                let handOff = result;

                for (i = 0; i < result.length; i++) {
                    let count = i;
                    myContract.getToken.call(result[count]['args']['tokenId']['c'][0], function (error, result) {
                        if (!error) {
                            if (result.length !== 0) {

                                date = new Date(handOff[count]['args']['time']['c'][0] * 1000);

                                let url = $('.url-detail').data('url-detail').replace(/\d+/, tokenId);

                                $('.customer-done').append(
                                    '<div class="card border" data-token-id="' + tokenId + '">' +
                                        '<div class="card-body">' +
                                            '<h5 class="card-title">Parcel ' + tokenId + ' <span class="badge badge-pill badge-success pull-right">Delivered</span></h5>' +
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
            } else {
                $('.customer-done').append(
                    '<div class="card border no-data-card">' +
                        '<div class="card-body">' +
                            '<h5 class="card-title">No parcels delivered.</h5>' +
                            '<p class="card-subtitle text-muted last-update-text">(for now)</p>' +
                        '</div>' +
                    '</div>');
            }
        } else {
            console.error(error);
        }
    });
}