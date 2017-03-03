'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

describe('Index unit tests', function () {
    var subject;
    var getStub = sinon.stub();
    var putStub = sinon.stub();

    before(function () {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        var awsSdkStub = {
            S3: function () {
                this.getBucketNotificationConfiguration = getStub;
                this.putBucketNotificationConfiguration = putStub;
            }
        };

        mockery.registerMock('aws-sdk', awsSdkStub);
        subject = require('../../../src/lib/configuration-helper');
    });
    beforeEach(function () {
        getStub.reset().resetBehavior();
        getStub.yields(undefined, {});
        putStub.reset().resetBehavior();
        putStub.yields();
    });
    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('getBucketNotificationConfiguration', function () {
        it('should succeed', function (done) {
            subject.getBucketNotificationConfiguration('bucket', function (error, response) {
                expect(error).to.equal(null);
                expect(getStub.calledOnce).to.equal(true);
                expect(putStub.called).to.equal(false);
                expect(response).to.be.an('object');
                done();
            });
        });
        it('should fail due to get error', function (done) {
            getStub.yields('GetError');
            subject.getBucketNotificationConfiguration('bucket', function (error, response) {
                expect(error).to.equal('GetError');
                expect(getStub.calledOnce).to.equal(true);
                expect(putStub.called).to.equal(false);
                expect(response).to.equal(undefined);
                done();
            });
        });
    });

    describe('putBucketNotificationConfiguration', function () {
        it('should succeed', function (done) {
            subject.putBucketNotificationConfiguration('bucket', {}, function (error) {
                expect(error).to.equal(undefined);
                expect(putStub.calledOnce).to.equal(true);
                expect(getStub.called).to.equal(false);
                done();
            });
        });
        it('should fail due to put error', function (done) {
            putStub.yields('PutError');
            subject.putBucketNotificationConfiguration('bucket', {}, function (error) {
                expect(error).to.equal('PutError');
                expect(putStub.calledOnce).to.equal(true);
                expect(getStub.called).to.equal(false);
                done();
            });
        });
    });

    describe('addConfigurations to empty configuration', function () {
        it('should add LambdaFunctionConfigurations', function (done) {
            var newConfigurations = {
                LambdaFunctionConfigurations: [{}]
            };
            var updatedConfiguration = subject.addConfigurations({}, newConfigurations);
            expect(updatedConfiguration.LambdaFunctionConfigurations.length).to.equal(1);
            done();
        });
        it('should add QueueConfigurations', function (done) {
            var newConfigurations = {
                QueueConfigurations: [{}]
            };
            var updatedConfiguration = subject.addConfigurations({}, newConfigurations);
            expect(updatedConfiguration.QueueConfigurations.length).to.equal(1);
            done();
        });
        it('should add TopicConfigurations', function (done) {
            var newConfigurations = {
                TopicConfigurations: [{}]
            };
            var updatedConfiguration = subject.addConfigurations({}, newConfigurations);
            expect(updatedConfiguration.TopicConfigurations.length).to.equal(1);
            done();
        });
        it('should add all Configurations', function (done) {
            var newConfigurations = {
                LambdaFunctionConfigurations: [{}],
                QueueConfigurations: [{}],
                TopicConfigurations: [{}]
            };
            var updatedConfiguration = subject.addConfigurations({}, newConfigurations);
            expect(updatedConfiguration.LambdaFunctionConfigurations.length).to.equal(1);
            expect(updatedConfiguration.QueueConfigurations.length).to.equal(1);
            expect(updatedConfiguration.TopicConfigurations.length).to.equal(1);
            done();
        });
    });

    describe('addConfigurations to existing configuration', function () {
        it('should add LambdaFunctionConfigurations', function (done) {
            var configurations = {
                LambdaFunctionConfigurations: [{}]
            };
            var newConfigurations = {
                LambdaFunctionConfigurations: [{}]
            };
            var updatedConfiguration = subject.addConfigurations(configurations, newConfigurations);
            expect(updatedConfiguration.LambdaFunctionConfigurations.length).to.equal(2);
            done();
        });
        it('should add QueueConfigurations', function (done) {
            var configurations = {
                QueueConfigurations: [{}]
            };
            var newConfigurations = {
                QueueConfigurations: [{}]
            };
            var updatedConfiguration = subject.addConfigurations(configurations, newConfigurations);
            expect(updatedConfiguration.QueueConfigurations.length).to.equal(2);
            done();
        });
        it('should add TopicConfigurations', function (done) {
            var configurations = {
                TopicConfigurations: [{}]
            };
            var newConfigurations = {
                TopicConfigurations: [{}]
            };
            var updatedConfiguration = subject.addConfigurations(configurations, newConfigurations);
            expect(updatedConfiguration.TopicConfigurations.length).to.equal(2);
            done();
        });
        it('should add all Configurations', function (done) {
            var configurations = {
                LambdaFunctionConfigurations: [{}],
                QueueConfigurations: [{}],
                TopicConfigurations: [{}]
            };
            var newConfigurations = {
                LambdaFunctionConfigurations: [{}],
                QueueConfigurations: [{}],
                TopicConfigurations: [{}]
            };
            var updatedConfiguration = subject.addConfigurations(configurations, newConfigurations);
            expect(updatedConfiguration.LambdaFunctionConfigurations.length).to.equal(2);
            expect(updatedConfiguration.QueueConfigurations.length).to.equal(2);
            expect(updatedConfiguration.TopicConfigurations.length).to.equal(2);
            done();
        });
    });

    describe('remove configuration', function () {
        describe('LambdaFunctionConfiguration', function () {
            it('should remove by Id', function (done) {
                var configurations = {
                    LambdaFunctionConfigurations: [
                        { Id: '123' },
                        { Id: '234' }
                    ]
                };
                var removeConfigurations = {
                    LambdaFunctionConfigurations: [{ Id: '123' }]
                };
                var updatedConfiguration = subject.removeConfigurations(configurations, removeConfigurations);
                expect(updatedConfiguration.LambdaFunctionConfigurations.length).to.equal(1);
                expect(updatedConfiguration.LambdaFunctionConfigurations[0]).to.deep.equal({ Id: '234' });
                done();
            });
            it('should remove by Arn & Events', function (done) {
                var existingConfigurations = {
                    LambdaFunctionConfigurations: [
                        { LambdaFunctionArn: '123', Events: ['example'] },
                        { LambdaFunctionArn: '123', Events: ['example', 'example2'] },
                        { LambdaFunctionArn: '123', Events: ['example2'] },
                        { LambdaFunctionArn: '234', Events: ['example'] }
                    ]
                };
                var removeConfigurations = {
                    LambdaFunctionConfigurations: [
                        { LambdaFunctionArn: '123', Events: ['example'] }
                    ]
                };
                var updatedConfiguration = subject.removeConfigurations(existingConfigurations, removeConfigurations);
                expect(updatedConfiguration.LambdaFunctionConfigurations.length).to.equal(3);
                expect(updatedConfiguration.LambdaFunctionConfigurations[0]).to.deep.equal(
                    { LambdaFunctionArn: '123', Events: ['example', 'example2'] });
                expect(updatedConfiguration.LambdaFunctionConfigurations[1]).to.deep.equal(
                    { LambdaFunctionArn: '123', Events: ['example2'] });
                expect(updatedConfiguration.LambdaFunctionConfigurations[2]).to.deep.equal(
                    { LambdaFunctionArn: '234', Events: ['example'] });
                done();
            });
        });

        describe('QueueConfigurations', function () {
            it('should remove by Id', function (done) {
                var configurations = {
                    QueueConfigurations: [
                        { Id: '123' },
                        { Id: '234' }
                    ]
                };
                var removeConfigurations = {
                    QueueConfigurations: [{ Id: '123' }]
                };
                var updatedConfiguration = subject.removeConfigurations(configurations, removeConfigurations);
                expect(updatedConfiguration.QueueConfigurations.length).to.equal(1);
                expect(updatedConfiguration.QueueConfigurations[0]).to.deep.equal({ Id: '234' });
                done();
            });
            it('should remove by Arn & Events', function (done) {
                var configurations = {
                    QueueConfigurations: [
                        { QueueArn: '123', Events: ['example'] },
                        { QueueArn: '123', Events: ['example2'] },
                        { QueueArn: '234', Events: ['example'] }
                    ]
                };
                var removeConfigurations = {
                    QueueConfigurations: [
                        { QueueArn: '123', Events: ['example'] },
                    ]
                };
                var updatedConfiguration = subject.removeConfigurations(configurations, removeConfigurations);
                expect(updatedConfiguration.QueueConfigurations.length).to.equal(2);
                expect(updatedConfiguration.QueueConfigurations[0]).to.deep
                                                                   .equal({ QueueArn: '123', Events: ['example2'] });
                expect(updatedConfiguration.QueueConfigurations[1]).to.deep
                                                                   .equal({ QueueArn: '234', Events: ['example'] });
                done();
            });
        });

        describe('TopicConfigurations', function () {
            it('should remove by Id', function (done) {
                var configurations = {
                    TopicConfigurations: [
                        { Id: '123' },
                        { Id: '234' }
                    ]
                };
                var removeConfigurations = {
                    TopicConfigurations: [{ Id: '123' }]
                };
                var updatedConfiguration = subject.removeConfigurations(configurations, removeConfigurations);
                expect(updatedConfiguration.TopicConfigurations.length).to.equal(1);
                expect(updatedConfiguration.TopicConfigurations[0]).to.deep.equal({ Id: '234' });
                done();
            });
            it('should remove by Arn & Events', function (done) {
                var configurations = {
                    TopicConfigurations: [
                        { TopicArn: '123', Events: ['example'] },
                        { TopicArn: '123', Events: ['example', 'example2'] },
                        { TopicArn: '123', Events: ['example2'] },
                        { TopicArn: '234', Events: ['example'] }
                    ]
                };
                var removeConfigurations = {
                    TopicConfigurations: [
                        { TopicArn: '123', Events: ['example'] }
                    ]
                };
                var updatedConfiguration = subject.removeConfigurations(configurations, removeConfigurations);
                expect(updatedConfiguration.TopicConfigurations.length).to.equal(3);
                expect(updatedConfiguration.TopicConfigurations[0]).to.deep.equal(
                    { TopicArn: '123', Events: ['example', 'example2'] });
                expect(updatedConfiguration.TopicConfigurations[1]).to.deep
                                                                   .equal({ TopicArn: '123', Events: ['example2'] });
                expect(updatedConfiguration.TopicConfigurations[2]).to.deep
                                                                   .equal({ TopicArn: '234', Events: ['example'] });
                done();
            });
        });
    });
});
