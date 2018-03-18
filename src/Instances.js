import React, { Component } from 'react';
import { Table, Form, Row, Col, Input, Button, Section, Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import Instance from './Instance';
import './Instances.css';

class Instances extends Component {
    constructor(props) {
        super();
        this.state = {
            
        };
    }

    render() {
        let instanceArr = [];
        instanceArr.push(<Instance/>);
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
                            <Collapsible accordion s={12}>
                                {instanceArr}
                            </Collapsible>
                        </Col>
                    </Row>
                </Section>
            </div>
        );
    }
}

export default Instances;