'use strict';

var configurationHelper = require('./lib/configuration-helper');

var pub = {};

pub.validate = function (event) {
    if (!event.ResourceProperties.Bucket) {
        throw new Error('Missing required property Bucket');
    }
    if (event.OldResourceProperties && event.OldResourceProperties.Bucket &&
        event.ResourceProperties.Bucket !== event.OldResourceProperties.Bucket) {
        throw new Error('Property Bucket cannot be changed');
    }
    if (!event.ResourceProperties.NotificationConfiguration) {
        throw new Error('Missing required property NotificationConfiguration');
    }

    if (event.ResourceProperties.NotificationConfiguration.LambdaFunctionConfigurations) {
        event.ResourceProperties.NotificationConfiguration.LambdaFunctionConfigurations.forEach(function (config) {
            if (!config.Events) {
                throw new Error('Missing required property LambdaFunctionConfigurations.Events');
            }
            if (!config.LambdaFunctionArn) {
                throw new Error('Missing required property LambdaFunctionConfigurations.LambdaFunctionArn');
            }
        });
    }
    if (event.ResourceProperties.NotificationConfiguration.QueueConfigurations) {
        event.ResourceProperties.NotificationConfiguration.QueueConfigurations.forEach(function (config) {
            if (!config.Events) {
                throw new Error('Missing required property QueueConfigurations.Events');
            }
            if (!config.QueueArn) {
                throw new Error('Missing required property QueueConfigurations.QueueArn');
            }
        });
    }
    if (event.ResourceProperties.NotificationConfiguration.TopicConfigurations) {
        event.ResourceProperties.NotificationConfiguration.TopicConfigurations.forEach(function (config) {
            if (!config.Events) {
                throw new Error('Missing required property TopicConfigurations.Events');
            }
            if (!config.TopicArn) {
                throw new Error('Missing required property TopicConfigurations.TopicArn');
            }
        });
    }
};

pub.create = function (event, _context, callback) {
    configurationHelper.getBucketNotificationConfiguration(event.ResourceProperties.Bucket,
        function (error, configurations) {
            if (error) {
                return callback(error);
            }
            configurations = configurationHelper.addConfigurations(configurations,
                event.ResourceProperties.NotificationConfigurations);
            configurationHelper.putBucketNotificationConfiguration(event.ResourceProperties.Bucket, configurations,
                function (error) {
                    return callback(error);
                });
        });
};

pub.update = function (event, _context, callback) {
    configurationHelper.getBucketNotificationConfiguration(event.ResourceProperties.Bucket,
        function (error, configurations) {
            if (error) {
                return callback(error);
            }
            configurations = configurationHelper.removeConfigurations(configurations,
                event.OldResourceProperties.NotificationConfigurations);
            configurations = configurationHelper.addConfigurations(configurations,
                event.ResourceProperties.NotificationConfigurations);
            configurationHelper.putBucketNotificationConfiguration(event.ResourceProperties.Bucket, configurations,
                function (error) {
                    return callback(error);
                });
        });
};

pub.delete = function (event, _context, callback) {
    configurationHelper.getBucketNotificationConfiguration(event.ResourceProperties.Bucket,
        function (error, configurations) {
            if (error) {
                return callback(error);
            }
            configurations = configurationHelper.removeConfigurations(configurations,
                event.ResourceProperties.NotificationConfigurations);
            configurationHelper.putBucketNotificationConfiguration(event.ResourceProperties.Bucket, configurations,
                function (error) {
                    return callback(error);
                });
        });
};

module.exports = pub;
