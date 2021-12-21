var url = new URLSearchParams(location.search);
var group = url.get('group');
var api = 'https://' + url.get('api') + '/';
var login = url.get('login');
var password = url.get('pass');
var step = url.get('step');

if (!step) {
	step = 10;
}


request('metrics', data => showMetrics(data['metrics'][group]));
setInterval(function () {
    request('metrics', data => showMetrics(data['metrics'][group]));
}, 5000)


function showMetrics(metrics) {
    var count = metrics.length;

    metrics.forEach((item, id) => {
        let name = item.name.substr(group.length + 1);

        request('values/minutes?metric_id=' + item.id, data => {
            const {curr, prev} = data.values;
            const resCurrKey = Object.keys(curr)[0];
            const resPrevKey = Object.keys(prev)[0];
            const currData = curr[resCurrKey].map(value => +value);
            const prevData = prev[resPrevKey].map(value => +value);

            chart('container' + id, name, currData, prevData);
        });
    })
}

function prepareData(keyVal) {
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


window.chart = function (container, title, curr, prev) {
    curr = prepareData(curr);
    prev = prepareData(prev);

    let ch = window.Highcharts.chart(container, {
        credits: {
            enabled: false
        },
        chart: {
            type: 'column',
            spacing: 0,
            animation: false,
            marginRight: -50,
            zoomType: 'xy'
        },
        title: {
            text: title,
        },
        xAxis: {
            crosshair: true,
            type: 'datetime',
            tickLength: 4,
            minPadding: 0,
            minorTickLength: 0,
            tickLength: 0,
            maxPadding: 0,
            lineWidth: 0,
            minorGridLineWidth: 0,
            lineColor: 'transparent',
            opposite: true,
            startOnTick: true,
            endOnTick: true,
            labels: {
                enabled: false
            },
            plotLines: [{
                value: new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000
            }]
        },
        yAxis: {
            crosshair: false,
            min: 0,
            title: null,
            startOnTick: false,
            gridLineWidth: 0,
            endOnTick: false,
            opposite: true,
            minPadding: 0,
            maxPadding: 0,
            labels: {
                enabled: false
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            animation: false,
            shared: true,
            useHTML: true,
            shadow: false
        },
        plotOptions: {
            column: {
                grouping: false,
                pointPadding: 0,
                groupPadding: 0,
                animation: false,
            },
            stickyTracking: false,
        },
        series: [
            {data: prev, name: 'yesterday', color: 'rgba(154, 162, 172, 0.45)'},
            {data: curr, name: 'today', color: 'rgba(0, 79, 168, 0.43)'},
        ],

    });

    // ch.yAxis[0].setExtremes(0);
}