$(document).ready(function() {
    var slug = $('#slug').data('slug');
    var token = '';
    var html = '<div class="progress-bar" role="progressbar" style="width: 100%">In Transport</div>';
    var house = '';

    myContract.getToken(slug, function(error, result) {
        if (!error) {
            if (result.length != 0) {
                token = result;

                myContract.handOff({tokenId: slug}, {fromBlock: 0, toBlock: 'latest'}).get(function (error, result) {
                    if (!error) {
                        if (result.length != 0) {
                            var i = 0;
                            for (i = result.length - 1; i >= 0; i--) {
                                house = '';
                                if (result[i]['args']['delivered'] == true) {
                                    house = '<i class="fas fa-home"></i>';
                                    html = '<div class="progress-bar bg-success" role="progressbar" style="width: 100%">Delivered</div>';
                                }

                                var date = new Date(result[i]['args']['time'] * 1000);
                                var owner = result[i]['args']['owner'];

                                $('.page-content-2 #first-list').append(
                                    '<li>'+
                                        '<span></span>' +
                                        '<div class="title token-2-' + i + '" tabindex="0" data-trigger="focus">' + result[i]["args"]["receiverName"] + ' '+ house +'</div>'+
                                        '<div class="info">' + result[i]["args"]["location"] + '</div>'+
                                        '<div class="name token-3-' + i + '" tabindex="0" data-trigger="focus">' + date.toLocaleTimeString("en-us", timeOptions) + '</div>'+
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
});