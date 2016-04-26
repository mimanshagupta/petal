/*
 * HomePage
 * This is the first thing users see of our App
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import NavField from '../fields/NavField.react';
import Logo from '../../../img/iconmodified.png';
import ReactPlayer from 'react-player';
import { Button, ButtonGroup, ButtonToolbar, Glyphicon, Modal, ListGroup, ListGroupItem, ProgressBar, Panel, Accordion, Input, Row, Col } from 'react-bootstrap';

let Header = Modal.Header;
let Body = Modal.Body;
let Footer = Modal.Footer;
let Title = Modal.Title;

class VideoPlayer extends Component {
  constructor(props, context) {
    super(props, context);
    let _this = this;
    this.state = {
      user_display: '',
      playing: true,
      showModal: false,
      categories: [],
      questions: [],
      old_questions: [],
      video_id: props.location.query.id,
      modal_content: 'categories'
    };
    this.questionsAdded.apply(this);
    props.data.Parse.User.current().fetch().then(function (user) {
      let u = user.get('username');
      _this.uploadedBy = u;
      _this.setState({
        user_display: u
      });
    });
    let Parse = props.data.Parse;
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
  onSeekMouseDown(e) {
    this.setState({ seeking: true })
  };
  onSeekChange(e) {
    this.setState({ played: parseFloat(e.target.value) })
  };
  onSeekMouseUp(e) {
    this.setState({ seeking: false })
    this.refs.player.seekTo(parseFloat(e.target.value))
  };
  onProgress(state) {
    if (!this.state.seeking && this.state.playing) {
      this.setState(state)
    }
  }

  questionsAdded() {
    console.log("hereeee");
    let _this = this;
    let Parse = this.props.data.Parse;

    let QuizObject = Parse.Object.extend("Quiz");
    let quizQuery = new Parse.Query(QuizObject);

    quizQuery.equalTo("videoId", this.state.video_id);
    quizQuery.find({
      success: function(oldies) {
        console.log(oldies);
        for(var i = 0; i < oldies.length; i++) {
          console.log("here4");
          let quizObject = oldies[i];
          let qid = quizObject.get("questionId");
          let query = new Parse.Query("Questions");
          console.log("QID: " + qid);
          query.equalTo("objectId", qid);
          query.find({
            success: function(results) {
                let object = results[0];
                let o = {};
                o.id = object.id;
                o.q = object.get("Question");
                o.a = object.get("Answer");
                o.opt1 = object.get("Opt1");
                o.opt2 = object.get("Opt2");
                o.opt3 = object.get("Opt3");
                o.diff = object.get("Difficulty");
                o.categoryName = object.get("categoryName");
                o.timestamp = quizObject.get("timeStamp");
                let w = _this.state.old_questions;
                w.push(o);
                _this.setState({
                  old_questions: w
                });
              }
            });
          }
        }
      });
    }

  onCategoryClicked(index, e) {
    this.setState({
      modal_content: 'questions'
    });
    let _this = this;
    let Parse = this.props.data.Parse;
    let QuestionObject = Parse.Object.extend("Questions");
    let query = new Parse.Query(QuestionObject);
    let questions = [];
    query.equalTo("categoryName", this.state.categories[index]);
    query.find({
      success: function(results) {
        for (var i = 0; i < results.length; i++) {
          let object = results[i];
          questions[i] = {};
          questions[i].id = object.id;
          questions[i].q = object.get("Question");
          questions[i].a = object.get("Answer");
          questions[i].opt1 = object.get("Opt1");
          questions[i].opt2 = object.get("Opt2");
          questions[i].opt3 = object.get("Opt3");
          questions[i].diff = object.get("Difficulty");
        }
        _this.setState({
          questions: questions
        });
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });
  }
  onAdd(question) {
    let _this = this;
    let Parse = this.props.data.Parse;
    let QuizObject = Parse.Object.extend("Quiz");
    let query = new Parse.Query(QuizObject);
    query.equalTo("questionId", question.id);
    query.equalTo("videoId", this.state.video_id);
    query.find({
      success: function(results) {
        if(results.length > 0) {
          alert("This question has already been added to the video.");
        }
        else {
          let quiz = new QuizObject();
          quiz.save({
            questionId: question.id,
            videoId: _this.state.video_id,
            timeStamp: Math.floor(_this.state.duration * _this.state.played),
            difficulty: question.diff,
            answeredA: 0,
            answeredB: 0,
            answeredC: 0
          });
        }
      }
    });
  }
  render() {
    let _this = this;
    return (
      <div>
        <NavField name = {this.state.user_display}/>
        <img className="logo" src={Logo} />
        <center>
        <div className="col-md-8 col-xs-offset-2">
            <ReactPlayer
              ref="player"
              url={this.props.location.query.video}
              playing = {this.state.playing}
              onPlay = {() => this.setState({ playing: true })}
              onPause = {() => this.setState({ playing: false })}
              onEnded={() => this.setState({ playing: false })}
              onError={(e) => console.log('onError', e)}
              onProgress={this.onProgress.bind(this)}
              onDuration={(duration) => this.setState({ duration })}/>
              <input className="col-md-3"
                    type='range' min={0} max={1} step='any'
                    value={this.state.played || 0}
                    onMouseDown={this.onSeekMouseDown.bind(this)}
                    onChange={this.onSeekChange.bind(this)}
                    onMouseUp={this.onSeekMouseUp.bind(this)}
                  />
              <ButtonGroup>
                <center>
                  <Button disabled={this.state.playing} onClick={() => this.setState({ playing: true })}><Glyphicon glyph="play" /></Button>
                  <Button disabled={!this.state.playing} onClick={() => this.setState({ playing: false })}><Glyphicon glyph="pause" /></Button>
                  <Button disabled={!this.state.playing} onClick={() => {this.setState({ playing: false, played: 0 }); this.refs.player.seekTo(0)}}><Glyphicon glyph="stop" /></Button>
                </center>
              </ButtonGroup>
              <br/> <br/>
              <Button disabled={this.state.playing || this.state.played === 0} bsStyle="success" onClick={() => {this.setState({ showModal: true })}}>Add a Question</Button>
              <br /><br /><br />
              <Accordion>
              {this.state.old_questions.length > 0 && this.state.old_questions.map(function (oldquestion, indexq) {
                return(
                  <Panel className="text-left align-left" header={oldquestion.q} key={Math.random()} eventKey={indexq}>
                    <ListGroup>
                      <ListGroupItem bsStyle={oldquestion.opt1 === oldquestion.a ? "success" : "danger"}>{oldquestion.opt1}</ListGroupItem>
                      <ListGroupItem bsStyle={oldquestion.opt2 === oldquestion.a ? "success" : "danger"}>{oldquestion.opt2}</ListGroupItem>
                      <ListGroupItem bsStyle={oldquestion.opt3 === oldquestion.a ? "success" : "danger"}>{oldquestion.opt3}</ListGroupItem>
                    </ListGroup>
                    <div className = "col-xs-4 col-xs-offset-4">
                      {`Difficulty: ${oldquestion.diff / 10}/10`}<ProgressBar active now={oldquestion.diff}/>
                    <br/>
                    </div>
                    <h4>Category: {oldquestion.categoryName}</h4>
                    <h4>Timestamp: {oldquestion.timestamp}</h4>
                  </Panel>
                );
              })}
              </Accordion>
            </div>

            </center>
        <Modal show={this.state.showModal} onHide={() => {this.setState({ showModal: false })}}>
          <Header closeButton>
            <Title>{"Add Questions at " + Math.floor(this.state.duration * this.state.played / 60) + ":" + Math.round((this.state.duration * this.state.played) % 60 )}</Title>
          </Header>
          <Body>
            {this.state.modal_content === "categories" && (
              <ListGroup className="categoryNames">
                {this.state.categories.map(function (category, index) {
                  return <ListGroupItem key={index} onClick={_this.onCategoryClicked.bind(_this, index)}>{category}</ListGroupItem> ;
                })}
              </ListGroup>)}
            {this.state.modal_content === "questions" && (
              <Accordion>
                {this.state.questions.map(function (question, index) {
                  return (
                    <Panel className="text-left align-left" header={question.q} eventKey={index} key={Math.random()}>
                      <ListGroup>
                        <ListGroupItem bsStyle={question.opt1 === question.a ? "success" : "danger"}>{question.opt1}</ListGroupItem>
                        <ListGroupItem bsStyle={question.opt2 === question.a ? "success" : "danger"}>{question.opt2}</ListGroupItem>
                        <ListGroupItem bsStyle={question.opt3 === question.a ? "success" : "danger"}>{question.opt3}</ListGroupItem>
                      </ListGroup>
                      <div className = "col-xs-4 col-xs-offset-4">
                        {`Difficulty: ${question.diff / 10}/10`}<ProgressBar active now={question.diff}/>
                      <br/>
                      <center><Button bsStyle="success" onClick={_this.onAdd.bind(_this, question)}>Add</Button></center>
                      </div>
                    </Panel>
                  );
                })}
              </Accordion>)}
          </Body>
          <Footer>
            <Button className="pull-left" onClick={(e) => this.setState({modal_content: "categories"})}>Back</Button>
          </Footer>
        </Modal>
      </div>
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
export default connect(select)(VideoPlayer);
