import React, { Component } from "react";
import Konva from "konva";
import { render } from "react-dom";
import { Stage, Layer, Rect, Text, Group, Circle } from "react-konva";
import AuthManager from './AuthManager';
import AWS from 'aws-sdk';
import ReactCursorPosition from 'react-cursor-position';
import { Table, Form, Row, Col, Input, Button, Section, Icon, Collapsible, CollapsibleItem, Carousel, Pagination, Preloader } from 'react-materialize';

class SimulationCanvas extends React.Component {
    constructor(props) {
        super();
        this.state = {
            color: "red",
            circles: [],
            scaleX: 1.0,
            xOff: 0,
            yOff: 0,
            scale: 1,
            width: window.innerWidth * 0.7, 
            height: window.innerHeight * 0.7,
            solWidth: null,
            solHeight: null,
            solDensity: null
        };
    }

    componentWillMount() {
        this.authManager = new AuthManager();
        this.authManager.getCreds((function(err) {
            if (!err) {
                console.log("Authenticated");
                this.sqs = new AWS.SQS();
                //TODO: Loading sign and show error on failed login
                this.recvFromQueue(this.sqs);
            }
        }).bind(this));
    }

    componentDidMount() {
        this.updateWindowDim();
        window.addEventListener('resize', this.updateWindowDim.bind(this));
    }

    updateWindowDim() {
        this.setState({
            width: window.innerWidth * 0.7,
            height: window.innerHeight * 0.7
        });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDim);
    }

    getQueueName() {
        var str = this.authManager.getFederatedID().substr(this.authManager.getFederatedID().indexOf(':') + 1);
        console.log(str);
        return str;
    }

    onDragStart(evt) {
        console.log("Drag Start");
        this.dragging = true;
        this.startX = this.mouseX;
        this.startY = this.mouseY;
    }

    onDragEnd(evt) {
        console.log("Drag end");
        this.dragging = false;    
    }

    onDrag(evt) {
        if (this.dragging) {
            var p1 = {"x": this.mouseX, "y": this.mouseY};
            var p2 = {"x": this.startX, "y": this.startY};
            var xOff = this.state.xOff + (p2.x - p1.x)/this.state.scale;
            var yOff = this.state.yOff + (p2.y - p1.y)/this.state.scale;
            console.log("DRAG: ", xOff, yOff);
            this.setState({"xOff": xOff, "yOff": yOff});
            this.startX = this.mouseX;
            this.startY = this.mouseY;
        }
    }

    recvFromQueue(sqs) {
        var recvParams = {
            "MaxNumberOfMessages": 1,
            "QueueUrl": "https://sqs.us-west-2.amazonaws.com/387396130957/" + this.getQueueName(),
            WaitTimeSeconds: 20
        };

        sqs.receiveMessage(recvParams, (function(err, data) {
            if (err) {
                console.log("ERR: ", JSON.stringify(err));
                if (err.code == "AWS.SimpleQueueService.NonExistentQueue") {
                    var createParams = {
                        QueueName: this.getQueueName(),
                        Attributes: {
                            MessageRetentionPeriod: '60',
                            VisibilityTimeout: '0'
                        }
                    };
                    sqs.createQueue(createParams, (function(err, data) {
                        if (err) {
                            console.log("Could not create queue: ", err);
                            return;
                        }
                        console.log("Queue created");
                        this.recvFromQueue(sqs);
                    }).bind(this));
                }
                return;
            }
            if (data.Messages.length > 0) {
                var message = data.Messages[0];
                var msgId = JSON.parse(message.Body).msgId;
                if (this.props.msgId == msgId) {
                    var deleteParams = {
                        QueueUrl: "https://sqs.us-west-2.amazonaws.com/387396130957/" + this.getQueueName(),
                        ReceiptHandle: data.Messages[0].ReceiptHandle
                    };
                    sqs.deleteMessage(deleteParams, function(err, data) {
                        if (err) {
                            console.log("Failed to delete msg: ", err);
                        }
                    });
                    this.onMsg(message.Body);
                } else {
                    console.log("GroupID did not match");
                }
            }
            this.recvFromQueue(sqs);
        }).bind(this));
    }

    onMouseMove(e) {
        console.log(JSON.stringify(e));
        this.mouseX = e.screenX;
        this.mouseY = e.screenY;
        console.log("MouseX: ", this.mouseX);
    }

    onMsg(body) {
        var bodyObj = JSON.parse(body);
        console.log("MSG received: ", body);
        var newScale = this.state.height/bodyObj.h;
        this.setState({"circles": bodyObj.circleArr, "solWidth": bodyObj.w, "solHeight": bodyObj.h, "solDensity": bodyObj.density, "scale": newScale, "xOff": 0, "yOff": 0});
    }

    changeSize() {
        console.log("Size changed");
        const rect = this.refs.rect;
    
        rect.to({
          scaleX: Math.random() + 0.8,
          scaleY: Math.random() + 0.8,
          duration: 0.2
        });
    }

    changeScale(scaleChange) {
        var newScale = this.state.scale + scaleChange;
        this.setState({
            scale: newScale });
        this.startX = this.mouseX;
        this.startY = this.mouseY;
    }
    
    onScaleUp() {
        this.changeScale(this.state.scale/3);
    }

    onScaleDown() {
        this.changeScale(-this.state.scale/3.0);
    }
    
    render() {
        var circles = [];
        for (var i = 0; i < this.state.circles.length; i++) {
            var circleInfo = this.state.circles[i];
            circles.push(<Circle
                    x={(circleInfo.x - this.state.xOff) * this.state.scale}
                    y={(circleInfo.y - this.state.yOff) * this.state.scale}
                    radius={circleInfo.r * this.state.scale}
                    fill={this.state.color}
                    shadowBlur={5} 
                />
            );
        }
        var content = null;
        var zoomBar = null;
        if (circles.length > 0) {
            content =(<Col s={10}>
                <ReactCursorPosition {...{
                    className: 'example__target',
                    onPositionChanged: props => {console.log("hi"); this.mouseX = props.position.x; this.mouseY = props.position.y; this.onDrag();},
                    onActivationChanged: ({ isActive }) => {
                        if (!isActive) {
                            this.dragging = false;
                        }
                    }
                }}>
                    <div 
                        onMouseUp={this.onDragEnd.bind(this)} 
                        onMouseDown={this.onDragStart.bind(this)}>
                        <Stage width={this.state.width} height={this.state.height}>
                            <Layer>
                                <Group>
                                    <Rect
                                        x={0}
                                        y={0}
                                        width={this.state.width}
                                        height={this.state.height}
                                        fill={"white"}>
                                    </Rect>
                                    <Rect
                                        x={-this.state.xOff * this.state.scale}
                                        y={-this.state.yOff * this.state.scale}
                                        width={this.state.solWidth * this.state.scale}
                                        height={this.state.solHeight * this.state.scale}
                                        fill={"black"}>
                                    </Rect>
                                    {circles}
                                </Group>
                            </Layer>
                        </Stage>
                    </div>
                </ReactCursorPosition>
            </Col>);
            zoomBar = (<Row> 
                <Col s={1} offset={"s4"}>
                    <Button s={12} waves='light'
                        onClick={this.onScaleDown.bind(this)}><Icon left>remove</Icon></Button>
                </Col>
                <Col s={2}>
                    <p s={12}>{this.state.scale}</p>
                </Col>
                <Col s={1}>
                    <Button s={12} waves='light'
                        onClick={this.onScaleUp.bind(this)}><Icon left>add</Icon></Button>
                </Col>
            </Row>);
        } else {
            content = (<Col s={8} offset={"s2"}>
                <Preloader flashing size='big'/>
            </Col>);
        }
        if (!this.props.hidden) {
            return (
                <div class='hidden'>
                    <Row>
                        {content}
                        <Col s={2}>
                            <p>Density: {(this.state.solDensity != null) ? (this.state.solDensity) : "Loading..."}</p>
                            <p>CircleArea: {(this.state.solWidth != null && this.state.solHeight != null && this.state.solDensity != null) ? ((this.state.solWidth * this.state.solHeight) * this.state.solDensity) : "Loading..."}</p>
                            <p>BoxArea: {(this.state.solWidth != null && this.state.solHeight != null) ? (this.state.solWidth * this.state.solHeight) : "Loading..."}</p>
                            <p>Width: {(this.state.solWidth != null) ? (this.state.solWidth) : "Loading..."}</p>
                            <p>Height: {(this.state.solHeight != null) ? (this.state.solHeight) : "Loading..."}</p>
                        </Col>
                    </Row>
                    {zoomBar}
                </div>
            );
        } else {
            return (<div></div>);
        }
    }
  }

  export default SimulationCanvas;