function startOthers() {
    // Routes the user to the right webpage based on the role.
    let url = $('.url').data('url-customer');

    if (role == 1) {
        url = $('.url').data('url-deliverer');
    } else if (role == 2) {
        url = $('.url').data('url-shippingcompany');
    }

    window.location.replace(url);
}