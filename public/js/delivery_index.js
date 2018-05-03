$(document).ready(function() {
    myContract.tokensOfOwner.call(web3.eth.accounts[0], function(error, result) {
        if (!error) {
            var i = 0;
            var b = 0;
            for (i = 0; i < result.length; i++) {
                myContract.getToken.call(result[i], function(error, result) {
                    b++;
                    if (!error) {
                        $('#delivery-index').append(
                            "<tr>" +
                            "<td>"+ b +"</td>" +
                            "<td>"+ result[2] +"</td>" +
                            "<td>"+ result[3] +"</td>" +
                            "<td>"+ result[4] +"</td>" +
                            "</tr>");
                    }
                    else
                        console.error(error);
                    }
                );
            }
        } else
            console.error(error);
        }
    );
});