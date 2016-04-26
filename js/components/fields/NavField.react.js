/*
 * HomePage
 * This is the first thing users see of our App
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Navbar, Nav, MenuItem, NavItem, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router';

class NavField extends Component {
  render() {
      const Header = Navbar.Header;
      const Brand = Navbar.Brand;
      const Toggle = Navbar.Toggle;
      const Collapse = Navbar.Collapse;
    return (
        <Navbar inverse>
          <Header>
            <Brand>
              <Link to="/">PETAL</Link>
            </Brand>
            <Toggle />
          </Header>
          <Collapse>
            <Nav>
              <NavItem eventKey={1} href="/questionbank">Question Bank</NavItem>
              <NavItem eventKey={3} href="/upload">Upload Video</NavItem>
              <NavDropdown eventKey={4} title="Analytics" id="basic-nav-dropdown">
                <MenuItem eventKey={4.1} href="/participation">Participation</MenuItem>
                <MenuItem eventKey={4.2} href="/performance">Performance</MenuItem>
                <MenuItem eventKey={4.3} href="/attentiveness">Attentiveness</MenuItem>
              </NavDropdown>
            </Nav>
            <Nav pullRight>
              <NavItem eventKey={2}>{this.props.name}</NavItem>
            </Nav>
          </Collapse>
        </Navbar>
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
