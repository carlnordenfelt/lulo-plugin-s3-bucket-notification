'use strict';

var aws = require('aws-sdk');
var s3 = new aws.S3({ apiVersion: '2006-03-01' });
var _ = require('lodash');

var pub = {};

pub.putBucketNotificationConfiguration = function (bucket, configurations, callback) {
    var params = {
        Bucket: bucket,
        NotificationConfiguration: configurations
    };
    s3.putBucketNotificationConfiguration(params, function (error) {
        return callback(error);
    });
};

pub.getBucketNotificationConfiguration = function getBucketNotificationConfiguration(bucket, callback) {
    var params = {
        Bucket: bucket
    };
    s3.getBucketNotificationConfiguration(params, function (error, s3Response) {
        if (error) {
            return callback(error);
        }
        callback(null, s3Response);
    });
};

pub.addConfigurations = function addConfigurations(configurations, newConfigurations) {
    if (newConfigurations.TopicConfigurations) {
        if (!configurations.TopicConfigurations) {
            configurations.TopicConfigurations = [];
        }
        newConfigurations.TopicConfigurations.forEach(function (config) {
            configurations.TopicConfigurations.push(config);
        });
    }
    if (newConfigurations.QueueConfigurations) {
        if (!configurations.QueueConfigurations) {
            configurations.QueueConfigurations = [];
        }
        newConfigurations.QueueConfigurations.forEach(function (config) {
            configurations.QueueConfigurations.push(config);
        });
    }
    if (newConfigurations.LambdaFunctionConfigurations) {
        if (!configurations.LambdaFunctionConfigurations) {
            configurations.LambdaFunctionConfigurations = [];
        }
        newConfigurations.LambdaFunctionConfigurations.forEach(function (config) {
            configurations.LambdaFunctionConfigurations.push(config);
        });
    }
    return configurations;
};

pub.removeConfigurations = function removeConfigurations(configurations, params) {
    configurations.LambdaFunctionConfigurations = removeConfigurations(
        configurations.LambdaFunctionConfigurations,
        params.LambdaFunctionConfigurations,
        'LambdaFunctionArn'
    );
    configurations.QueueConfigurations = removeConfigurations(
        configurations.QueueConfigurations,
        params.QueueConfigurations,
        'QueueArn'
    );
    configurations.TopicConfigurations = removeConfigurations(
        configurations.TopicConfigurations,
        params.TopicConfigurations,
        'TopicArn'
    );

    return configurations;

    function removeConfigurations(configSet, remove, arnKey) {
        if (configSet && remove) {
            remove.forEach(function (config) {
                var condition = {};
                if (config.Id) {
                    condition.Id = config.Id;
                } else {
                    condition[arnKey] = config[arnKey];
                    var eventString = eventsToString(config.Events);
                    condition.Events = eventString;
                    config.Events = eventString;
                    for (var i = 0; i < configSet.length; i++) {
                        configSet[i].Events = eventsToString(configSet[i].Events);
                    }
                }

                _.pullAllBy(configSet, [config], condition);

                if (!config.Id) {
                    for (var j = 0; j < configSet.length; j++) {
                        configSet[j].Events = eventsToArray(configSet[j].Events)
                    }
                }
            });
        }
        return configSet;
    }
};

module.exports = pub;

function eventsToString(event) {
    return event.join('_');
}
function eventsToArray(eventString) {
    return eventString.split('_');
}
