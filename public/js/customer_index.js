$(document).ready(function() {
    myContract.parcelsOfReceiver.call(web3.eth.accounts[0], function (error, result) {
        if (!error) {
            var i = 0;
            var b = 0;
            for (i = 0; i < result.length; i++) {
                var tokenId = result[i];

                myContract.getToken.call(tokenId, function (error, result) {
                    b++;
                    if (!error) {
                        var done = false;
                        var table = '';
                        var date = new Date(result[0] * 1000);

                        myContract.handOff({tokenId: tokenId}, { fromBlock: 0, toBlock: 'latest' }).get(function(error, result) {
                            if (!error) {
                                for (i = 0; i < result.length; i++) {
                                    if (result[i]['args']['delivered'] == true) {
                                        done = true;
                                    }
                                }
                            } else {
                                console.error(error);
                            }
                        });

                        if (done) {
                            table = $('#customer-done tbody');
                        } else {
                            table = $('#customer-todo tbody');
                        }
                        table.empty();
                        table.append(
                            "<tr data-token-id='" + tokenId + "'>" +
                            "<td>" + b + "</td>" +
                            "<td>" + date.toLocaleTimeString("en-us", timeOptions) + "</td>" +
                            "<td>" + result[2] + "</td>" +
                            "<td>" + result[3] + "</td>" +
                            "</tr>");
                    } else {
                        console.error(error);
                    }
                });
            }
        } else {
            console.error(error);
        }
    });
});