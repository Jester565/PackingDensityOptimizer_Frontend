import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, Section, Icon } from 'react-materialize';

class UserStats extends Component {
    constructor(props) {
        super();
        this.state = {
            username: "",
            simsRun: "",
            cost: ""
        };
    }

    render() {
        return (
            <div class="card-panel grey lighten-5 z-depth-1">
                <Section>
                    <Row>
                        <Col offset={"s1"} s={4}>
                            <h3 s={12}><Icon small>perm_identity</Icon>User Stats</h3>
                        </Col>
                    </Row>
                    <Row>
                        <Col offset={"s3"} s={2}>
                            <p><b>Simulations Run:</b><br/>20</p>
                        </Col>
                        <Col s={2}>
                            <p><b>Total Cost:</b><br/>$20.00</p>
                        </Col>
                        <Col s={2}>
                            <p><b>Scripts:</b><br/>1</p>
                        </Col>
                    </Row>
                </Section>
            </div>
        );
    }
}

export default UserStats;