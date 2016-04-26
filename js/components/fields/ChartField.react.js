/*
 * HomePage
 * This is the first thing users see of our App
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
let Highcharts = require('highcharts');
global.Highcharts = Highcharts;
let ReactHighcharts = require('react-highcharts');

class ChartField extends Component {
  render() {
    return (
      <ReactHighcharts config = {this.props.config}/>
    );
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
export default connect(select)(ChartField);
