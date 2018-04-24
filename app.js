var url = new URLSearchParams(location.search);
var group = url.get('group');
var api = 'https://' + url.get('api') + '/';
var login = url.get('login');
var password = url.get('pass');


request('metrics', data => showMetrics(data['metrics'][group]));


function showMetrics(metrics) {
    var count = metrics.length;

    metrics.forEach(item => {
        request('values/minutes?metric_id=' + item.id, data => {
            console.log(item.name);
            console.log(data.values);

            chart(data.values.curr['2018-04-24'], data.values.prev['2018-04-23']);
        });
    })
}

function prepareData(keyVal) {
    let step = 10;
    let max = 24 * 60 / step;


    let result = [];
    let pointer = 0;
    for (let i = 0; i < max; i++) {
        result[i] = 0;
        for (let j = 0; j < step; j++) {
            if (keyVal[pointer]) {
                result[i] += keyVal[pointer];
            }
            pointer++;
        }
    }
    return result;
}

function request(path, callback, httpMethod = 'GET') {
    var request = new XMLHttpRequest();
    request.open(httpMethod, api + path, true);
    request.setRequestHeader("Authorization", "Basic " + btoa(login + ':' + password));

    request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
            // Success!
            var data = JSON.parse(this.response);
            callback(data);
        } else {
            // We reached our target server, but it returned an error
            console.log(this.status + ' ' + this.statusText);
        }
    };
    request.send();
}


window.chart = function (curr, prev) {
    curr = prepareData(curr);
    prev = prepareData(prev);

    let ch = window.Highcharts.chart('container', {
        chart: {
            type: 'column',
            margin: [-1, -5, 21, 0],
            zoomType: 'xy'
        },
        title: null,
        xAxis: {
            crosshair: true,
            type: 'datetime',
            tickLength: 4,
            startOnTick: true,
            minPadding: 0,
            endOnTick: true,
            maxPadding: 0,
            plotLines: [{
                value: new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000
            }]
        },
        yAxis: {
            crosshair: false,
            min: 0,
            title: null,
            startOnTick: false,
            endOnTick: false,
            labels: {
                enabled: false
            }
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            column: {
                grouping: false,
                pointPadding: 0,
                groupPadding: 0
            },
            stickyTracking: false
        },
        series: [
            {data: prev},
            {data: curr},
        ]
    })

}