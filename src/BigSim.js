import React, { Component } from 'react';
import { Table, Form, Row, Col, Input, Button, Section, Icon, Collapsible, CollapsibleItem, Tabs, Tab } from 'react-materialize';
import ThreeSimCanvas from './ThreeSimCanvas';
import SimulationCanvas from './SimulationCanvas';
import './Simulation.css';
import AWS from 'aws-sdk';
import AuthManager from './AuthManager';

class BigSim extends Component {
    constructor(props) {
        super();
        this.state = {
            countGroups: [],
            msgId: null,
            type: "matchArea",
            precision: "0.0001",
            scaleFactor: "1"
        };
    }

    precisionRound(number, precision) {
        var factor = Math.pow(10, precision);
        return Math.round(number * factor) / factor;
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

    parseNumList(str) {
        var arr = [];
        var strArr = str.split(" ");
        for (var i = 0; i < strArr.length; i++) {
            if (isNaN(strArr[i])) {
                return null
            }
            arr.push(parseFloat(strArr[i])/2.0);
        }
        return arr;
    }

    getComb(total, dif, typeSize) {
        var arr = [];
        if (typeSize == 1) {
            for (var i = 0; i <= total; i += dif) {
                arr.push([i]);
            }
        } else if (typeSize == 2) {
            for (var i = 0; i <= total; i += dif) {
                arr.push([i, total - i]);
            }
        } else {
            for (var i = 0; i <= total; i += dif) {
                var counts = this.getComb(total - i, dif, typeSize - 1);
                for (var count of counts) {
                    count.unshift(i);
                    arr.push(count);
                }   
            }
        }
        return arr;
    }

    combineCombs(combs1, combs2) {
        if (combs1 == null) {
            return combs2;
        }
        var arr = [];
        for (var comb1 of combs1) {
            for (var comb2 of combs2) {
                arr.push(comb1.concat(comb2));
            }
        }
        return arr;
    }

    onSubmit() {
        var msgId = (Math.random() * 100000).toString();
        var body = { circTypes: [], 
            precision: parseFloat(this.state.precision), 
            queueUrl: ("https://sqs.us-west-2.amazonaws.com/387396130957/" + this.getQueueName()),
            msgId: msgId,
            type: this.state.type,
            w: parseFloat(this.state.width),
            h: parseFloat(this.state.height),
            l: parseFloat(this.state.length)};

        var scaleFactor = parseFloat(this.state.scaleFactor);
        var netCounts = null;
        var netRadii = [];
        var netCircleMults = [];
        var i = 0;
        for (var countGroup of this.state.countGroups) {
            var total = parseFloat(countGroup.total);
            var circleRadii = this.parseNumList(countGroup.circleRadii);
            netRadii = netRadii.concat(circleRadii);
            var counts = this.getComb(total, parseFloat(countGroup.dif), circleRadii.length);
            for (var radius of circleRadii) {
                netCircleMults.push((scaleFactor)/((4.0/3.0) * Math.PI * radius * radius * radius));
            }
            netCounts = this.combineCombs(netCounts, counts);
        }
        
        //TODO: update region
        var sqs = new AWS.SQS();
        this.setState({
            "msgId": msgId
        });
        
        var i = 0;
        for (var count of netCounts) {
            body.circTypes = [];
            body.msgNum = i;
            for (var j = 0; j < count.length; j++) {
                var realCount = Math.round(count[j] * netCircleMults[j]);
                if (realCount > 0) {
                    body.circTypes.push({"count": realCount, "radius": netRadii[j], "extras": this.precisionRound(count[j], 4).toString()});
                }
            }
            var sendParams = {
                MessageBody: JSON.stringify(body),
                QueueUrl: "https://sqs.us-west-2.amazonaws.com/387396130957/circle.fifo",
                MessageGroupId: (Math.random() * 100000).toString(),
                MessageDeduplicationId: (Math.random() * 100000).toString() //TODO: Fix this
            };

            sqs.sendMessage(sendParams, (function(circTypes, err, data) {
                if (err) {
                    console.log("ERR", err);
                    return;
                }
                console.log("Msg Sent: " + JSON.stringify(circTypes));
            }).bind(this, body.circTypes));
            i++;
        }
    }
    

    render() {
        var buttonClass = '';
        var circleForms = [];
        var i = 0;
        for (var countGroup of this.state.countGroups) {
            var radiiClass = "valid";
            var totalClass = "valid";
            var difClass = "valid";
            var circleRadii = this.parseNumList(countGroup.circleRadii)
            if (circleRadii == null) {
                radiiClass = 'invalid';
                buttonClass = 'disabled';
            }
            if ((isNaN(countGroup.total) || countGroup.total.length == 0)) {
                totalClass = 'invalid';
                buttonClass = 'disabled';
            }
            if ((isNaN(countGroup.dif) || countGroup.dif.length == 0)) {
                difClass = 'invalid';
                buttonClass = 'disabled';
            }
            circleForms.push(
            <Row>
                <Col s={1}>
                    <Button floating small className='Simulation-Icon' waves='light' icon='remove' onClick={((groupI, val) => {
                            let newCountGroups = this.state.countGroups.slice();
                            newCountGroups.splice(groupI, 1);
                            this.setState({countGroups: newCountGroups});
                        }).bind(this, i)} />
                </Col>
                <Col offset={"s1"} s={3}>
                    <Input s={12} label="Volume Total" className={totalClass} value={countGroup.total} onChange={((groupI, evt) => {
                        let newCountGroups = this.state.countGroups.slice();
                        newCountGroups[groupI].total = evt.target.value;
                        this.setState({countGroups: newCountGroups});
                    }).bind(this, i)} />
                </Col>
                <Col s={3}>
                    <Input s={12} label="Volume Difference" className={difClass} value={countGroup.dif} onChange={((groupI, evt) => {
                        let newCountGroups = this.state.countGroups.slice();
                        newCountGroups[groupI].dif = evt.target.value;
                        this.setState({countGroups: newCountGroups});
                    }).bind(this, i)} />
                </Col>
                <Col s={4}>
                    <Input s={12} label="Diameters" className={radiiClass} value={countGroup.circleRadii} onChange={((groupI, evt) => {
                        let newCountGroups = this.state.countGroups.slice();
                        newCountGroups[groupI].circleRadii = evt.target.value;
                        this.setState({countGroups: newCountGroups});
                    }).bind(this, i)} />
                </Col>
            </Row>);
            i++;
        }
        if (circleForms.length == 0) {
            buttonClass = 'disabled';
        }
        var divClasses = "card-panel grey lighten-5 z-depth-1";
        
        var simCanvas = null;
        if (this.state.msgId != null) {
            if (this.props.three) {
                simCanvas = <ThreeSimCanvas msgId={this.state.msgId} hidden={this.props.hidden}/>
            } else {
                simCanvas = <SimulationCanvas msgId={this.state.msgId} hidden={this.props.hidden}/>
            }
        }

        if (!this.props.hidden) {
            return (
                <div class={divClasses}>
                    <Section>
                        {simCanvas}
                        {circleForms}
                        <Row>
                            <Button floating large className='blue' waves='light' icon='add' onClick={((val) => {
                                    let newCountGroups = this.state.countGroups.slice();
                                    newCountGroups.push({circleRadii: "", total: "", dif: ""});
                                    this.setState({countGroups: newCountGroups});
                                }).bind(this)} />
                        </Row>
                    </Section>
                    <Row>
                        <Col s={4} offset={"s4"}>
                            <Input s={12} label="Precision" value={this.state.precision} onChange={((evt) => {
                                this.setState({precision: evt.target.value});
                            }).bind(this)} />
                        </Col>
                    </Row>
                    <Row>
                        <Col s={4} offset={"s4"}>
                            <Input s={12} label="ScaleFactor" value={this.state.scaleFactor} onChange={((evt) => {
                                this.setState({scaleFactor: evt.target.value});
                            }).bind(this)} />
                        </Col>
                    </Row>
                    <Row>
                        <Button waves='light' className={buttonClass} s={2} onClick={(this.onSubmit).bind(this)}>Submit</Button>
                    </Row>
                </div>
            );
        }
        else {
            return (<div></div>);
        }
    }
}

export default BigSim;

                