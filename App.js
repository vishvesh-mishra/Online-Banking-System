const express = require('express');
const path = require("path");
const bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static('./public'));
app.post('/pay', function (req, res) {
    console.log("DONE");
    console.log(req.body);
    var cardNum = req.body.cardNumber;
    var date = req.body.expirydate;
    var cvv = req.body.cvv;
    
    let flag = 1;
    let regexCardNumber = new RegExp(/^4[0-9]{12}(?:[0-9]{3})?$/);

    if (regexCardNumber.test(cardNum)) {
        flag = 1;
    }
    else {
        flag = 2;
    }
    regexDate = /^(0?[1-9]|[12][0-9]|3[01])[\/\-]\d{2}$/
    if (regexDate.test(date)) {
        flag = 1;
    }
    else {
        flag = 3;
    }
    let regexCvv = new RegExp(/^[0-9]{3}$/)
    if (regexCvv.test(cvv)) {
        flag = 1;
    }
    else {
        flag = 4;
    }
    if (flag == 1) {
        const crypto = require("crypto");

        const algorithm = "des3";

        // generate 8 bytes of random data
        const initVector = crypto.randomBytes(8);

        // protected data
        const data1 = cardNum;
        const data2 = cvv

        // secret key generate 24 bytes of random data
        const Securitykey = crypto.randomBytes(24);

        // the cipher function
        const cipher1 = crypto.createCipheriv(algorithm, Securitykey, initVector);
        const cipher2 = crypto.createCipheriv(algorithm, Securitykey, initVector);

        // encrypt the message
        // input encoding
        // output encoding
        let encryptedData1 = cipher1.update(data1, "utf-8", "hex");
        let encryptedData2 = cipher2.update(data2, "utf-8", "hex");

        encryptedData1 += cipher1.final("hex");
        encryptedData2 += cipher2.final("hex");

        console.log("Encrypted card num: " + encryptedData1);
        console.log("Encrypted cvv: " + encryptedData2);

        // the decipher function
        const decipher1 = crypto.createDecipheriv(algorithm, Securitykey, initVector);
        const decipher2 = crypto.createDecipheriv(algorithm, Securitykey, initVector);

        let decryptedData1 = decipher1.update(encryptedData1, "hex", "utf-8");
        let decryptedData2 = decipher2.update(encryptedData2, "hex", "utf-8");

        decryptedData1 += decipher1.final("utf8");
        decryptedData2 += decipher2.final("utf8");

        console.log("Decrypted card num: " + decryptedData1);
        console.log("Decrypted cvv: " + decryptedData2);

        res.send("<div> <h1><center>Details Received</center></h1><p>CARD NUMBER - " + encryptedData1 + "</p><p>EXPIRY DATE - " + req.body.expiryDate + "</p><p>CVV - " + encryptedData2 + "</div>");
    }
    else if(flag == 2){
        res.send("<div> <h3>Card etails are invalid </h3> </div>");
    }
    else if(flag == 3){
        res.send("<div> <h3> Expiry date is Invalid </h3> </div>");
    }
    else if(flag == 4){
        res.send("<div> <h3>Cvv is Invalid</h3> </div>");
    }
});
app.listen(3000, function (err) {
    console.log("Server running on PORT 3000");
});