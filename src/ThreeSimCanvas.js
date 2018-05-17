import React, { Component } from "react";
import React3 from 'react-three-renderer';
import * as THREE from 'three';
import Konva from "konva";
import { render } from "react-dom";
import { Stage, Layer, Rect, Text, Group, Circle } from "react-konva";
import AuthManager from './AuthManager';
import AWS from 'aws-sdk';
import ReactCursorPosition from 'react-cursor-position';
import ReactDOM from 'react-dom';
import { Table, Form, Row, Col, Input, Button, Section, Icon, Collapsible, CollapsibleItem, Carousel, Pagination, Preloader } from 'react-materialize';

class ThreeSimCanvas extends React.Component {
    constructor(props) {
        super();
        this.state = {
            cubeRotation: new THREE.Euler(),
            angle1: 0,
            angle2: 0,
            dist: 5,
            xOff: 0,
            yOff: 0,
            zOff: 0,
            spheres: null,
            idx: 0
        };
        this.dragging = false;
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

    
    onMsg(body) {
        var bodyObj = JSON.parse(body);
        console.log("MSG received: ", body);
        this.setState({"spheres": bodyObj.sphereArr, "solWidth": bodyObj.w, "solHeight": bodyObj.h, "solLength": bodyObj.l, "solDensity": bodyObj.density, "idx": bodyObj.sphereArr.length});
    }

    componentDidMount() {
        const container = this.refs.container;

        container.addEventListener('mousedown', this.onDragStart.bind(this), false);
        container.addEventListener('mouseup', this.onDragEnd.bind(this), false);
        container.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        container.addEventListener('mouseleave', this.onMouseLeave.bind(this), false);
        container.addEventListener('mouseenter', this.onMouseEnter.bind(this), false);
        document.addEventListener('keydown', this.onKeyPress.bind(this),  false);
    }

    onMouseEnter() {
        this.active = true;
    }

    onMouseLeave() {
        this.active = false;
        this.dragging = false;
    }

    onDragStart(evt) {
        this.dragging = true;
        this.startX = this.mouseX;
        this.startY = this.mouseY;
    }

    onDragEnd(evt) {
        this.dragging = false;    
    }

    onKeyPress(e) {
        if (this.active) {
            var keynum;

            if(window.event) { // IE                    
                keynum = e.keyCode;
            } else if(e.which){ // Netscape/Firefox/Opera                   
                keynum = e.which;
            }

            var key = String.fromCharCode(keynum);
            if (key == 'w' || key == 'W') {
                this.setState({
                    zOff: this.state.zOff + Math.sin(this.state.angle2)/2.0,
                });
            } else if (key == 's' || key =='S') {
                this.setState({
                    zOff: this.state.zOff - Math.sin(this.state.angle2)/2.0,
                });
            } else if (key == 'a' || key == 'A') {
                this.setState({
                    xOff: this.state.xOff - Math.sin(this.state.angle1)/2.0,
                    yOff: this.state.yOff + Math.cos(this.state.angle1)/2.0
                });
            } else if (key == 'd' || key == 'D') {
                this.setState({
                    xOff: this.state.xOff + Math.sin(this.state.angle1)/2.0,
                    yOff: this.state.yOff - Math.cos(this.state.angle1)/2.0
                });
            }
            else if (key == 'z' || key == 'Z') {
                this.setState({
                    dist: this.state.dist - 0.5
                });
            } else if (key == 'x' || key =='X') {
                this.setState({
                    dist: this.state.dist + 0.5
                });
            } else if (key == 'o' || key == 'O') {
                if (this.state.spheres != null && this.state.idx < this.state.spheres.length) {
                    this.setState({
                        idx: this.state.idx + 1
                    });
                }
            } else if (key == 'i' || key == 'I') {
                if (this.state.spheres != null && this.state.idx > 1) {
                    this.setState({
                        idx: this.state.idx - 1
                    });
                }
            }
        }
    }

    onMouseMove(evt) {
        this.mouseX = evt.clientX;
        this.mouseY = evt.clientY;
        if (this.dragging) {
            var p1 = {"x": this.mouseX, "y": this.mouseY};
            var p2 = {"x": this.startX, "y": this.startY};
            var xOff = (p2.x - p1.x);
            var yOff = (p2.y - p1.y);
            var angle1 = -xOff/400 + this.state.angle1;
            var angle2 = yOff/400 + this.state.angle2;
            this.setState({"angle1": angle1, "angle2": angle2});
            this.startX = this.mouseX;
            this.startY = this.mouseY;
        }
    }

    render() {
        if (this.state.spheres != null) {
            var width = window.innerWidth;
            var height = window.innerHeight;
            var circRes = 8;

            var cDif = 1.0 / this.state.idx;
            var c = 0;
            var spheres = [];
            for (var i = 0; i < this.state.idx; i++) {
                var sphereInfo = this.state.spheres[i];
                spheres.push(
                    <mesh
                        position={new THREE.Vector3(sphereInfo.x, sphereInfo.y, sphereInfo.z)}>
                        <sphereGeometry
                        radius={sphereInfo.r}
                        widthSegments={circRes}
                        heightSegments={circRes} />
                        <meshBasicMaterial
                        color={new THREE.Color(1, c, 1)}
                        wireframe={true} />
                    </mesh>
                );
                c += cDif;
            }
            //console.log(Math.cos(this.state.angle1)*this.state.dist, Math.sin(this.state.angle1)*this.state.dist, Math.cos(this.state.angle2)*this.state.dist);
            return(
                <div ref="container">
                    <React3
                        mainCamera="maincamera"
                        width={width}
                        height={height}>
                            <scene>
                                <perspectiveCamera
                                    name="maincamera"
                                    fov={75}
                                    aspect={width/height}
                                    near={0.1}
                                    far={1000}
                                    position={new THREE.Vector3(Math.cos(this.state.angle1) * this.state.dist + this.state.xOff, 
                                        Math.cos(this.state.angle2) * this.state.dist + this.state.zOff,  
                                        Math.sin(this.state.angle1) * this.state.dist  + this.state.yOff)}
                                    lookAt={new THREE.Vector3(this.state.xOff, this.state.zOff, this.state.yOff)}>

                                </perspectiveCamera>
                                {spheres}
                                <mesh
                                    position={new THREE.Vector3(this.state.solWidth/2.0, this.state.solHeight/2.0, this.state.solLength/2.0)}>
                                    <boxGeometry
                                        width={this.state.solWidth}
                                        height={this.state.solHeight}
                                        depth={this.state.solLength} />
                                    <meshBasicMaterial
                                        color={0x00ff00}
                                        wireframe={true} />
                                </mesh>
                            </scene>
                        </React3>
                    </div>
                );
        } else {
            return (<div ref="container">
                <Col s={8} offset={"s2"}>
                    <Preloader flashing size='big'/>
                </Col>
            </div>);
        }
    }
  }

  export default ThreeSimCanvas;