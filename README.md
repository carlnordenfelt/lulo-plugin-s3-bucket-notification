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
    * When updating/deleting configurations they are matched either by Id or by a combination of Arn & Events. 

See the [AWS SDK Documentation for S3::putBucketNotificationConfiguration](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putBucketNotificationConfiguration-property)

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
