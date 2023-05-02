// Import required modules and packages
const express = require("express"); // for creating web server
const app = express(); // create an instance of express
const bodyParser = require("body-parser"); // for parsing the incoming request body
const https = require("https"); // for making https requests
require('dotenv').config() // load environment variables from .env file

// Set up middleware to serve static files from the 'public' directory and to parse incoming requests
app.use(express.static("public")); // for serving static files like images and CSS
app.use(bodyParser.urlencoded({ extended: true })); // for parsing incoming request body

// Handle GET requests to the root URL
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/signup.html"); // send the signup HTML file as a response
});

// Handle POST requests to the root URL
app.post("/", function (req, res) {
    // Extract the form data from the request body
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;

    // Construct the JSON data to be sent to the Mailchimp API
    const data = {
        members: [{
            email_address: email,
            status: "subscribed",
            merge_fields: {
                FNAME: firstName,
                LNAME: lastName
            }
        }]
    }
    const jsonData = JSON.stringify(data); // convert data to JSON format

    // Set up the options for the Mailchimp API request
    const url = "https://us13.api.mailchimp.com/3.0/lists/" + process.env.LIST_KEY;
    const options = {
        method: "POST",
        auth: `sachin:${process.env.API_KEY}`
    };

    // Make the HTTPS request to the Mailchimp API
    const request = https.request(url, options, function (response) {
        if (response.statusCode == 200) {
            res.sendFile(__dirname + "/success.html"); // send the success HTML file as a response
        }
        else {
            res.sendFile(__dirname + "/failure.html"); // send the failure HTML file as a response
        }
    });

    // Write the JSON data to the request body and end the request
    request.write(jsonData);
    request.end();
});

// Handle POST requests to the '/failure' URL
app.post("/failure", function (req, res) {
    res.redirect("/"); // redirect back to the root URL
})

// Start the web server on the specified port
const PORT = process.env.PORT || 3000; // use the port specified in .env or default to 3000
app.listen(PORT, function () {
    console.log(`Server started on port ${PORT}`);
});
