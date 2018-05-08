$(document).ready(function() {
    var slug = $('#slug').data('slug');

    // myContract.getToken.call(slug, function(error, result) {
    //         if (!error) {
    //
    //             $('.page-content').append(
    //                 "<h1></h1>" +
    //                 "<p>"+ result[1] +"</p>" +
    //                 "<p>"+ result[2] +"</p>" +
    //                 "<p>"+ result[3] +"</p>"
    //             );
    //         } else
    //             console.error(error);
    //     }
    // );



    // TODO: Dit address niet hardcoded maken + checken of klopt
    // myContract.transferTokenTo('0xb3ad95541aCaa70Fc3AC85B6336D2c31d00c8fd7', slug, {
    //     from:web3.eth.accounts[0],
    //     gas:200000,
    //     gasPrice: 2000000000
    // }, function(error, result) {
    //         if (!error) {
    //             console.log(result);
    //             console.log("https://rinkeby.etherscan.io/tx/" + result);
    //             // TODO: Hier komt transaction hash + link er naar op rinkeby.etherscan
    //
    //             // $('.page-content').append(
    //             //     "<h1></h1>" +
    //             //     "<p>"+ result[2] +"</p>" +
    //             //     "<p>"+ result[3] +"</p>" +
    //             //     "<p>"+ result[4] +"</p>"
    //             // );
    //
    //         } else
    //             console.error(error);
    //     }
    // );
});