$(document).ready(function() {

    var slug = $('#slug').data('slug');
    console.log(slug);

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

    myContract.createParcel({tokenId: slug}, { fromBlock: 0, toBlock: 'latest' }).get(function(error, result) {
        if (!error) {
            console.log(result);
        } else
            console.error(error);
    });
});