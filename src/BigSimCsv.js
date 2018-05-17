import React, { Component } from 'react';
import { Table, Form, Row, Col, Input, Button, Section, Icon, Collapsible, CollapsibleItem, Tabs, Tab } from 'react-materialize';
import ThreeSimCanvas from './ThreeSimCanvas';
import SimulationCanvas from './SimulationCanvas';
import './Simulation.css';
import Dropzone from 'react-dropzone'
import AWS from 'aws-sdk';
import AuthManager from './AuthManager';

class BigSimCsv extends Component {
    constructor(props) {
        super();
        this.state = {
            radii: [],
            rows: [],
            msgId: null,
            type: "matchArea",
            precision: "0.0001",
            scaleFactor: "1",
            radFactor: "1"
        };
        this.Papa = require("papaparse/papaparse.min.js");
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
                return null;
            }
            arr.push(parseFloat(strArr[i]));
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
        
        //TODO: update region
        var sqs = new AWS.SQS();
        this.setState({
            "msgId": msgId
        });
        
        var radFactor = parseFloat(this.state.radFactor);
        var i = 0;
        for (var row of this.state.rows) {
            body.circTypes = [];
            body.msgNum = i;
            for (var j = 0; j < row.length; j++) {
                var realCount = Math.round(row[j] * this.state.scaleFactor);
                if (realCount > 0) {
                    body.circTypes.push({"count": realCount, "radius": this.state.radii[j] * radFactor});
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
        var radiiElms = [];
        var tableRows = [];
        
        for (var radius of this.state.radii) {
            radiiElms.push(<th>{radius}</th>);
        }
        for (var row of this.state.rows) {
            var cols = [];
            for (var c of row) {
                cols.push(<td>{c}</td>);
            }
            tableRows.push(<tr>{cols}</tr>);
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
                        <Dropzone
                            onDrop={(accepted, rejected) => { 
                                accepted.forEach(file => {
                                    var tables = [];
                                    var rows = [];
                                    this.Papa.parse(file, {
                                        complete: (function(results) {
                                            //console.log("PARSED: ", JSON.stringify(results));
                                            /*
                                            var data = results.data;
                                            
                                            for (var i = 1; i < data.length; i++) {
                                                var csvRow = data[i];
                                                var row = [];
                                                if (csvRow.length == radii.length) {
                                                    for (var c of csvRow) {
                                                        row.push(parseInt(c));
                                                    }
                                                    rows.push(row);
                                                }
                                            }
                                            this.setState({radii: radii, rows: rows});
                                            */
                                            var r = [];
                                                for (var radius of data[0]) {
                                                    if (radius == null) {
                                                        if (r.length > 0) {
                                                            tables.push([r]);
                                                        }
                                                    } else {
                                                        r.push(radius);
                                                        r = [];
                                                    }
                                                    /*
                                                    if (radius != null) {
                                                        radii.push(parseFloat(radius));
                                                    }
                                                    */
                                                tables.push();
                                                }
                                        }).bind(this)
                                    });
                                });
                             }}>
                            <p>Try dropping some files here, or click to select files to upload.</p>
                            <p>Only *.csv will be accepted</p>
                        </Dropzone>
                    </Section>
                    <Row>
                        <Table>
                            <thead>
                                <tr>
                                     {radiiElms}
                                </tr>
                            </thead>
                            <tbody>
                                {tableRows}
                            </tbody>
                        </Table>
                    </Row>
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
                        <Col s={4} offset={"s4"}>
                            <Input s={12} label="RadFactor" value={this.state.radFactor} onChange={((evt) => {
                                this.setState({radFactor: evt.target.value});
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

export default BigSimCsv;