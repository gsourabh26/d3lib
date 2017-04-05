var http = require('http');
var express = require('express');
var querystring = require("querystring");
var app = express();
var Q = require("q");

app.use(function (req, res, next) {
    res.setHeader('Access-control-Allow-Headers', '*')
    res.setHeader('Connection', 'keep-alive')
    next();
})

app.get("/", function (request, response) {
    return getData().then(function (result) {
        console.log(result);
        response.send(result);
    }).fail(function (err) {
        response.send(JSON.stringify(err));
    })
})

app.listen(8080, function () {
    console.log("server is listening on port: 8080");
})

function getData() {
    var d = Q.defer();
    try {
        var body = JSON.stringify({
            "hiveMachineIp": "192.168.0.110",
            "hiveMachinePort": "10000",
            "hiveUsername": "nt",
            "hivePassword": "",
            "hiveDatabaseName": "default",
            "hiveTableName": "transactions_24m",
            "hiveAggregationColumn": "customerid",
            "hiveAggregationFunction": "HISTOGRAM",
            "hiveAggregationHistogramBin": "5"
        })

        var request = new http.ClientRequest({
            hostname: "163.47.152.170",
            port: 8090,
            path: "/MachinfinityDataPreparation/machinfinitydataprep/hiveDataAggregation",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(body)
            }
        })

        request.on('response', function (response) {
            //console.log('STATUS: ' + response.statusCode);
            //console.log('HEADERS: ' + JSON.stringify(response.headers));
            response.setEncoding('utf8');
            var body = '';
            response.on('data', function (chunk) {
                body += chunk;
                //console.log('BODY: ' + chunk);
            });
            response.on('end', function () {
                d.resolve(body);
                return;
            });
        });

        request.on('error', function (error){
            console.log(error);
            d.reject(error);
            return;
        })

        request.end(body)

    } catch (err) {
        console.log(err);
        d.reject(err);
    }
    return d.promise;
}

