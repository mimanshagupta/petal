/*
 * HomePage
 * This is the first thing users see of our App
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import NavField from '../fields/NavField.react';
import Logo from '../../../img/iconmodified.png';
import ChartField from '../fields/ChartField.react';
import {Tabs, Tab, Input, DropdownButton, MenuItem, Label} from 'react-bootstrap';
import Dropdown from 'react-dropdown';
import _ from 'lodash';

class Attentiveness extends Component {
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
        }, function() {
          _this.getMetric.apply(_this);
          _this.checkCorrectAll.apply(_this);
        });
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });
  }

  checkAnswer(id) {
    let _this = this;
    let Parse = this.props.data.Parse;
    let QuizObject = Parse.Object.extend("Attentiveness");
    let query = new Parse.Query(QuizObject);
    query.equalTo("videoId", id);
    query.find({
      success: function(results) {
        let master = {};
        let times = [];
        for (let i = 0; i < results.length; i++) {
          let time = results[i].get("timestamp");
          times.push(time);
          if (!master[time]) {
            master[time] = {};
          }
          let cause = results[i].get("cause");
          if (!master[time][cause]) {
            master[time][cause] = 0;
          }
          master[time][cause] = master[time][cause] + 1;
        }
        times = _.uniq(times);
        times = _.sortBy(times, function(o) { return o; });
        _this.setState({
          master: master,
          times: times
        });
      }
    })
  }

  checkCorrectAll() {
    let _this = this;
    let correctness = {};
    let Parse = this.props.data.Parse;
    let QuizObject = Parse.Object.extend("Quiz");
    let query = new Parse.Query(QuizObject);
    //query.equalTo("videoId", id);
    query.find({
      success: function(results) {
          results.forEach(function (result, index) {
            let vid = result.get("videoId");
            if (!correctness[vid]) {
              correctness[vid] = {
                questions: [],
                correct: 0,
                wrong: 0
              };
            }
            correctness[vid].questions.push({
              answeredA: result.get("answeredA"),
              answeredB: result.get("answeredB"),
              answeredC: result.get("answeredC"),
              id: result.get("questionId")
            });
            let queries = [];
            for (let i = 0; i < correctness[vid].questions.length; i++) {
              let fewWins = new Parse.Query("Questions");
              fewWins.equalTo("objectId", correctness[vid].questions[i].id);
              queries.push(fewWins);
            }

            let mainQuery = Parse.Query.or.apply(Parse.Query, queries);
            mainQuery.findSync =
            mainQuery.find({
              success: function(rows) {
                for (let j = 0; j < rows.length; j++) {
                  let answer = rows[j].get("Answer");
                  let optA = rows[j].get("Opt1");
                  let optB = rows[j].get("Opt2");
                  let optC = rows[j].get("Opt3");
                  let k = 0;
                  for (k; k < correctness[vid].questions.length; k++) {
                    if (correctness[vid].questions[k].id === rows[j].id) {
                      break;
                    }
                  }
                  correctness[vid].questions[k].q = rows[j].get("Question");
                  if (answer === optA) {
                    correctness[vid].correct += correctness[vid].questions[k].answeredA;
                    correctness[vid].wrong += correctness[vid].questions[k].answeredB + correctness[vid].questions[k].answeredC;
                  }
                  if (answer === optB) {
                    correctness[vid].correct += correctness[vid].questions[k].answeredB;
                    correctness[vid].wrong += correctness[vid].questions[k].answeredA + correctness[vid].questions[k].answeredC;
                  }
                  if (answer === optC) {
                    correctness[vid].correct += correctness[vid].questions[k].answeredC;
                    correctness[vid].wrong += correctness[vid].questions[k].answeredB + correctness[vid].questions[k].answeredA;
                  }
                }
                if(index === results.length-1) {
                  _this.setState({
                    correctness: correctness
                  });
                }
              }
            });
          });
        }
      });
  }

  buildConfig() {
    let config = {};
    let _this = this;
    if (this.state.master) {
      let zoning = this.state.times.map(function(t) {
        return _this.state.master[t]['zoning'] || 0;
      });
      let sleepy = this.state.times.map(function(t) {
        return _this.state.master[t]['sleepy'] || 0;
      });
      let distracted = this.state.times.map(function(t) {
        return _this.state.master[t]['distracted'] || 0;
      });
      config = {
        chart: {
          type: 'line'
        },
        title: {
          text: 'Attentiveness per video'
        },
        xAxis: {
          categories: this.state.times
        },
        yAxis: {
          title: {
              text: 'Students'
          }
        },
        series: [
          {
            name: 'Zoning out',
            data: zoning
          },
          {
            name: 'Sleepy',
            data: sleepy
          },
          {
            name: 'Distracted',
            data: distracted
          }
        ]
      };
    }
    return config;
  }

  buildAnotherConfig() {
    let config = {};
    let _this = this;
    if (this.state.correctness) {
      let v_names = this.state.titles.map(function (q) {
        return q.name;
      });
      let right = this.state.titles.map(function (q) {
        return Math.round((_this.state.correctness[q.id].correct / (_this.state.correctness[q.id].correct + _this.state.correctness[q.id].wrong))*100);
      });
      let wrong = this.state.titles.map(function (q) {
        return Math.round((_this.state.correctness[q.id].wrong / (_this.state.correctness[q.id].correct + _this.state.correctness[q.id].wrong))*100);
      });
      let scores = this.state.titles.map(function(title) {
        return (Math.round(title.score * 100))/100 || 0;
      });
      config = {
        chart: {
          type: 'bar'
        },
        title: {
          text: 'Attentiveness v Correctness for videos'
        },
        xAxis: {
          categories: v_names
        },
        yAxis: {
          title: {
              text: 'Scores'
          }
        },
        series: [
          {
            name: 'Attentiveness',
            data: scores
          },
          {
            name: 'Correct (%)',
            data: right
          },
          {
            name: 'Incorrect (%)',
            data: wrong
          }
        ]
      };
    }
    return config;
  }

  getMetric() {
    let _this = this;
    let Parse = this.props.data.Parse;
    let QuizObject = Parse.Object.extend("Attentiveness");
    let query = new Parse.Query(QuizObject);
    let entries = {};
    let videos = [];
    query.find({
      success: function(results) {
        for(let i = 0; i < results.length; i++) {
          let video = results[i].get("videoId");
          videos.push(video);
          if (!entries[video]) {
            entries[video] = {};
          }
          let cause = results[i].get("cause");
          if (!entries[video][cause]) {
            entries[video][cause] = 0;
          }
          entries[video][cause] = entries[video][cause] + 1;
        }
        videos = _.uniq(videos);
        console.log(videos);
        for(let i = 0; i < videos.length; i++) {
          console.log(entries[videos[i]]);
          let sleepy_count = entries[videos[i]].sleepy;
          let distracted_count = entries[videos[i]].distracted;
          let zoning_count = entries[videos[i]].zoning;
          let new_titles = _this.state.titles;
          for(let j = 0; j < new_titles.length; j++) {
            if(new_titles[j].id === videos[i]) {
              let watched = new_titles[j].views;
              let score = 100 - ((sleepy_count * 15 + distracted_count * 10 + zoning_count * 10)/watched);
              new_titles[j].score = score || 0;
            }
          }
          _this.setState ({
            titles: new_titles
          });
        }
      } //end of success
    });
  }

  render() {
    let _this = this;
    let config = this.buildConfig();
    let another = this.buildAnotherConfig();
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
          <h3>Attentiveness Analytics</h3>
        </center>

        <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
          <Tab eventKey={1} title="Attentiveness per video">
          <div className="col-md-6 col-md-offset-3">
            <br />
            <br />
            <Input
              type="text"
              placeholder="Please select a video"
              value={this.state.selectedVideo}
              buttonAfter={selectDropdown}
            />
          </div>
          {this.state.master && (
            <div className="col-md-6 col-md-offset-3">
              <ChartField config={config}/>
            </div>
          )}
          </Tab>
          <Tab eventKey={2} title="Attentiveness Metric">
            <center>
            <br /> <br />
              {
                this.state.titles.map(function(title){
                  return (<h3 key={Math.random()}> {title.name} <Label bsStyle={title.score > 95 ? "success" : (title.score > 90 ? "warning" : "danger")}>{(Math.round(title.score * 100))/100 || 0}</Label></h3>);
                })
              }
            </center>
          </Tab>
          <Tab eventKey={3} title="Attentiveness & Correctness">
            <div className="col-md-6 col-md-offset-3">
              <br />
              <br />
            </div>
            {this.state.correctness && (
              <div className="col-md-6 col-md-offset-3">
                <ChartField config={another}/>
              </div>
            )}
          </Tab>
        </Tabs>

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
export default connect(select)(Attentiveness);
