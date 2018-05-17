import React, { Component } from 'react';
import { Table, Form, Row, Col, Input, Button, Section, Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import './Instances.css';

class Instance extends Component {
    static onSet = new Set(["RUNNING"]);
    static offSet = new Set(["STOPPED", "TERMINATED"]);

    constructor(props) {
        super();

        this.state = {
            clickDisabledState: null
        }
    }

    onClick() {
        if (Instance.onSet.has(this.props.status)) {
            this.setState({
                clickDisabledState: "ON"
            });
            this.props.onStop(this.props.name);
        }
        else if (Instance.offSet.has(this.props.status)) {
            this.setState({
                clickDisabledState: "OFF"
            });
            this.props.onStart(this.props.name);
        }
    }

    render() { 
        var buttonText = "Transitioning...";
        var buttonIcon = "compare arrows";
        var buttonClass = "disabled";
        
        if (Instance.onSet.has(this.props.status)) {
            buttonText = "Stop";
            buttonIcon = "power_settings_new";
            if (this.state.clickDisabledState != "ON") {
                buttonClass = "";
            }
        } else if (Instance.offSet.has(this.props.status)) {
            buttonText = "Start";
            buttonIcon = "play_arrow";
            if (this.state.clickDisabledState != "OFF") {
                buttonClass = "";
            }
        }
        return (
            <CollapsibleItem className='Instance-Black' header={this.props.name} icon='cloud_circle' onSelect={()=>{}}>
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
                            <td>{this.props.status}</td>
                            <td>{this.props.name}</td>
                            <td>{this.props.machineType}</td>
                            <td>{this.props.ip}</td>
                        </tr>
                    </tbody>
                </Table>
                <Row>
                    <Button className={buttonClass} iconwaves='light' onClick={this.onClick.bind(this)}><Icon>{buttonIcon}</Icon>{buttonText}</Button>
                </Row>
            </CollapsibleItem>
        );
    }
}

export default Instance;

