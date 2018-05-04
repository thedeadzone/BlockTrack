$(document).ready(function() {
    myContract.parcelsOfReceiver.call(web3.eth.accounts[0], function(error, result) {
        if (!error) {
            var i = 0;
            var b = 0;
            for (i = 0; i < result.length; i++) {
                var tokenId = result[i];

                myContract.getToken.call(tokenId, function(error, result) {
                    b++;
                    if (!error) {
                        var done = false;
                        var table = '';
                        var date = new Date(result[1]*1000);

                        myContract.parcelDelivered({tokenId: tokenId}, { fromBlock: 0, toBlock: 'latest' }).get(function(error, result) {
                            if (!error) {
                                console.log(result);
                                done = true;
                            } else {
                                console.error(error);
                            }
                        });

                        var options = {
                            year: "numeric", month: "short",
                            day: "numeric", hour: "2-digit", minute: "2-digit"
                        };

                        if (done) {
                            table = $('#customer-done');
                        } else {
                            table = $('#customer-todo');
                        }

                        table.append(
                            "<tr data-token-id='"+ tokenId +"'>" +
                                "<td>"+ b +"</td>" +
                                "<td>"+ date.toLocaleTimeString("en-us", options)+"</td>" +
                                "<td>"+ result[2] +"</td>" +
                                "<td>"+ result[4] +"</td>" +
                            "</tr>");
                    } else
                        console.error(error);
                    }
                );
            }
        } else
            console.error(error);
        }
    );
});