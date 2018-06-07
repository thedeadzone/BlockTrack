function startOthers() {
    let slug = $('#slug').data('slug');
    let html = '<span class="badge badge-pill badge-primary pull-right">In Transport</span>';
    let html_footer = '<div class="card-footer bg-transparent"><button type="button" id="refreshData" class="btn btn-secondary align-center-transfer">Refresh</button></div>';
    let url = $('.url').data('url-customer');

    // Gets all information for the current token
    myContract.getToken(slug, function(error, result) {
        if (!error) {
            if (result.length !== 0) {
                let token = result;

                // Acces restriction check for token receiver
                if (token[3] != web3.eth.accounts[0]) {
                    window.location.replace(url);
                }

                // Get all handoff events for the token
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

                                // Append handoff event details to the list
                                $('.page-content-2 #first-list').append(
                                    '<li>'+
                                        '<span></span>' +
                                        '<div class="title token-2-' + i + '" tabindex="0" data-trigger="focus">' + result[i]["args"]["receiverName"] + ' '+ house +'</div>'+
                                        '<div class="info">' + result[i]["args"]["location"] + '</div>'+
                                        '<div class="name token-3-' + i + '" tabindex="0" data-trigger="focus">' + date.toLocaleTimeString("en-us", timeOptions) + '</div>'+
                                    '</li>');

                                // Popover with link to the owner on etherscan
                                $('.token-2-' + i).popover({
                                    content: "<a target='_blank' href='https://rinkeby.etherscan.io/address/" + result[i]['args']['owner'] + "'>" + result[i]['args']['owner'] + "</a>",
                                    html: true,
                                    placement: "bottom"
                                });

                                // Popover with link to the transaction on etherscan
                                $('.token-3-' + i).popover({
                                    content: "<a target='_blank' href='https://rinkeby.etherscan.io/tx/" + result[i]['transactionHash'] + "'>" + result[i]['transactionHash'] + "</a>",
                                    html: true,
                                    placement: "bottom"
                                });
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