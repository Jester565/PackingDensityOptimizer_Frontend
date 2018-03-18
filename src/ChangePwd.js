import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, Section, Icon, Toast } from 'react-materialize';

class ChangePwd extends Component {
    constructor(props) {
        super();
        this.state = {
            newPwd: "",
            newPwdConfirm: ""
        };
    }

    onSubmit() {
        if (this.state.newPwd == this.state.newPwdConfirm) {
            /*
            AWS.config.region = 'us-west-2';
            var poolData = {
                UserPoolId: 'us-west-2_MY0MuTkaP',
                ClientId: '1vgit8ouhmjcnh0grvqhhr7gi8'
            };
            self.userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
            self.cognitoUser = self.userPool.getCurrentUser();
            self.cognitoUser.changePassword(this.state.oldPwd, this.state.newPwd, function(err, result) {
                if (err) {
                    window.Materialize.toast(err, 4000);
                    return;
                }
            */
            this.props.onSuccess(this.state.newPwd);
        }
        else {
            window.Materialize.toast("Passwords do not match", 4000);
        }
    }

    render() {
        return (
            <div class="card-panel grey lighten-5 z-depth-1">
                <Section>
                    <Row>
                        <Col offset={"s1"} s={4}>
                            <h3 s={12}><Icon small>forward</Icon>Login</h3>
                        </Col>
                    </Row>
                    <Row>
                        <p>You must change your password to login</p>
                    </Row>
                    <Row>
                        <Col offset={"s3"} s={3}>
                            <Input
                                s={12}
                                type="password"
                                label="New Password"
                                value={this.state.newPwd}
                                onChange={(evt) => {this.setState({newPwd: evt.target.value});}} />
                        </Col>
                        <Col s={3}>
                            <Input
                                s={12}
                                type="password"
                                label="Confirm New Password"
                                value={this.state.newPwdConfirm}
                                onChange={(evt) => {this.setState({newPwdConfirm: evt.target.value});}} />
                        </Col>
                    </Row>
                    <Row>
                        <Button waves='light' s={2} onClick={(this.onSubmit).bind(this)}>Change Password</Button>
                    </Row>
                </Section>
            </div>
        );
    }
}

export default ChangePwd;