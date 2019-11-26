
import cognitoConfig from './cognito-config';
import s3Config from './s3-config';

import AwsCognito from 'react-native-aws-cognito';
import { AwsS3 } from 'react-native-aws-s3';

console.log(cognitoConfig);

AwsCognito.registerCognitoClient(cognitoConfig);
AwsS3.initWithOptions({region: s3Config.region});