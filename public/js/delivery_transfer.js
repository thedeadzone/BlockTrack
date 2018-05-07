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

    var gCtx = null;
    var gCanvas = null;

    var imageData = null;
    var ii=0;
    var jj=0;
    var c=0;


    function dragenter(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    function dragover(e) {
        e.stopPropagation();
        e.preventDefault();
    }
    function drop(e) {
        e.stopPropagation();
        e.preventDefault();

        var dt = e.dataTransfer;
        var files = dt.files;

        handleFiles(files);
    }

    function handleFiles(f)
    {
        var o=[];
        for(var i =0;i<f.length;i++)
        {
            var reader = new FileReader();

            reader.onload = (function(theFile) {
                return function(e) {
                    qrcode.decode(e.target.result);
                };
            })(f[i]);

            // Read in the image file as a data URL.
            reader.readAsDataURL(f[i]);	}
    }

    function read(a)
    {
        alert(a);
    }

    function load()
    {
        initCanvas(640,480);
        qrcode.callback = read;
        qrcode.decode("meqrthumb.png");
    }

    function initCanvas(ww,hh)
    {
        gCanvas = document.getElementById("qr-canvas");
        gCanvas.addEventListener("dragenter", dragenter, false);
        gCanvas.addEventListener("dragover", dragover, false);
        gCanvas.addEventListener("drop", drop, false);
        var w = ww;
        var h = hh;
        gCanvas.style.width = w + "px";
        gCanvas.style.height = h + "px";
        gCanvas.width = w;
        gCanvas.height = h;
        gCtx = gCanvas.getContext("2d");
        gCtx.clearRect(0, 0, w, h);
        imageData = gCtx.getImageData( 0,0,320,240);
    }

    function passLine(stringPixels) {
        //a = (intVal >> 24) & 0xff;

        var coll = stringPixels.split("-");

        for(var i=0;i<320;i++) {
            var intVal = parseInt(coll[i]);
            r = (intVal >> 16) & 0xff;
            g = (intVal >> 8) & 0xff;
            b = (intVal ) & 0xff;
            imageData.data[c+0]=r;
            imageData.data[c+1]=g;
            imageData.data[c+2]=b;
            imageData.data[c+3]=255;
            c+=4;
        }

        if(c>=320*240*4) {
            c=0;
            gCtx.putImageData(imageData, 0,0);
        }
    }

    function captureToCanvas() {
        flash = document.getElementById("embedflash");
        flash.ccCapture();
        qrcode.decode();
    }

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