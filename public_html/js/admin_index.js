function startOthers() {
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

                                            var url = $('.url-detail').data('url-detail').replace(/\d+/, token[0]);

                                            div.append(
                                                '<div class="card border" data-token-id="' + id + '">' +
                                                '<div class="card-body">' +
                                                '<h5 class="card-title">Parcel ' + token[0] + ' <span class="badge badge-pill badge-' + badge + ' pull-right">' + message + '</span></h5>' +
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