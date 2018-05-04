$(document).ready(function() {
    myContract.parcelsOfReceiver.call(web3.eth.accounts[0], function(error, result) {
        if (!error) {
            var i = 0;
            var b = 0;
            for (i = 0; i < result.length; i++) {
                var tokenId = result[i];
                myContract.getToken.call(result[i], function(error, result) {
                    b++;
                    if (!error) {
                        var options = {
                            year: "numeric", month: "short",
                            day: "numeric", hour: "2-digit", minute: "2-digit"
                        };
                        var date = new Date(result[1]*1000);

                        $('#delivery-index').append(
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