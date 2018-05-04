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

    myContract.handOff({tokenId: slug}, { fromBlock: 0, toBlock: 'latest' }).get(function(error, result) {
        if (!error) {
            // console.log(result);
            var i = 0;
            for (i = 0; i < result.length; i++) {
                // console.log(result[i]);
                $('#delivery-details').append(
                    "<tr>" +
                    "<td>" + new Date(result[i]['args']['time']*1000) + "</td>" +
                    "<td>" + result[i]['args']['location'] + "</td>" +
                    "<td>" + result[i]['args']['owner'] + "</td>" +
                    "<td>" + result[i]['args']['receiver'] + "</td>" +
                    "</tr>");
            }
        } else
            console.error(error);
    });

    myContract.createParcel({tokenId: slug}, { fromBlock: 0, toBlock: 'latest' }).get(function(error, result) {
        if (!error) {
            console.log(result);
            var i = 0;
            for (i = 0; i < result.length; i++) {
                console.log(result[i]);
                $('#delivery-details').append(
                    "<tr>" +
                    "<td>" + new Date(result[i]['args']['time']*1000) + "</td>" +
                    "<td>" + result[i]['args']['location'] + "</td>" +
                    "<td>0x00000000</td>" +
                    "<td>" + result[i]['args']['receiver'] + "</td>" +
                    "</tr>");
            }
        } else
            console.error(error);
    });
});