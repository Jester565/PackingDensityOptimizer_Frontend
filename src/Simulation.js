import React, { Component } from 'react';
import { Table, Form, Row, Col, Input, Button, Section, Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import SimulationCanvas from './SimulationCanvas';
import './Simulation.css'
import AWS from 'aws-sdk';
import AuthManager from './AuthManager';

class Simulation extends Component {
    static onSet = new Set(["RUNNING", "PROVISIONING", "STAGING"]);
    static offSet = new Set(["STOPPED", "TERMINATED"]);

    constructor(props) {
        super();
        this.state = {
            circleTypes: []
        };
    }

    componentWillMount() {
        this.authManager = new AuthManager();
        this.authManager.getCreds(function(err) {
            console.log("Authenticated");
            //TODO: Loading sign and show error on failed login
        });
    }

    getQueueName() {
        var str = this.authManager.getFederatedID().substr(this.authManager.getFederatedID().indexOf(':') + 1);
        console.log(str);
        return str;
    }

    onSubmit() {
        var body = { circTypes: [], 
            precision: 0.000001, 
            queueUrl: ("https://sqs.us-west-2.amazonaws.com/387396130957/" + this.getQueueName())};

        for (var i = 0; i < this.state.circleTypes.length; i++) {
            var circTypeStr = this.state.circleTypes[i];
            var circTypeNum = {};
            circTypeNum["count"] = parseInt(circTypeStr.count);
            circTypeNum["radius"] = parseFloat(circTypeStr.radius);
            body.circTypes.push(circTypeNum);
        }
        
        //TODO: update region
        var sqs = new AWS.SQS();

        var sendParams = {
            MessageBody: JSON.stringify(body),
            QueueUrl: "https://sqs.us-west-2.amazonaws.com/387396130957/circle.fifo",
            MessageGroupId: (Math.random() * 100000).toString(),
            MessageDeduplicationId: (Math.random() * 100000).toString() //TODO: Fix this
        };

        sqs.sendMessage(sendParams, function(err, data) {
            if (err) {
                console.log("ERR", err);
                return;
            }
            console.log("Msg Sent!");
        });
    }

    render() {
        console.log("Hidden:", this.props.hidden);
        if (!this.props.hidden) {
            var buttonClass = '';
            var circleForms = [];
            for (var i = 0; i < this.state.circleTypes.length; i++) {
                var circle = this.state.circleTypes[i];
                var radiusClass = ((isNaN(circle.radius) || circle.radius.length == 0) ? 'invalid': 'valid');
                var countClass = ((isNaN(circle.count) || circle.count.length == 0) ? 'invalid': 'valid');
                if (radiusClass == 'invalid' || countClass == 'invalid') {
                    buttonClass = 'disabled';
                }
                console.log("Radius: ", circle.radius);
                circleForms.push(
                <Row>
                    <Col s={1}>
                        <Button floating small className='Simulation-Icon' waves='light' icon='remove' onClick={((circI, val) => {
                                let newCircleTypes = this.state.circleTypes.slice();
                                newCircleTypes.splice(circI, 1);
                                this.setState({circleTypes: newCircleTypes});
                            }).bind(this, i)} />
                    </Col>
                    <Col offset={"s1"} s={4}>
                        <Input s={12} label="Radius" className={radiusClass} value={circle.radius} onChange={((circI, evt) => {
                            let newCircleTypes = this.state.circleTypes.slice();
                            newCircleTypes[circI].radius = evt.target.value;
                            this.setState({circleTypes: newCircleTypes});
                        }).bind(this, i)} />
                    </Col>
                    <Col s={4}>
                        <Input s={12} label="Count" className={countClass} value={circle.count} onChange={((circI, evt) => {
                            let newCircleTypes = this.state.circleTypes.slice();
                            newCircleTypes[circI].count = evt.target.value;
                            this.setState({circleTypes: newCircleTypes});
                        }).bind(this, i)} />
                    </Col>
                </Row>);
            }
            if (circleForms.length == 0) {
                buttonClass = 'disabled';
            }
            return (
                <div class="card-panel grey lighten-5 z-depth-1">
                    <Section>
                        <Row>
                            <SimulationCanvas />
                        </Row>
                        {circleForms}
                        <Row>
                            <Button floating large className='blue' waves='light' icon='add' onClick={((val) => {
                                    let newCircleTypes = this.state.circleTypes.slice();
                                    newCircleTypes.push({radius: "", count: ""});
                                    this.setState({circleTypes: newCircleTypes});
                                }).bind(this)} />
                        </Row>
                    </Section>
                    <Row>
                        <Button waves='light' className={buttonClass} s={2} onClick={(this.onSubmit).bind(this)}>Submit</Button>
                    </Row>
                </div>
            );
        }
        return (<div></div>);
    }
}

export default Simulation;

                