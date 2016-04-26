/*
 * HomePage
 * This is the first thing users see of our App
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

class NavField extends Component {
  render() {

    return (

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
export default connect(select)(NavField);
