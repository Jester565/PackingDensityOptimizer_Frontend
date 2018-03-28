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
            pos1: new THREE.Vector3(-2, -2.0, -2.0),
            pos2: new THREE.Vector3(-3.1, 0.0, 0.0),
            pos3: null,
            r1: 1.5,
            r2: 1.5,
            r3: 1.5,
            xOff: 0,
            yOff: 0,
            zOff: 0
        };
        this.dragging = false;
        var result = this.setTangentToWall(this.state.r3, 2);
        if (result != null) {
            this.state.pos3 = result;
        } else {
            this.state.pos3 = new THREE.Vector3(-100, -100, -100);
        }
    }

    setTangentCircle(tr, circTheta) {
        var p1 = this.state.pos1;
        var p2 = this.state.pos2;
        var r1 = this.state.r1;
        var r2 = this.state.r2;
        console.log(p1.x);
        var l = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) + Math.pow(p2.z - p1.z, 2));
		//Circles must be close enough so target can touch both of them
		if (l - r1 - r2 > tr * 2) {
			return;
        }
        console.log("L: ", l);
		
		//Calculates distance from p2 to the point on the line made between p1 and p2 tangent to the tangentPoint
		var d = (Math.pow(l, 2) + (r1 - r2) * (2 * tr + r1 + r2)) / (2 * l);
		//Height of tangentPoint above or below line made between p1 and p2
        var h = Math.sqrt(Math.pow(tr + r1, 2) - Math.pow(d, 2));
        var unitVector = new THREE.Vector3((p2.x - p1.x)/l, (p2.y - p1.y)/l, (p2.z - p1.z)/l);
        console.log("UV: ", unitVector);
        var betweenPoint = new THREE.Vector3(unitVector.x * d + p1.x, unitVector.y *d + p1.y, unitVector.z * d + p1.z);
        console.log("BP: ", betweenPoint);
        var result = new THREE.Vector3(betweenPoint.x, betweenPoint.y, betweenPoint.z);

        var theta = Math.acos(unitVector.z);
        var costheta = Math.cos(theta);
        var sintheta = Math.sin(theta);
        var r = new THREE.Vector3(-unitVector.y, unitVector.x, 0);

        var p = new THREE.Vector3(h * Math.cos(circTheta), h * Math.sin(circTheta), 0);

        result.x += (costheta + (1 - costheta) * r.x * r.x) * p.x;
        result.x += ((1 - costheta) * r.x * r.y - r.z * sintheta) * p.y;

        result.y += ((1 - costheta) * r.x * r.y + r.z * sintheta) * p.x;
        result.y += (costheta + (1 - costheta) * r.y * r.y) * p.y;

        result.z += ((1 - costheta) * r.x * r.z - r.y * sintheta) * p.x;
        result.z += ((1 - costheta) * r.y * r.z + r.x * sintheta) * p.y;

        return result;
    }

    setTangentToWall(tr, circleTheta) {
        var p1 = this.state.pos1;
        var r1 = this.state.r1;
        var wall = {x: 2, r: 0, y: -5};
        if (wall.x == 0) {
            var result = this.getTangentPoint(tr, p1.x, r1, wall.y, (wall.r != 0), 0);
            if (result == null) {
                return null;
            }
            var rVec = new THREE.Vector3(result.pos, p1.y + result.h * Math.cos(circleTheta), p1.z + result.h * Math.sin(circleTheta));
            return rVec;
        } else if (wall.x == 1) {
            var result = this.getTangentPoint(tr, p1.y, r1, wall.y, (wall.r != 0), 0);
            if (result == null) {
                return null;
            }
            var rVec = new THREE.Vector3(p1.x + result.h * Math.cos(circleTheta), result.pos, p1.z + result.h * Math.sin(circleTheta));
            return rVec;
        } else if (wall.x == 2) {
            var result = this.getTangentPoint(tr, p1.z, r1, wall.y, (wall.r != 0), 0);
            if (result == null) {
                return null;
            }
            var rVec = new THREE.Vector3(p1.x + result.h * Math.cos(circleTheta), p1.y + result.h * Math.sin(circleTheta), result.pos);
            return rVec;
        }
        return null;
    }

    getTangentPoint(tr, circPos, r, linePos, max) {
        var dif = Math.abs(circPos - linePos) - tr;
        //not sure about dif < 0
        if(dif > r + tr || dif < 0) {
            return null;
        }
        var h = Math.sqrt(Math.pow(r + tr, 2) - Math.pow(dif, 2));
        var result = {
            pos: linePos + (!max * 2 - 1) * tr, 
            h: h
        };
        return result;
    }

    vecFromWallX(x) {
        if (x == 0) {
            return new THREE.Vector3(1, 0, 0);
        } else if (x == 1) {
            return new THREE.Vector3(0, 1, 0);
        }
        return new THREE.Vector3(0, 0, 1);
    }

    setTangentToWalls(tr, circleTheta) {
        var wall1 = {x: 2, r: 0, y: -5};
        var wall2 = {x: 1, r: 1, y: 5};
        if (wall1.x == wall2.x) {
            return null;
        }
        var vec1 = this.vecFromWallX(wall1.x);
        var vec2 = this.vecFromWallX(wall2.x);
        
    }

    onAnimate() {
        this.setState({
            woof: Math.random()
        });
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
        console.log("Drag Start");
        this.dragging = true;
        this.startX = this.mouseX;
        this.startY = this.mouseY;
    }

    onDragEnd(evt) {
        console.log("Drag end");
        this.dragging = false;    
    }

    onKeyPress(e) {
        console.log("KEY PRESSED");
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
            console.log("ANGLE1 ", angle1, " ANGLE2 ", angle2);
            this.setState({"angle1": angle1, "angle2": angle2});
            this.startX = this.mouseX;
            this.startY = this.mouseY;
        }
    }

    render() {
        var width = window.innerWidth;
        var height = window.innerHeight;
        var circRes = 32;
        //console.log(Math.cos(this.state.angle1)*this.state.dist, Math.sin(this.state.angle1)*this.state.dist, Math.cos(this.state.angle2)*this.state.dist);
        return(
            <div ref="container">
                <React3
                    mainCamera="maincamera"
                    width={width}
                    height={height}
                    onAnimate={this.onAnimate.bind(this)}>
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
                            <mesh 
                                position={this.state.pos1}
                                >
                                <sphereGeometry
                                    radius={this.state.r1}
                                    widthSegments={circRes}
                                    heightSegments={circRes} />
                                <meshBasicMaterial
                                    color={0x00ff00}
                                    wireframe={true} />
                            </mesh>
                            
                           
                            <mesh 
                                position={this.state.pos3}
                                >
                                <sphereGeometry
                                    radius={this.state.r3}
                                    widthSegments={circRes}
                                    heightSegments={circRes} />
                                <meshBasicMaterial
                                    color={0xff0000}
                                    wireframe={true} />
                            </mesh>
                            <mesh 
                               
                                >
                                <boxGeometry
                                    width={10}
                                    height={10}
                                    depth={10} />
                                <meshBasicMaterial
                                    color={0x00ff00}
                                    wireframe={true} />
                            </mesh>
                        </scene>
                    </React3>
                </div>
            );
    }
  }

  export default ThreeSimCanvas;