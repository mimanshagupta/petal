/*
 * HomePage
 * This is the first thing users see of our App
 */

import React, { Component } from 'react';
import { Input, Button, Well, Jumbotron } from 'react-bootstrap';
import { connect } from 'react-redux';
import NavField from '../fields/NavField.react';
import ChartField from '../fields/ChartField.react';
import Vid from '../../../img/vidmanage.png';
import Logo from '../../../img/iconmodified.png';
import QB from '../../../img/questionbank.png';

class HomePage extends Component {
    constructor(props, context) {
      super(props, context);
      let _this = this;
      let current_user = props.data.Parse.User.current();
      this.state = {
        username: '',
        password: '',
        user_display: '',
        logged_in: current_user ? true : false
      };
      if (current_user) {
        props.data.Parse.User.current().fetch().then(function (user) {
          let u = user.get('username');
          _this.setState({
            user_display: u
          });
        });
      }
    };
    onUsernameChange() {
      this.setState({
        username:  this.refs.username.getValue().trim()
      });
    }
    onPasswordChange() {
      this.setState({
        password:  this.refs.password.getValue().trim()
      });
    }
    onSuccess(displayName) {
      this.setState({
        user_display: displayName,
        logged_in: true
      });
    }
    onClicked() {
        let Parse = this.props.data.Parse;
        //query = new Parse.Query(Parse.User);
        let _this = this;
        Parse.User.logIn(this.state.username, this.state.password, {
          success: function(user) {
            if(user.get('userType') === 'Teacher') {
               let displayName = user.get('username');
               _this.onSuccess(displayName);
            } else {

            }
          },
          error: function(user, error) {
            // The login failed. Check error to see why.

          }
        });
    }
    shouldComponentUpdate(a, b) {
      return true;
    }
  render() {
    let config = {
      chart: {
        type: 'bar'
      },
      title: {
        text: 'Student Performance by Major'
      },
      xAxis: {
        categories: ['C++', 'Python', 'Java']
      },
      yAxis: {
        title: {
            text: 'Correct Answers'
        }
      },
      series: [
        {
          name: 'EComE',
          data: [1, 0, 3]
        },
        {
          name: 'CE',
          data: [5, 7, 5]
        }
      ]
    };
    if(this.state.logged_in) {
      return(
        <div>
            <NavField name = {this.state.user_display} history = {this.props.history}/>
            <center>
            <div className="col-md-10 col-md-offset-1">
              <Jumbotron>
                <h1>Welcome to PETAL Dashboard!</h1>
                <p>Personalize your learning experience through a sophisticated learning dashboard & mobile application.</p>
                <p><Button bsStyle="success">Learn more</Button></p>
              </Jumbotron>
            </div>
            </center>
            <br />
            <br />
            <div className="col-md-6 col-md-offset-3">
              <h2>Analytics</h2>
              <ChartField config={config}/>
            </div>

            <div className="col-md-6 col-md-offset-3">
              <h2>Video Lecture Management</h2>
              <br />
              <img className="macs" src={Vid} />
            </div>

            <div className="col-md-6 col-md-offset-3">
              <h2>Question Bank Management</h2>
              <br />
              <img className="macs" src={QB} />
            </div>
        </div>
      );
    }
    else {
      return (
            <div>
              <img className="logo" src={Logo} />
              <center><h1>Welcome to PETAL</h1></center>
              <center>
                <Well className = "loginWell">
                <Input type="email" ref = "username" onChange={this.onUsernameChange.bind(this)} label="Email Address" placeholder="Enter email" className="username"/>
                <Input type="password" ref = "password" onChange={this.onPasswordChange.bind(this)} label="Password" placeholder="Enter password" className="password"/>
                <center><Button bsStyle="info" onClick = {this.onClicked.bind(this)}>Login</Button></center>
                </Well>
              </center>
            </div>
      );
    }
  }
}

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(HomePage);
