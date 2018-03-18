import React, { Component } from 'react';
import { Table, Form, Row, Col, Input, Button, Section, Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import './Instances.css';

class Instance extends Component {
    static onSet = new Set(["RUNNING", "PROVISIONING", "STAGING"]);
    static offSet = new Set(["STOPPED", "TERMINATED"]);

    constructor(props) {
        super();
        this.state = {
            status: props.status
        };
    }

    render() { 
        var buttonText = "Transitioning...";
        var buttonIcon = "compare arrows";
        var buttonClass = "disabled";
        
        if (Instance.onSet.has(this.state.status)) {
            buttonText = "Stop";
            buttonIcon = "power_settings_new";
            buttonClass = "";
        } else if (Instance.offSet.has(this.state.status)) {
            buttonText = "Start";
            buttonIcon = "play_arrow";
            buttonClass = "";
        }
        return (
            <CollapsibleItem className='Instance-Red' header='us-west-2' icon='cloud_circle'>
                <Table className='Instance-Black'>
                    <thead>
                        <tr>
                            <th data-field="status">Status</th>
                            <th data-field="id">Id</th>
                            <th data-field="machineType">Machine Type</th>
                            <th data-field="ip">Ip</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{this.state.status}</td>
                            <td>{this.props.name}</td>
                            <td>{this.props.machineType}</td>
                            <td>{this.props.ip}</td>
                        </tr>
                    </tbody>
                </Table>
                <Row>
                    <Button className={buttonClass} iconwaves='light'><Icon>{buttonIcon}</Icon>{buttonText}</Button>
                </Row>
            </CollapsibleItem>
        );
    }
}

export default Instance;

                