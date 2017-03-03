'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

describe('Index unit tests', function () {
    var subject;
    var getBucketNotificationConfigurationStub = sinon.stub();
    var putBucketNotificationConfigurationStub = sinon.stub();
    var addConfigurationsStub = sinon.stub();
    var removeConfigurationsStub = sinon.stub();
    var event;

    before(function () {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        var configurationHelperMock = {
            getBucketNotificationConfiguration: getBucketNotificationConfigurationStub,
            putBucketNotificationConfiguration: putBucketNotificationConfigurationStub,
            addConfigurations: addConfigurationsStub,
            removeConfigurations: removeConfigurationsStub
        };

        mockery.registerMock('./lib/configuration-helper', configurationHelperMock);
        subject = require('../../src/index');
    });
    beforeEach(function () {
        getBucketNotificationConfigurationStub.reset().resetBehavior();
        getBucketNotificationConfigurationStub.yields(undefined, {
            LambdaFunctionConfigurations: [{ Events: [], LambdaFunctionArn: 'LambdaFunctionArn' }],
            QueueConfigurations: [{ Events: [], QueueArn: 'QueueArn' }],
            TopicConfigurations: [{ Events: [], TopicArn: 'TopicArn' }]
        });
        putBucketNotificationConfigurationStub.reset().resetBehavior();
        putBucketNotificationConfigurationStub.yields();
        addConfigurationsStub.reset().resetBehavior();
        addConfigurationsStub.returns({});
        removeConfigurationsStub.reset().resetBehavior();
        removeConfigurationsStub.returns({});

        event = {
            ResourceProperties: {
                Bucket: 'Bucket',
                NotificationConfiguration: {
                    LambdaFunctionConfigurations: [{ Events: [], LambdaFunctionArn: 'LambdaFunctionArn' }],
                    QueueConfigurations: [{ Events: [], QueueArn: 'QueueArn' }],
                    TopicConfigurations: [{ Events: [], TopicArn: 'TopicArn' }]
                }
            }
        };
    });
    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('validate', function () {
        it('should succeed', function (done) {
            subject.validate(event);
            done();
        });
        it('coverage', function (done) {
            event.ResourceProperties.NotificationConfiguration = {};
            subject.validate(event);
            done();
        });
        it('should fail if Bucket is not set', function (done) {
            delete event.ResourceProperties.Bucket;
            function fn () {
                subject.validate(event);
            }
            expect(fn).to.throw(/Missing required property Bucket/);
            done();
        });
        it('should fail if Bucket has changed', function (done) {
            event.OldResourceProperties = {
                Bucket: 'OldBucket'
            };
            function fn () {
                subject.validate(event);
            }
            expect(fn).to.throw(/Property Bucket cannot be changed/);
            done();
        });
        it('should fail if NotificationConfiguration is not set', function (done) {
            delete event.ResourceProperties.NotificationConfiguration;
            function fn () {
                subject.validate(event);
            }
            expect(fn).to.throw(/Missing required property NotificationConfiguration/);
            done();
        });

        it('should fail if NotificationConfiguration.LambdaFunctionConfigurations.Events is not set', function (done) {
            event.ResourceProperties.NotificationConfiguration = {
                LambdaFunctionConfigurations: [{}]
            };
            function fn () {
                subject.validate(event);
            }
            expect(fn).to.throw(/Missing required property LambdaFunctionConfigurations.Events/);
            done();
        });
        it('should fail if NotificationConfiguration.LambdaFunctionConfigurations.LambdaFunctionArn is not set', function (done) {
            event.ResourceProperties.NotificationConfiguration = {
                LambdaFunctionConfigurations: [{ Events: [] }]
            };
            function fn () {
                subject.validate(event);
            }
            expect(fn).to.throw(/Missing required property LambdaFunctionConfigurations.LambdaFunctionArn/);
            done();
        });
        it('should fail if NotificationConfiguration.QueueConfigurations.Events is not set', function (done) {
            event.ResourceProperties.NotificationConfiguration = {
                QueueConfigurations: [{}]
            };
            function fn () {
                subject.validate(event);
            }
            expect(fn).to.throw(/Missing required property QueueConfigurations.Events/);
            done();
        });
        it('should fail if NotificationConfiguration.QueueConfigurations.QueueArn is not set', function (done) {
            event.ResourceProperties.NotificationConfiguration = {
                QueueConfigurations: [{ Events: [] }]
            };
            function fn () {
                subject.validate(event);
            }
            expect(fn).to.throw(/Missing required property QueueConfigurations.QueueArn/);
            done();
        });
        it('should fail if NotificationConfiguration.TopicConfigurations.Events is not set', function (done) {
            event.ResourceProperties.NotificationConfiguration = {
                TopicConfigurations: [{}]
            };
            function fn () {
                subject.validate(event);
            }
            expect(fn).to.throw(/Missing required property TopicConfigurations.Events/);
            done();
        });
        it('should fail if NotificationConfiguration.Topiconfigurations.TopicArn is not set', function (done) {
            event.ResourceProperties.NotificationConfiguration = {
                TopicConfigurations: [{ Events: [] }]
            };
            function fn () {
                subject.validate(event);
            }
            expect(fn).to.throw(/Missing required property TopicConfigurations.TopicArn/);
            done();
        });
    });

    describe('create', function () {
        it('should succeed', function (done) {
            subject.create(event, {}, function (error) {
                expect(error).to.equal(undefined);
                expect(getBucketNotificationConfigurationStub.calledOnce).to.equal(true);
                expect(putBucketNotificationConfigurationStub.calledOnce).to.equal(true);
                done();
            });
        });
        it('should fail due to get error', function (done) {
            getBucketNotificationConfigurationStub.yields('getError');
            subject.create(event, {}, function (error) {
                expect(error).to.equal('getError');
                expect(getBucketNotificationConfigurationStub.calledOnce).to.equal(true);
                expect(putBucketNotificationConfigurationStub.called).to.equal(false);
                done();
            });
        });
        it('should fail due to put error', function (done) {
            putBucketNotificationConfigurationStub.yields('putError');
            subject.create(event, {}, function (error) {
                expect(error).to.equal('putError');
                expect(getBucketNotificationConfigurationStub.calledOnce).to.equal(true);
                expect(putBucketNotificationConfigurationStub.calledOnce).to.equal(true);
                done();
            });
        });
    });

    describe('update', function () {
        beforeEach(function () {
            event.OldResourceProperties = {};
        });
        it('should succeed', function (done) {
            subject.update(event, {}, function (error) {
                expect(error).to.equal(undefined);
                expect(getBucketNotificationConfigurationStub.calledOnce).to.equal(true);
                expect(putBucketNotificationConfigurationStub.calledOnce).to.equal(true);
                done();
            });
        });
        it('should fail due to get error', function (done) {
            getBucketNotificationConfigurationStub.yields('getError');
            subject.update(event, {}, function (error) {
                expect(error).to.equal('getError');
                expect(getBucketNotificationConfigurationStub.calledOnce).to.equal(true);
                expect(putBucketNotificationConfigurationStub.called).to.equal(false);
                done();
            });
        });
        it('should fail due to put error', function (done) {
            putBucketNotificationConfigurationStub.yields('putError');
            subject.update(event, {}, function (error) {
                expect(error).to.equal('putError');
                expect(getBucketNotificationConfigurationStub.calledOnce).to.equal(true);
                expect(putBucketNotificationConfigurationStub.calledOnce).to.equal(true);
                done();
            });
        });
    });

    describe('delete', function () {
        it('should succeed', function (done) {
            subject.delete(event, {}, function (error) {
                expect(error).to.equal(undefined);
                expect(getBucketNotificationConfigurationStub.calledOnce).to.equal(true);
                expect(putBucketNotificationConfigurationStub.calledOnce).to.equal(true);
                done();
            });
        });
        it('should fail due to get error', function (done) {
            getBucketNotificationConfigurationStub.yields('getError');
            subject.delete(event, {}, function (error) {
                expect(error).to.equal('getError');
                expect(getBucketNotificationConfigurationStub.calledOnce).to.equal(true);
                expect(putBucketNotificationConfigurationStub.called).to.equal(false);
                done();
            });
        });
        it('should fail due to put error', function (done) {
            putBucketNotificationConfigurationStub.yields('putError');
            subject.delete(event, {}, function (error) {
                expect(error).to.equal('putError');
                expect(getBucketNotificationConfigurationStub.calledOnce).to.equal(true);
                expect(putBucketNotificationConfigurationStub.calledOnce).to.equal(true);
                done();
            });
        });
    });
});
