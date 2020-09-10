$(document).ready(()=>{
    $("p[name=total]").html(Math.round(parseInt($("#selector").find(":selected").text()) * 29.99 * 1.08875 * 100)/100);
    $("#selector").change(()=>{
        $("p[name=total]").html(Math.round(parseInt($("#selector").find(":selected").text()) * 29.99 * 1.08875 * 100)/100);
    })
    var stripe = Stripe('KEY_HERE');
    var elements = stripe.elements();
    var card = elements.create('card', {
        style: {
            base: {
                iconColor: '#666EE8',
                color: '#31325F',
                lineHeight: '40px',
                fontWeight: 300,
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSize: '15px',

                '::placeholder': {
                    color: '#CFD7E0',
                },
            },
        }
    });
    card.mount('#card');

    function sendData(){
        console.log("Paying Now");
        stripe.createToken(card, {
            name:$("#card-name").val(),
            address_line1:$("#address1").val(),
            address_line2:$("#address2").val(),
            address_city:$("#city").val(),
            address_state:$("#state").val(),
            address_zip:$("#zip").val(),
            address_country:$("#country").val(),
        }).then((result)=>{
            if (result.error) {
                // Inform the user if there was an error
                var errorElement = document.getElementById('errors');
                errorElement.textContent = result.error.message;
            } else {
                // Send the token to your server
                console.log(result.token.id);
                sendToServer(result.token.id);
            }
        })
    }
    function sendToServer(token){
        $("#pay-button").prop("disabled",true);
        var data = {
            token:token,
            amount:parseInt($("#selector").find(":selected").text()),
            email: $("#email").val(),
            child_name: $("#child-name").val(),
            child_school:$("#school-selector").find(":selected").text()
        }

        $.post("http://localhost:8080/order", data, function(response){
            var errorElement = document.getElementById('errors');
            errorElement.textContent = response;
            $("#pay-button").prop("disabled",false);
            if(response == "Success"){
                $("#pay-button").prop("disabled",true);
                $("#yay").css("display", "block");
                errorElement.textContent = "";
            }

        }).fail(function(){
            var errorElement = document.getElementById('errors');
            errorElement.textContent = "There was an error sending the request. Please try again.";
            $("#pay-button").prop("disabled",false);
        })
    }
    $("#pay-button").click(sendData);
})
