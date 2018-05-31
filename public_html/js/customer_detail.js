function startOthers() {
    let slug = $('#slug').data('slug');
    let token = '';
    let html = '<span class="badge badge-pill badge-primary pull-right">In Transport</span>';
    let html_footer = '<div class="card-footer bg-transparent"><button type="button" id="refreshData" class="btn btn-secondary align-center-transfer">Refresh</button></div>';
    let house = '';
    let url = $('.url-home').data('url');

    myContract.getToken(slug, function(error, result) {
        if (!error) {
            if (result.length !== 0) {
                token = result;

                if (token[3] != web3.eth.accounts[0]) {
                    window.location.replace(url);
                }

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
                                        '<h5 class="card-title">Parcel ' + slug + html +'</h5>' +
                                        '<p class="card-subtitle text-muted last-update-text">Delivery address:</p>' +
                                        '<p class="card-text text-muted">' + token[4] + '</p>' +
                                    '</div>' +
                                    html_footer +
                                '</div>');

                            $('#refreshData').on('click', function() {
                                location.reload();
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
}