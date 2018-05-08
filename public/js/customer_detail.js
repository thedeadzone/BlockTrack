$(document).ready(function() {
    var slug = $('#slug').data('slug');
    var token = '';
    var badge = '';

    myContract.getToken(slug, function(error, result) {
            if (!error) {
                token = result;

                myContract.handOff({tokenId: slug}, {fromBlock: 0, toBlock: 'latest'}).get(function (error, result) {
                    if (!error) {
                        var i = 0;

                        if (result.length >= 1) {
                            $('#customer-details tbody').empty();
                        }
                        if (result[i]['args']['delivered'] == true) {
                            badge = 'success';
                        } else {
                            badge = 'transparent';
                        }

                        $('.page-content').append(
                            '<div class="card border" data-token-id="' + slug + '">' +
                                '<div class="card-body">'+
                                    '<h5 class="card-title">Package ' + slug + '</h5>' +
                                    '<p class="card-subtitle text-muted last-update-text">Delivery address:</p>' +
                                    '<p class="card-text text-muted">' + token[3] + '</p>' +
                                '</div>' +
                                '<div class="card-footer bg-transparent">'+
                                    // '<p class="text-muted text-parcel-footer">' + token[1] + '</p>'+
                                    '<div class="progress">'+
                                        '<div class="progress-bar" role="progressbar" style="width: 50%">Transport</div>'+
                                        '<div class="progress-bar bg-' + badge + '" role="progressbar" style="width: 50%">Delivered</div>'+
                                    '</div>'+
                                '</div>'+
                            '</div>' +
                        '<hr>');

                        for (i = result.length -1; i >= 0; i--) {
                            var date = new Date(result[i]['args']['time'] * 1000);
                            var owner = result[i]['args']['owner'];

                            $('.page-content').append(
                                '<div class="card text-center">' +
                                    '<div class="card-header">'+
                                        '<p>' + 'Previous' + ' > ' + result[i]["args"]["location"] +'</p>' +
                                    '</div>'+
                                    '<div class="card-body">'+
                                        '<h5 class="card-title token-1-'+i+'">'+ result[i]["args"]["receiverName"] + '</h5>'+
                                        '<p class="card-text token-2-'+i+' text-muted">'+ result[i]["args"]["delivererName"] +'</p>'+
                                    '</div>'+
                                    '<div class="card-footer">'+
                                        '<p class="text-muted token-3-'+i+'">' + date.toLocaleTimeString("en-us", timeOptions) + '</p>'+
                                    '</div>'+
                                '</div>');
                            $('.token-1-' + i).popover({content: "<a target='_blank' href='https://rinkeby.etherscan.io/address/"+result[i]['args']['receiver']+"'>"+result[i]['args']['receiver']+"</a>", html: true, placement: "bottom"});
                            $('.token-2-' + i).popover({content: "<a target='_blank' href='https://rinkeby.etherscan.io/address/"+result[i]['args']['owner']+"'>"+result[i]['args']['owner']+"</a>", html: true, placement: "bottom"});
                            $('.token-3-' + i).popover({content: "<a target='_blank' href='https://rinkeby.etherscan.io/tx/"+result[i]['transactionHash']+"'>"+result[i]['transactionHash']+"</a>", html: true, placement: "bottom"});
                        }
                    } else
                        console.error(error);
                });
            } else {
                console.error(error);
            }
        }
    );


});