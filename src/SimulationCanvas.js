import React, { Component } from "react";
import Konva from "konva";
import { render } from "react-dom";
import { Stage, Layer, Rect, Text, Group, Circle } from "react-konva";
import AuthManager from './AuthManager';
import AWS from 'aws-sdk';
import ReactCursorPosition from 'react-cursor-position';

class SimulationCanvas extends React.Component {
    constructor(props) {
        super();
        this.state = {
            color: "red",
            circles: [],
            scaleX: 1.0,
            xOff: 0,
            yOff: 0,
            scale: 1
        };
        for (var i = 0; i < 100; i++) {
            this.state.circles.push({x: ((i % 20) * 40), y: ((i / 20) * 40), r: 20});
        }
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
                        QueueName: this.getQueueName()
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
                var deleteParams = {
                    QueueUrl: "https://sqs.us-west-2.amazonaws.com/387396130957/" + this.getQueueName(),
                    ReceiptHandle: data.Messages[0].ReceiptHandle
                };
                sqs.deleteMessage(deleteParams, function(err, data) {
                    if (err) {
                        console.log("Failed to delete msg: ", err);
                    }
                });
                this.onMsg(data.Messages[0].Body);
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
        this.setState({"circles": bodyObj.circleArr});
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
    
    render() {
        var circles = [];
        for (var i = 0; i < this.state.circles.length; i++) {
            var circleInfo = this.state.circles[i];
            circles.push(<Circle
                    x={circleInfo.x - this.state.xOff}
                    y={circleInfo.y - this.state.yOff}
                    radius={circleInfo.r}
                    fill={this.state.color}
                    shadowBlur={5}
                />
            );
        }
        return (
            <ReactCursorPosition {...{
                className: 'example__target',
                onPositionChanged: props => {console.log("hi"); this.mouseX = props.position.x; this.mouseY = props.position.y; this.onDrag();},
                onActivationChanged: ({ isActive }) => {
                    if (!isActive) {
                        this.dragging = false;
                    }
                }
            }}>
                <div onMouseUp={this.onDragEnd.bind(this)} onMouseDown={this.onDragStart.bind(this)}>
                    <Stage width={1500} height={1000}>
                        <Layer>
                            <Group>
                                {circles}
                            </Group>
                            <Text text="Density: 1000" />
                        </Layer>
                    </Stage>
                </div>
            </ReactCursorPosition>
        );
    }
  }

  export default SimulationCanvas;