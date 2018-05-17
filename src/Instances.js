import React, { Component } from 'react';
import { Table, Form, Row, Col, Input, Button, Section, Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import Instance from './Instance';
import './Instances.css';
import AuthManager from './AuthManager';

class Instances extends Component {
    constructor(props) {
        super();
        this.state = {
            instances: []
        };    
    }

    componentWillMount() {
        var authManager = new AuthManager();
        authManager.getCreds((function(err) {
            if (!err) {
                this.apigClient = window.apigClientFactory.newClient();
                this.authToken = authManager.getIdToken();
                this.listInstances();
            }   
        }).bind(this));
    }

    listInstances() {
        var params = {};
        var body = {};
        var additionalParams = {
            headers: {Authorization: this.authToken.getJwtToken()},
            queryParams: {}
        };
        console.log("LISTING INSTANCES");
        this.apigClient.listcomputesGet(params, body, additionalParams)
            .then((function (result) {
                console.log("GOT RESP");
                this.setState({
                    instances: result.data
                });
                console.log("Result: " + JSON.stringify(result));
            }).bind(this)).catch(function (err) {
                console.log("GetInvestment Error: " + JSON.stringify(err));
            });
    }

    onStart(name) {
        var params = {};
        var body = {
            name: name
        };
        var additionalParams = {
            headers: {Authorization: this.authToken.getJwtToken()},
            queryParams: {}
        };
        this.apigClient.startcomputePost(params, body, additionalParams)
            .then((function (result) {
                window.Materialize.toast("Starting " + name, 4000);
                this.listInstances();
            }).bind(this)).catch(function (err) {
                console.log("GetInvestment Error: " + JSON.stringify(err));
            });
    }

    onStop(name) {
        var params = {};
        var body = {
            name: name
        };
        var additionalParams = {
            headers: {Authorization: this.authToken.getJwtToken()},
            queryParams: {}
        };
        this.apigClient.stopcomputePost(params, body, additionalParams)
            .then((function (result) {
                window.Materialize.toast("Stopping " + name, 4000);
                this.listInstances();
            }).bind(this)).catch(function (err) {
                console.log("GetInvestment Error: " + JSON.stringify(err));
            });
    }

    render() {
        let instanceArr = [];
        for (var instance of this.state.instances) {
            instanceArr.push(<Instance name={instance.name} status={instance.status} onStart={this.onStart.bind(this)} onStop={this.onStop.bind(this)}/>);
        }
        return (
            <div class="card-panel grey lighten-5 z-depth-1">
                <Section>
                    <Row>
                        <Col offset={"s1"} s={4}>
                            <h3 s={12}><Icon small>computer</Icon>Instances</h3>
                        </Col>
                    </Row>
                    <Row>
                        <Col offset={"s2"} s={8}>
                            <Collapsible s={12}>
                                {instanceArr}
                            </Collapsible>
                        </Col>
                    </Row>
                </Section>
                <Row>
                    <Button waves='light' s={2} onClick={(this.listInstances).bind(this)}><Icon>refresh</Icon></Button>
                </Row>
            </div>
        );
    }
}

export default Instances;