import React, { Component } from 'react';
import { Navbar, NavItem, Icon } from 'react-materialize';
import logo from './logo.png';
import './MyNavbar.css';

class MyNavbar extends Component {
    constructor(props) {
        super();
    }

    render() {
        var img = <img src={logo} class="Bar-logo" alt="logo"/>
        return (
            <Navbar brand={img} class="Bar" right>
                <NavItem>Run Simulation</NavItem>
                <NavItem>Previous Simulations</NavItem>
            </Navbar>
        );
    }
}

export default MyNavbar;