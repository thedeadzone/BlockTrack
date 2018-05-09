$(document).ready(function() {
    myContract.totalSupply(function (error, result) {
        if (!error) {
            if (result.length != 0) {
                var i = 0;
                var tokenId = 0;

                for (i = 0; i < result['c'][0]; i++) {
                    myContract.getToken.call(i, function (error, result) {
                        tokenId = i;
                        if (!error) {
                            if (result.length != 0) {
                                var done = false;
                                var div = '';
                                var badge = '';
                                var date = '';
                                var message = '';
                                var token = result;

                                myContract.handOff({tokenId: tokenId}, {
                                    fromBlock: 0,
                                    toBlock: 'latest'
                                }).get(function (error, result) {
                                    if (!error) {
                                        if (result.length != 0) {
                                            for (i = 0; i < result.length; i++) {
                                                if (result[i]['args']['delivered'] == true) {
                                                    done = true;
                                                }
                                                if (i == result.length - 1) {
                                                    console.log(result[i]['args']['time']['c'][0]);
                                                    date = new Date(result[i]['args']['time']['c'][0] * 1000);
                                                }
                                            }

                                            if (done) {
                                                div = $('.customer-done');
                                                badge = 'success';
                                                message = 'Delivered'
                                            } else {
                                                div = $('.customer-todo');
                                                badge = 'primary';
                                                message = 'In Transport';
                                            }

                                            var url = $('.url-app_admin_detail').data('url-detail').replace(/\d+/, i);

                                            div.append(
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
                                                '<p class="card-text pull-right text-muted">' + token[1] + '</p>' +
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
});