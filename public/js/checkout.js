$(document).ready(function () {
    let email = "";
    let $form = $('#payment-form');
    $form.submit(function (e) {

        $('#charge-error').addClass('d-none')
        $form.find('button').prop('disabled', true);
        let cart = $('#cart').val();
        let full_name = $('#full_name').val();
        let email = $('#email').val();
        let amount = $('#amount').val() * 100;
        email = email.split('@');
        if (email[1] !== '@') {

            window.location.replace('/users/login');

        } else if (email[1] === '@') {

            var handler = PaystackPop.setup({
                key: 'pk_test_3b3cdd21d45ddae5063a7c1493e5f4a405a9b2bf',
                email: email.trim(), //'talk2chisom080@gmail.com',
                amount: amount,
                currency: "NGN",
                ref: '' + Math.floor((Math.random() * 1000000000) + 1), // generates a pseudo-unique reference. Please replace with a reference you generated. Or remove the line entirely so our API will generate one for you
                metadata: {
                    custom_fields: [
                        {
                            display_name: "Items bought",
                            variable_name: "items_bought",
                            value: JSON.stringify(cart),
                            display_name: "Full Name",
                            variable_name: "full_name",
                            value: full_name
                        }
                    ]
                },
                callback: callback,
                onClose: function () {
                    alert('window closed');
                    $form.find('button').prop('disabled', false);
                }
            });
            handler.openIframe();
        }

        return false;
    });

});
function callback(response) {
    if (response.status == 'false') {
        $('#charge-error').text(response.message);
        $('#charge-error').removeClass('d-none')
        $form.find('button').prop('disabled', false);
    }
    else {
        console.log(response)
        $form.append($('<input type="hidden" name="txref"/>').val(response.reference));
        $form.get(0).submit(function (response) {

        });
    }

}
function myTrim(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
