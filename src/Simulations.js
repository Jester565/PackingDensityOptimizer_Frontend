import React, { Component } from 'react';
import { Table, Form, Row, Col, Input, Button, Section, Icon, Collapsible, CollapsibleItem, Carousel, Pagination } from 'react-materialize';
import Simulation from './Simulation';

class Simulations extends Component {
    constructor(props) {
        super();

        this.state = {
            simI: 0,
            simNames: []
        };
    }

    render() {
        var simulations = [];
        for (var i = 0; i < this.state.simNames.length; i++) {
            console.log("THREE: ", this.props.three);
            if (this.state.simI == i) {
                simulations.push(<Simulation three={this.props.three} hidden={false}/>)
            } else {
                simulations.push(<Simulation three={this.props.three} hidden={true}/>)
            }
        }
        return (
            <div class="card-panel grey lighten-5 z-depth-1">
                <Section>
                    <Row>
                        <Col offset={"s1"} s={4}>
                            <h3 s={12}><Icon small>bubble_chart</Icon>Simulations</h3>
                        </Col>
                    </Row>
                    <Row>
                        {simulations}
                    </Row>
                    <Row>
                        <Pagination items={this.state.simNames.length} activePage={this.state.simI + 1} maxButtons={8} onSelect={((val) => {
                            this.setState({simI: val - 1});
                        }).bind(this)}/>
                    </Row>
                    <Row>
                        <Button waves='light' s={2} onClick={((evt) => {
                            var newSimNames = this.state.simNames.slice();
                            newSimNames.push("Simulation #" + toString(this.state.simI));
                            this.setState({
                                simNames: newSimNames
                            });
                        }).bind(this)}>Add Simulation</Button>
                    </Row>
                </Section>
            </div>
        );
    }
}

export default Simulations;