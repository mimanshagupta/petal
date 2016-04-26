/*
 * HomePage
 * This is the first thing users see of our App
 */
import React, { Component } from 'react';
import { Input, Button, ButtonToolbar, ProgressBar, Modal, ListGroup, ListGroupItem, Accordion, Panel } from 'react-bootstrap';
import { connect } from 'react-redux';
let Header = Modal.Header;
let Footer = Modal.Footer;
let Title = Modal.Title;
let Body = Modal.Body;
import NavField from '../fields/NavField.react';
import Logo from '../../../img/iconmodified.png';

class QuestionBank extends Component {
  constructor(props, context) {
    super(props, context);
    let _this = this;
    _this.uploadedBy = '';
    this.state = {
      user_display: '',
      categories: [],
      questions: [],
      currentCategory: '',
      showModal: false,
      showModalCat: false,
      newQ: '',
      newA: '',
      newOpt1: '',
      newOpt2: '',
      newOpt3: '',
      diff: '1'
    };
    props.data.Parse.User.current().fetch().then(function (user) {
      let u = user.get('username');
      _this.uploadedBy = u;
      _this.setState({
        user_display: u
      });
    });
  }

  componentWillMount() {
    let _this = this;
    let Parse = this.props.data.Parse;
    let uploadedby = this.uploadedBy;
    let CatObject = Parse.Object.extend("Categories");
    let query = new Parse.Query(CatObject);
    let categories = [];
    query.find({
      success: function(results) {
        for (var i = 0; i < results.length; i++) {
          let object = results[i];
          categories[i] = object.get("categoryName");
        }
        _this.setState({
          categories: categories
        });
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });
  }

  open() {
    this.setState({ showModal: true });
  }

  close() {
    this.setState({
      showModal: false
    });
  }

  openCat() {
    this.setState({ showModalCat: true });
  }

  closeCat() {
    this.setState({
      showModalCat: false
    });
  }

  onClicked (cat) {

    let _this = this;
    let Parse = this.props.data.Parse;
    let QuestionObject = Parse.Object.extend("Questions");
    let query = new Parse.Query(QuestionObject);
    let questions = [];
    query.equalTo("categoryName", cat);
    query.find({
      success: function(results) {
        for (var i = 0; i < results.length; i++) {
          let object = results[i];
          questions[i] = {};
          questions[i].q = object.get("Question");
          questions[i].a = object.get("Answer");
          questions[i].opt1 = object.get("Opt1");
          questions[i].opt2 = object.get("Opt2");
          questions[i].opt3 = object.get("Opt3");
          questions[i].diff = object.get("Difficulty");
        }
        console.log(questions);
        _this.setState({
          questions: questions,
          currentCategory: cat
        });
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });
  }

  onBack() {
    this.setState({
      currentCategory: '',
      questions: []
    });
  }

  onAddQ(e) {
    this.setState({
      newQ: e.target.value
    });
  }

  onAddA(e) {
    this.setState({
      newA: e.target.value
    });
  }
  onAddOpt1(e) {
    this.setState({
      newOpt1: e.target.value
    });
  }
  onAddOpt2(e) {
    this.setState({
      newOpt2: e.target.value
    });
  }
  onAddOpt3(e) {
    this.setState({
      newOpt3: e.target.value
    });
  }
  onAddDiff(e) {
    this.setState({
      diff: e.target.value
    });
  }
  onCategoryName(e) {
    this.setState({
      newCategory: e.target.value
    });
  }
  addNewCategory() {
    let arr = this.state.categories;
    arr.push(this.state.newCategory);
    let Parse = this.props.data.Parse;
    let CategoryObject = Parse.Object.extend("Categories");
    let categoryObject = new CategoryObject();
    categoryObject.save({
      categoryName: this.state.newCategory
    });
    this.setState({
      categories: arr,
      showModalCat: false
    });
  }

  addNewQuestions() {
    let newQuestions = {};
    newQuestions.q = this.state.newQ;
    newQuestions.a = this.state.newA;
    newQuestions.opt1 = this.state.newOpt1;
    newQuestions.opt2 = this.state.newOpt2;
    newQuestions.opt3 = this.state.newOpt3;
    newQuestions.cat = this.state.currentCategory;
    newQuestions.diff = this.state.diff;
    let Parse = this.props.data.Parse;
    let _this = this;
    let QuestionObject = Parse.Object.extend("Questions");
    let questionObject = new QuestionObject();
    questionObject.save({
      Question: newQuestions.q,
      Answer: newQuestions.a,
      Opt1: newQuestions.opt1,
      Opt2: newQuestions.opt2,
      Opt3: newQuestions.opt3,
      categoryName: newQuestions.cat,
      Difficulty: Number(newQuestions.diff)
    });
    let arr = this.state.questions;
    arr.push(newQuestions);
    this.setState({
      questions: arr,
      showModal: false,
      newQ: '',
      newA: '',
      newOpt1: '',
      newOpt2: '',
      newOpt3: '',
      diff: '1'
    });
  }

  render() {
    let _this = this;
    if(this.state.currentCategory !== ''){
      return (
        <div>
            <NavField name = {this.state.user_display}/>
            <img className="logo" src={Logo} />
            <center><h1>Question Bank</h1>
            <h3>{this.state.currentCategory}</h3>
            <Accordion className="questionsByCategory">
            {this.state.questions.map(function (question, index) {
                return (
                    <Panel className="text-left align-left" header={question.q} eventKey={index} key={index}>
                      <ListGroup>
                        <ListGroupItem bsStyle={question.opt1 === question.a ? "success" : "danger"}>{question.opt1}</ListGroupItem>
                        <ListGroupItem bsStyle={question.opt2 === question.a ? "success" : "danger"}>{question.opt2}</ListGroupItem>
                        <ListGroupItem bsStyle={question.opt3 === question.a ? "success" : "danger"}>{question.opt3}</ListGroupItem>
                      </ListGroup>
                      <div className = "col-xs-4 col-xs-offset-4">
                        {`Difficulty: ${question.diff / 10}/10`}<ProgressBar active now={question.diff}/>
                      </div>
                    </Panel>
                  );
            })}
            </Accordion>
            </center>
            <div className="col-xs-offset-4">
                  <ButtonToolbar>
                    <Button bsStyle="danger" onClick={_this.onBack.bind(_this)} className="col-xs-3">Back</Button>
                    <Button bsStyle="warning" onClick={_this.open.bind(_this)} className="col-xs-3">Add Questions</Button>
                  </ButtonToolbar>
              </div>
              <Modal show={this.state.showModal} onHide={this.close.bind(this)}>
                <Header closeButton>
                  <Title>Add Questions</Title>
                </Header>
                <Body>
                  <h4>Question</h4>
                  <Input onBlur={this.onAddQ.bind(this)} type="text" ref = "newQuestion" placeholder="Enter Question" className="newQuestion"/>
                  <hr />
                  <h4>Answer</h4>
                  <Input onBlur={this.onAddA.bind(this)} type="text" ref = "newAnswer" placeholder="Enter Answer" className="newAnswer" />
                  <hr />

                  <Input onBlur={this.onAddOpt1.bind(this)} type="text" ref = "newOpt1" placeholder="Enter first option" className="newOpt1" label = "Option 1" /><br/>
                  <Input onBlur={this.onAddOpt2.bind(this)} type="text" ref = "newOpt2" placeholder="Enter second option" className="newOpt2" label = "Option 2" /><br/>
                  <Input onBlur={this.onAddOpt3.bind(this)} type="text" ref = "newOpt3" placeholder="Enter third option" className="newOpt3" label = "Option 3" /><br/>
                  <hr />
                  <Input onChange={this.onAddDiff.bind(this)} type="select" selected={this.state.diff} label="Difficulty Rating" placeholder="Select" ref = "newDifficulty">
                    <option value="10">1</option>
                    <option value="20">2</option>
                    <option value="30">3</option>
                    <option value="40">4</option>
                    <option value="50">5</option>
                    <option value="60">6</option>
                    <option value="70">7</option>
                    <option value="80">8</option>
                    <option value="90">9</option>
                    <option value="100">10</option>
                  </Input>
                  <hr />
                </Body>
                <Footer>
                  <Button onClick={this.addNewQuestions.bind(this)}>Add</Button>
                </Footer>
              </Modal>
        </div>
      );
    } else {
      return (
        <div>
            <NavField name = {this.state.user_display}/>
            <img className="logo" src={Logo} />
            <center><h1>Question Bank</h1></center>
            <center>
              <ListGroup className="categoryNames">
                {_this.state.categories.map(function (category, index) {
                    return <ListGroupItem key={index} onClick={_this.onClicked.bind(_this, category)}>{category}</ListGroupItem> ;
                })}
              </ListGroup>
              <Button bsStyle="info" onClick={_this.openCat.bind(_this)}>Add Category</Button>
            </center>
            <Modal show={this.state.showModalCat} onHide={this.closeCat.bind(this)}>
              <Header closeButton>
                <Title>Add Category</Title>
              </Header>
              <Body>
                <Input type="text" placeholder="Enter category name" label="Category Name" onBlur={this.onCategoryName.bind(this)}/>
              </Body>
              <Footer>
                <Button onClick={this.addNewCategory.bind(this)}>Add</Button>
              </Footer>
            </Modal>
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
export default connect(select)(QuestionBank);
