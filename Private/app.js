var express = require("express")
var app = express();
var stripe = require("stripe")("CODE HERE");
var bodyParser = require('body-parser')
app.use(function(req, res, next){
    //console.log("setting")
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    next();
})
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.post("/order", (req, res)=>{
    //console.log("posting")
    stripe.tokens.retrieve(req.body.token, (err, token)=>{
        if(err){
            res.send("Internal Error (1). Your card has not been charged. Please try again.")
            //console.log(err)
            return
        }
        if(!token.card.address_line1 || !token.card.address_state || !token.card.address_city || !token.card.address_zip || !token.card.address_country || !req.body.email || !req.body.child_name || !req.body.child_school){
            res.send("Missing Field")
            return
        }
        stripe.orders.create({
            currency:"usd",
            items:[{
                type:"sku",
                parent:"sku_AsxOzqwjzytyah",
                quantity: req.body.amount
            }],
            email:req.body.email,
            metadata:{
                child_name:req.body.child_name,
                child_school:req.body.child_school
            }
        }, (err, order)=>{
            if(err){
                res.send("Internal Error (2). Your card has not been charged. Please try again.")
                console.log(err)
                return
            }

            stripe.orders.pay(order.id, {
                source:req.body.token
            }, (err, order)=>{
                if(err){
                    res.send("Invalid Card.")
                    //console.log(err)
                    return
                }
                if(order.status == "paid"){
                    res.send("Success")
                }
            })
        })
    })
})
app.listen(8080);
