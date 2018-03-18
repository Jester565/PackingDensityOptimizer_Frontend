import React, { Component } from 'react';
import logo from './logo.png';
import Login from './Login';
import Request from './Request';
import MyNavbar from './MyNavbar';
import UserStats from './UserStats';
import Instances from './Instances';
import Simulations from './Simulations'
import {Tabs, Tab, Preloader} from 'react-materialize';
import AuthManager from './AuthManager';
import './App.css';

var LoginState = {
  WAITING: 0,
  LOGGEDIN: 1,
  LOGGEDOUT: 2
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      loggedIn: LoginState.WAITING
    }
  }

  componentWillMount() {
    this.authManager = new AuthManager();
    this.authManager.getCreds((function(err) {
      if (err) {
        this.setState({
          loggedIn: LoginState.LOGGEDOUT
        });
      } else {
        this.setState({
          loggedIn: LoginState.LOGGEDIN
        });
      }
    }).bind(this));
  }

  onLogin() {
    console.log("IN APPS NOW");
    this.setState({
      loggedIn: LoginState.WAITING
    });
    this.authManager = new AuthManager();
    this.authManager.getCreds((function(err) {
      if (err) {
        this.setState({
          loggedIn: LoginState.LOGGEDOUT
        });
      } else {
        this.setState({
          loggedIn: LoginState.LOGGEDIN
        });
      }
    }).bind(this));
  }

  render() {
    var body = <Preloader size='big'/>;
    if (this.state.loggedIn == LoginState.LOGGEDOUT) {
      body = (<div><Tabs className='Tab z-depth-1'>
          <Tab title="Login" />
          <Tab title="Request Access" />
        </Tabs>
        <p className="App-intro">
          The features offered by this website are expensive.  As a result, access is currently limited. You can request access and I will respond in 2 days.
        </p>
        <Login onSuccess={(this.onLogin).bind(this)}/>
        <Request /></div>);
    } else if (this.state.loggedIn == LoginState.LOGGEDIN) {
      body = (
        <div><Tabs className='Tab z-depth-1'>
          <Tab title="User Stats" />
          <Tab title="Instances" />
          <Tab title="Simulations" />
        </Tabs>
        <UserStats />
        <Instances />
        <Simulations />
        </div>
      );
    }
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Circles</h1>
        </header>
        {body}
      </div>
    );
  }
}

export default App;
