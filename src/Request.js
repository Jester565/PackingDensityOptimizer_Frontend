import React, { Component } from 'react';
import { Section, Icon, Form, Row, Col, Input, Button } from 'react-materialize';

class Request extends Component {
    constructor(props) {
        super();
        this.state = {
            firstname: "",
            lastname: "",
            email: "",
            extraComments: ""
        };
    }

    render() {
        return (
            <div class="card-panel grey lighten-5 z-depth-1">
                <Section>
                    <Row>
                        <Col offset={"s1"} s={5}>
                            <h3 s={12}><Icon small>lock_open</Icon>Request Access</h3>
                        </Col>
                    </Row>
                    <Row>
                        <Col offset={"s3"} s={2}>
                            <Input s={12}
                                label="First Name"
                                onChange={(val) => {this.setState({fistname: val});}} />
                        </Col>
                        <Col s={2}>
                            <Input s={12}
                                label="Last Name"
                                onChange={(val) => {this.setState({lastname: val});}} />
                        </Col>
                        <Col s={2}>
                            <Input
                                s={12}
                                label="Email"
                                onChange={(val) => {this.setState({email: val});}} />
                        </Col>
                    </Row>
                    <Row>
                        <Col offset={"s4"} s={4}>
                            <Input
                                s={12}
                                input="textarea"
                                label="Extra Comments"
                                onChange={(val) => {this.setState({extraComments: val});}} />
                        </Col>
                    </Row>
                    <Row>
                        <Button waves='light' s={2}>Request Access</Button>
                    </Row>
                </Section>
            </div>
        );
    }
}

export default Request;