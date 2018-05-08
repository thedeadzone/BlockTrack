$(document).ready(function() {
    myContract.tokensOfOwner.call(web3.eth.accounts[0], function (error, result) {
        if (!error) {
            var i = 0;
            var b = 0;

            for (i = 0; i < result.length; i++) {
                var tokenId = result[i];
                myContract.getToken.call(tokenId, function (error, result) {
                    b++;
                    if (!error) {
                        var done = false;
                        var div = '';
                        var badge = '';
                        var date = '';
                        var message = '';
                        var token = result;

                        myContract.handOff({tokenId: tokenId}, { fromBlock: 0, toBlock: 'latest' }).get(function(error, result) {
                            if (!error) {
                                for (i = 0; i < result.length; i++) {
                                    if (result[i]['args']['delivered'] == true) {
                                        done = true;
                                    }
                                    if (i == result.length - 1) {
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

                                var url = $('.url-detail').data('url-detail').replace(/\d+/, tokenId);

                                div.append(
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
                                                    '<p class="card-text pull-right text-muted">' + token[1] + '</p>'+
                                                '</div>'+
                                            '</div>'+
                                        '</div>'+
                                    '</div>');
                            } else {
                                console.error(error);
                            }
                        });
                    } else {
                        console.error(error);
                    }
                });
            }
        } else {
            console.error(error);
        }
    });

    //delivery-index-history

    //TODO: Checken van handoff event welke pakketjes in zijn bezit zijn geweest.
});