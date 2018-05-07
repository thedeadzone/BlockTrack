$(document).ready(function() {
    var slug = $('#slug').data('slug');

    myContract.getToken.call(slug, function(error, result) {
            if (!error) {
                $('.page-content').append(
                    "<h1></h1>" +
                    "<p>"+ result[2] +"</p>" +
                    "<p>"+ result[3] +"</p>" +
                    "<p>"+ result[4] +"</p>"
                );

            } else
                console.error(error);
        }
    );


    myContract.transferTokenTo.sendTransaction({_to:'0x0C58C0Cef24e70842971A0361d2702a9Ca09b0DD', _tokenId: slug}, function(error, result) {
            if (!error) {
                console.log(result);

                // TODO: Hier komt transaction hash + link er naar op rinkeby.etherscan

                // $('.page-content').append(
                //     "<h1></h1>" +
                //     "<p>"+ result[2] +"</p>" +
                //     "<p>"+ result[3] +"</p>" +
                //     "<p>"+ result[4] +"</p>"
                // );

            } else
                console.error(error);
        }
    );

//     var data = myContract.safeTransferFrom({_from: web3.defaultAccount, _to:'0x0C58C0Cef24e70842971A0361d2702a9Ca09b0DD', _tokenId: slug});
//
// //    Fromm, to and token ID
//     mycontract.methods.safeTransferFrom(toAddress, 1).send({}, function(err, txHash) {
//         console.log(err, txHash);
//     });

});