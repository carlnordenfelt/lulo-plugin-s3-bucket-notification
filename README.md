# lulo S3 Bucket Notification

lulo S3 Bucket Notification creates S3 Bucket Notifications.

lulo S3 Bucket Notification is a [lulo](https://github.com/carlnordenfelt/lulo) plugin

# Installation
```
$ npm install lulo-plugin-s3-bucket-notification --save
```

## Usage
### Properties
* Bucket: Bucket name. Required. Note: this value cannot be changed.
* NotificationConfiguration: Notification configurations. Required.
    * Existing configurations on the bucket are kept as is.
    * When updating/deleting configurations they are matched either by Id or by a combination of Arn & Events. It is recommended that you assign an Id to ensure that your configuration are not mistakenly matched and altered. 

See the [AWS SDK Documentation for S3::putBucketNotificationConfiguration](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putBucketNotificationConfiguration-property)

### Important notes
If you see the error `Unable to validate the following destination configurations` you need to create
permissions for S3 to trigger the Lambda function first:

**Example:**
```
"S3TriggerLambdaPermission": {
    "Type": "AWS::Lambda::Permission",
    "Properties": {
        "Action": "lambda:InvokeFunction",
        "FunctionName": "arn:aws:lambda:eu-west-1:433205128088:function:daniel-test-s3-audiofile-upload",
        "SourceArn": { "Fn::Join": ["", ["arn:aws:s3:::", { "Ref": "Bucket" }]] },
        "Principal": "s3.amazonaws.com"
    }
}
```

Secondly, avoid updating/creating multiple notification resources on the same bucket
simultaneously as that would create a race condition and could potentially 
leave your notifications in an inconsistent state. 
Adding/removing/updating multiple notification configurations in the same
 resource is fine though.

### Return Values
None

### Required IAM Permissions
The Custom Resource Lambda requires the following permissions for this plugin to work:
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:GetBucketNotification",
        "s3:PutBucketNotification"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
```

## License
[The MIT License (MIT)](/LICENSE)

## Change Log
[Change Log](/CHANGELOG.md)
