var _username = "jblew_plugin";
var _apiKeyPlain = "1697807fd26ab9c5deeea4cfd2b02741df016b95";

function mmRequestPost(url, method, dataIn, callback) {
    console.log("Request "+url);
    console.log(dataIn);
    $.ajax({
        url: 'http://medmanual2.jblew.pl/'+ url + '?ajax&basicAuth',
        type: method,
        data: dataIn,
        cache: false,
        dataType: 'json',
        processData: false, // Don't process the files
        //contentType: false, // Set content type to false as jQuery will tell the server its a query string request
        headers: {
            "Authorization": "Basic " + btoa(_username + ":" + _apiKeyPlain)
        },
        success: function (data, textStatus, jqXHR)
        {
            if (typeof data.error === 'undefined')
            {
                console.log(data);
                callback(data, true, null);
            } else
            {
                console.log('ERRORS: ' + data.error);
                console.log(data);
                callback(data, false, data.error);
            }
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
            console.log('ERRORS: ' + textStatus);
            console.log(jqXHR);
            callback(null, false, textStatus);
        }
    });
}

function mmRequestJson(url, data, callback) {
    console.log("Request "+url);
    console.log(data);
    $.ajax({
        url: 'http://medmanual2.jblew.pl/'+ url + '?ajax&basicAuth',
        type: 'POST',
        data: JSON.stringify(data),
        cache: false,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        processData: false, // Don't process the files
        //contentType: false, // Set content type to false as jQuery will tell the server its a query string request
        headers: {
            "Authorization": "Basic " + btoa(_username + ":" + _apiKeyPlain)
        },
        success: function (data, textStatus, jqXHR)
        {
            if (typeof data.error === 'undefined')
            {
                console.log(data);
                callback(data, true, null);
            } else
            {
                console.log('ERRORS: ' + data.error);
                console.log(data);
                callback(data, false, data.error);
            }
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
            console.log('ERRORS: ' + textStatus);
            console.log(jqXHR);
            callback(null, false, textStatus);
        }
    });
}