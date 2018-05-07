$(document).ready(function() {
    var slug = $('#slug').data('slug');

    myContract.getToken.call(slug, function(error, result) {
        if (!error) {
            $('.page-content').append(
                "<h1></h1>" +
                "<p>"+ result[1] +"</p>" +
                "<p>"+ result[2] +"</p>" +
                "<p>"+ result[3] +"</p>"
            );

        } else
            console.error(error);
        }
    );

    myContract.handOff({tokenId: slug}, { fromBlock: 0, toBlock: 'latest' }).get(function(error, result) {
        if (!error) {
            var i = 0;
            $('#delivery-details tbody').empty();

            for (i = 0; i < result.length; i++) {
                var date = new Date(result[i]['args']['time']*1000);
                var owner = result[i]['args']['owner'];

                $('#customer-details').append(
                    "<tr>" +
                    "<td>" + date.toLocaleTimeString("en-us", timeOptions) + "</td>" +
                    "<td>" + result[i]['args']['location'] + "</td>" +
                    "<td>" + result[i]['args']['delivererName'] + "</td>" +
                    "<td>" + result[i]['args']['receiverName'] + "</td>" +
                    "</tr>");
            }
        } else
            console.error(error);
    });
});