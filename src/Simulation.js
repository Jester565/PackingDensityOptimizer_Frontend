import React, { Component } from 'react';
import { Table, Form, Row, Col, Input, Button, Section, Icon, Collapsible, CollapsibleItem, Tabs, Tab } from 'react-materialize';
import ThreeSimCanvas from './ThreeSimCanvas';
import './Simulation.css'
import AWS from 'aws-sdk';
import AuthManager from './AuthManager';

class Simulation extends Component {
    static onSet = new Set(["RUNNING", "PROVISIONING", "STAGING"]);
    static offSet = new Set(["STOPPED", "TERMINATED"]);

    constructor(props) {
        super();
        this.state = {
            circleTypes: [],
            msgId: null,
            type: "matchArea",
            width: 0,
            height: 0,
            length: 0
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
        var msgId = (Math.random() * 100000).toString();
        var body = { circTypes: [], 
            precision: 0.000001, 
            queueUrl: ("https://sqs.us-west-2.amazonaws.com/387396130957/" + this.getQueueName()),
            msgId: msgId,
            type: this.state.type,
            w: parseFloat(this.state.width),
            h: parseFloat(this.state.height),
            l: parseFloat(this.state.length)};

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

        sqs.sendMessage(sendParams, (function(err, data) {
            if (err) {
                console.log("ERR", err);
                return;
            }
            this.setState({
                "msgId": msgId
            });
            console.log("Msg Sent!");
        }).bind(this));
    }

    onTabChange(tabId) {
        console.log(tabId);
        if (parseInt(tabId) % 10 == 0) {
            this.setState({
                type: "matchArea"
            });
        } else {
            this.setState({
                type: "matchCount"
            });
        }
    }

    render() {
        console.log("Hidden:", this.props.hidden);
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
            var val2Label = "Count";
            if (this.state.type == "matchCount") {
                val2Label = "Percent (int)";
            }
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
                    <Input s={12} label={val2Label} className={countClass} value={circle.count} onChange={((circI, evt) => {
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
        var divClasses = "card-panel grey lighten-5 z-depth-1";
        if (this.props.hidden) {
            divClasses += " hidden";
        }
        var simCanvas = null;
        if (this.state.msgId != null) {
            simCanvas = <ThreeSimCanvas msgId={this.state.msgId} />
        }
        var extraInput = null;
        if (this.state.type == "matchCount") {
            extraInput = (
                    <Row>
                        <Col s={4}>
                            <Input s={12} label="Width" value={this.state.width} onChange={((evt) => {
                                this.setState({width: evt.target.value});
                            }).bind(this)} />
                        </Col>
                        <Col s={4}>
                            <Input s={12} label="Height" value={this.state.height} onChange={((evt) => {
                                this.setState({height: evt.target.value});
                            }).bind(this)} />
                        </Col>
                        <Col s={4}>
                            <Input s={12} label="Length" value={this.state.length} onChange={((evt) => {
                                this.setState({length: evt.target.value});
                            }).bind(this)} />
                        </Col>
                    </Row>
                );
        }
        return (
            <div class={divClasses}>
                <Section>
                    <Row>
                        {simCanvas}
                    </Row>
                    <Tabs className='Tab z-depth-1' onChange={this.onTabChange.bind(this)}>
                        <Tab title="Match Area" />
                        <Tab title="Match Count" />
                    </Tabs>
                    {circleForms}
                    <Row>
                        <Button floating large className='blue' waves='light' icon='add' onClick={((val) => {
                                let newCircleTypes = this.state.circleTypes.slice();
                                newCircleTypes.push({radius: "", count: ""});
                                this.setState({circleTypes: newCircleTypes});
                            }).bind(this)} />
                    </Row>
                    {extraInput}
                </Section>
                <Row>
                    <Button waves='light' className={buttonClass} s={2} onClick={(this.onSubmit).bind(this)}>Submit</Button>
                </Row>
            </div>
        );
        return (<div></div>);
    }
}

export default Simulation;

                