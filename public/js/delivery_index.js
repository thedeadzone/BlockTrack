$(document).ready(function() {
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

                                var url = $('.url-detail').data('url-detail').replace(/\d+/, tokenId);

                                $('.customer-done').append(
                                    '<div class="card border" data-token-id="' + tokenId + '">' +
                                    '<div class="card-body">'+
                                    '<h5 class="card-title">Package ' + tokenId + ' <span class="badge badge-pill badge-'+badge+' pull-right">'+message+'</span></h5>' +
                                    '<p class="card-subtitle text-muted last-update-text">Last update: ' + date.toLocaleTimeString("en-us", timeOptions) + '</p>' +
                                    '</div>' +
                                    '<div class="card-footer bg-transparent">'+
                                    '<div class="row">'+
                                    '<div class="col-6">'+
                                    '<a href="' + url + '" class="card-link">Details</a>'+
                                    '</div>'+
                                    '<div class="col-6">'+
                                    '<p class="card-text pull-right text-muted">' + result[1] + '</p>'+
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
                console.log('No data');
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

                                var url = $('.url-detail').data('url-detail').replace(/\d+/, tokenId);

                                $('.customer-todo').append(
                                    '<div class="card border" data-token-id="' + tokenId + '">' +
                                    '<div class="card-body">' +
                                    '<h5 class="card-title">Package ' + tokenId + ' <span class="badge badge-pill badge-' + badge + ' pull-right">' + message + '</span></h5>' +
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
        } else {
            console.error(error);
        }
    });
});