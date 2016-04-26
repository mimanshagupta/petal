/*
 * HomePage
 * This is the first thing users see of our App
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import NavField from '../fields/NavField.react';
import Logo from '../../../img/iconmodified.png';
import ChartField from '../fields/ChartField.react';
import {Tabs, Tab, Input, DropdownButton, MenuItem} from 'react-bootstrap';
import Dropdown from 'react-dropdown';

class Performance extends Component {
  constructor(props, context) {
    super(props, context);
    let _this = this;
    this.state = {
      user_display: '',
      titles: [],
      selectedVideo: '',
      selectedId: ''
    }
    props.data.Parse.User.current().fetch().then(function (user) {
      let u = user.get('username');
      _this.setState({
        user_display: u
      });
    });
    this.getAllVideos.apply(this);
  }

  getAllVideos() {
    let _this = this;
    let Parse = this.props.data.Parse;
    let VideoObject = Parse.Object.extend("Videos");
    let query = new Parse.Query(VideoObject);
    let titles = [];
    query.find({
      success: function(results) {
        for (var i = 0; i < results.length; i++) {
          let object = results[i];
          titles[i] = {};
          titles[i].name = object.get("vid_title");
          titles[i].vidLink = object.get("vid_link");
          titles[i].id = object.id;
          titles[i].views = object.get("watched");
        }
        _this.setState({
          titles: titles
        });
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });
  }

  checkAnswer(id) {
    let _this = this;
    let questions = [];
    let Parse = this.props.data.Parse;
    let QuizObject = Parse.Object.extend("Quiz");
    let query = new Parse.Query(QuizObject);
    query.equalTo("videoId", id);
    query.find({
      success: function(results) {
          console.log(results.length);
          results.forEach(function (result) {
            questions.push({
              answeredA: result.get("answeredA"),
              answeredB: result.get("answeredB"),
              answeredC: result.get("answeredC"),
              id: result.get("questionId")
            });
          });
          let queries = [];
          for (let i = 0; i < questions.length; i++) {
            let fewWins = new Parse.Query("Questions");
            fewWins.equalTo("objectId", questions[i].id);
            queries.push(fewWins);
          }

          let mainQuery = Parse.Query.or.apply(Parse.Query, queries);
          mainQuery.find({
            success: function(rows) {
              for (let j = 0; j < rows.length; j++) {
                let answer = rows[j].get("Answer");
                let optA = rows[j].get("Opt1");
                let optB = rows[j].get("Opt2");
                let optC = rows[j].get("Opt3");
                questions[j].q = rows[j].get("Question");
                if (answer === optA) {
                  questions[j].correct = questions[j].answeredA;
                  questions[j].wrong = questions[j].answeredB + questions[j].answeredC;
                }
                if (answer === optB) {
                  questions[j].correct = questions[j].answeredB;
                  questions[j].wrong = questions[j].answeredA + questions[j].answeredC;
                }
                if (answer === optC) {
                  questions[j].correct = questions[j].answeredC;
                  questions[j].wrong = questions[j].answeredB + questions[j].answeredA;
                }
              }
              _this.setState({
                questions: questions
              });
            }
          });
        }
      });
  }

  buildConfig() {
    let config = {};

    if (this.state.questions) {
      let q_names = this.state.questions.map(function (q) {
        return q.q;
      });
      let right = this.state.questions.map(function (q) {
        return q.correct;
      });
      let wrong = this.state.questions.map(function (q) {
        return q.wrong;
      });
      config = {
        chart: {
          type: 'bar'
        },
        title: {
          text: 'Performance for videos'
        },
        xAxis: {
          categories: q_names
        },
        yAxis: {
          title: {
              text: 'Answers'
          }
        },
        series: [
          {
            name: 'Correct',
            data: right
          },
          {
            name: 'Incorrect',
            data: wrong
          }
        ]
      };
    }
    return config;
  }

  render() {
    let _this = this;
    let config = this.buildConfig();
    let selectDropdown = (
  		<DropdownButton id="input-dropdown-addon">
        {
          this.state.titles.map(function(title) {
            return (<MenuItem key={Math.random()} onClick={() => {_this.setState({"selectedVideo": title.name, "selectedId": title.id}); _this.checkAnswer.apply(_this,[title.id]);}}>{title.name}</MenuItem>);
          })
        }
  		</DropdownButton>
  	);
    return (
      <div>
        <NavField name = {this.state.user_display}/>
        <img className="logo" src={Logo} />
        <center>
          <h3>Performance Analytics</h3>
        </center>
        <div className="col-md-6 col-md-offset-3">
          <Input
            type="text"
            placeholder="Please select a video"
            value={this.state.selectedVideo}
            buttonAfter={selectDropdown}
          />
        </div>
        {this.state.questions && (
          <div className="col-md-6 col-md-offset-3">
            <ChartField config={config}/>
          </div>
        )}

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
export default connect(select)(Performance);
