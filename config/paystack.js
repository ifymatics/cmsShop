const request = require('request')
const paystack = (request) => {
    const MySecretKey = 'sk_test_dd5abb7835df9a4d83735e549c93c64855fc9e88';
    //sk_test_xxxx to be replaced by your own secret key

    //initialize paystack
    const initializePayment = (form, mycallback) => {
        const option = {
            url: 'https://api.paystack.co/transaction/initialize',
            headers: {
                Authorization: `Bearer ${MySecretKey}`,
                'content-type': 'application/json',
                'cache-control': 'no-cache'
            },

            form
        }
        const callback = (error, response, body) => {
            return mycallback(error, body);
        }
        //console.log(form)
        request.post(option, callback);
    }


    // verify payment
    const verifyPayment = (ref, mycallback) => {
        const option = {
            url: 'https://api.paystack.co/transaction/verify/' + encodeURIComponent(ref),
            headers: {
                authorization: `Bearer ${MySecretKey}`,
                'content-type': 'application/json',
                'cache-control': 'no-cache'
            }
        }
        const callback = (error, response, body) => {
            return mycallback(error, body);
        }
        request(option, callback);
    }
    return { initializePayment, verifyPayment, MySecretKey };
}
module.exports = paystack