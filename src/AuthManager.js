import AWS from 'aws-sdk';
import ChangePwd from './ChangePwd';

import {
    CognitoUserPool,
    AuthenticationDetails,
    CognitoUser
  } from "amazon-cognito-identity-js";

class AuthManager {
    getCreds(cb) {
        AWS.config.region = 'us-west-2';
        var poolData = {
			UserPoolId: 'us-west-2_Br7uLgpUo',
            ClientId: '5t0ei36egot7b3m3k5d29284cq'
		};
        this.userPool = new CognitoUserPool(poolData);
        this.cognitoUser = this.userPool.getCurrentUser();
        if (this.cognitoUser != null) {
            this.cognitoUser.getSession((function(err, result) {
                if (result) {
                    this.idToken = result.getIdToken();
                    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
						IdentityPoolId: 'us-west-2:cb3c1005-a3ee-444e-9491-2fd52a007510',
						Logins: {
							'cognito-idp.us-west-2.amazonaws.com/us-west-2_Br7uLgpUo': result.getIdToken().getJwtToken()
						}
                    });
                    
					AWS.config.credentials.refresh((error) => {
						if (error) {
							console.log("REFRESH ERROR: " + error);
							cb(error);
						} else {
							cb(null);
						}
					});
                } else {
                    console.log("GetSession ERROR: " + err);
                    cb(err);
                }
            }).bind(this));
        } else {
            cb("CognitoUser is null");
        }
    }
    
    getUsername() {
        this.cognitoUser.getUsername();
    }

    getFederatedID() {
        return AWS.config.credentials.identityId;
    }

    signOut() {
        this.cognitoUser.signOut();
    }
}

export default AuthManager;