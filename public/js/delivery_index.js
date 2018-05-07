$(document).ready(function() {
    myContract.tokensOfOwner.call(web3.eth.accounts[0], function(error, result) {
        if (!error) {
            var i = 0;
            var b = 0;

            if (result.length >= 1) {
                $('#delivery-index tbody').empty();
            }

            for (i = 0; i < result.length; i++) {
                var tokenId = result[i];
                myContract.getToken.call(tokenId, function(error, result) {
                    b++;
                    if (!error) {
                        $('#delivery-index').append(
                            "<tr data-token-id='"+ tokenId +"'>" +
                                "<td>"+ b +"</td>" +
                                "<td>"+ result[1] +"</td>" +
                                "<td>"+ result[2] +"</td>" +
                                "<td>"+ result[3] +"</td>" +
                            "</tr>");
                    } else
                        console.error(error);
                    }
                );
            }
        } else {
            console.error(error);
        }
    });
});