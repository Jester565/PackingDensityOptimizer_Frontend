import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, Section, Icon, Toast, Modal } from 'react-materialize';
import AWS from 'aws-sdk';
import ChangePwd from './ChangePwd';

import {
    CognitoUserPool,
    AuthenticationDetails,
    CognitoUser
  } from "amazon-cognito-identity-js";

class Login extends Component {
    constructor(props) {
        super();
        this.state = {
            username: "",
            password: "",
            changingPwd: false
        };
    }

    componentWillMount() {
        this.cognitoUser = null;
        
        var poolData = {
			UserPoolId: 'us-west-2_Br7uLgpUo',
            ClientId: '5t0ei36egot7b3m3k5d29284cq'
		};
        this.userPool = new CognitoUserPool(poolData);
        console.log("Mount called");
    }

    onLogin() {   
        var username = this.state.username;
		var pwd = this.state.password;
        var userData = {
            Username: username,
            Pool: this.userPool
        };
        this.cognitoUser = new CognitoUser(userData);
        var authData = {
            Username: username,
            Password: pwd
        };
        var authDetails = new AuthenticationDetails(authData);
        this.cognitoUser.authenticateUser(authDetails, {
            onSuccess: (this.onLoginSuccess).bind(this),
            onFailure: function (err) {
                window.Materialize.toast(JSON.stringify(err), 4000);
            },
            newPasswordRequired: (function(userAttributes, requiredAttributes) {
                console.log("New Password needed");
                this.setState({
                    changingPwd: true
                });
            }).bind(this)
        });
    }
 
    onNewPwd(newPwd) {
        if (this.cognitoUser != null) {
            this.cognitoUser.completeNewPasswordChallenge(newPwd, null, {
                onSuccess: (this.onLoginSuccess).bind(this),
                onFailure: function(err) {
                    window.Materialize.toast(JSON.stringify(err), 4000);
                }
            });
        }
    }

    onLoginSuccess(result) {
        window.Materialize.toast("LOGIN SUCCESS", 4000);
        console.log("Getting creds");
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-west-2:cb3c1005-a3ee-444e-9491-2fd52a007510',
            Logins: {
                'cognito-idp.us-west-2.amazonaws.com/us-west-2_Br7uLgpUo': result.getIdToken().getJwtToken()
            }
        });
        this.props.onSuccess();
    }

    render() {
        if (!this.state.changingPwd) {
            return (
                <div class="card-panel grey lighten-5 z-depth-1">
                 <Section>
                    <Row>
                        <Col offset={"s1"} s={4}>
                            <h3 s={12}><Icon small>forward</Icon>Login</h3>
                        </Col>
                    </Row>
                    <Row>
                        <Col offset={"s3"} s={3}>
                            <Input s={12}
                                label="Username"
                                value={this.state.username}
                                onChange={(evt) => {this.setState({username: evt.target.value});}} />
                        </Col>
                        <Col s={3}>
                            <Input
                                s={12}
                                type="password"
                                label="Password"
                                value={this.state.password}
                                onChange={(evt) => {this.setState({password: evt.target.value});}} />
                        </Col>
                    </Row>
                    <Row>
                        <Button waves='light' s={2} onClick={(this.onLogin).bind(this)}>Login</Button>
                    </Row>
                </Section>
            </div>);
        }
        else {
            return (<div class="card-panel grey lighten-5 z-depth-1">
                <ChangePwd onSuccess={(this.onNewPwd).bind(this)} />
            </div>);
        }
    }
}

export default Login;