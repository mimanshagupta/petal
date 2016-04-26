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

class Participation extends Component {
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

  getRelatedViews(id) {
    let _this = this;
    let selectedId = id;
    let Parse = this.props.data.Parse;
    let QuizObject = Parse.Object.extend("Quiz");
    let query = new Parse.Query(QuizObject);
    let QuestionObject = Parse.Object.extend("Questions");
    let query2 = new Parse.Query(QuestionObject);
    let quiz = {};
    let qids = [];
    let selectedQids= [];
    let selectedCategories= [];
    let relatedQids = {};
    //step 1 get all quiz objects and identify questions in selected video
    query.find({
      success: function(quizResults) {
        for(let i = 0; i < quizResults.length; i++) { //for1
          let qid = quizResults[i].get("questionId");
          let vid = quizResults[i].get("videoId");
          qids.push(qid);

          if(vid === selectedId) {
            selectedQids.push(qid);
          }
        } //end of for1

        //step 2 get all questions and find categories of selected video questions
        query2.find({
          success: function(questionResults) {
            for(let i = 0; i < questionResults.length; i++) {
              for(let j = 0; j < selectedQids.length; j++) {
                if(questionResults[i].id === selectedQids[j]) {
                  selectedCategories.push(questionResults[i].get("categoryName"));
                }
              }
            } //end of selectedCategories for loop
            selectedCategories = _.uniq(selectedCategories);
            //step 3 finding related qids
            for(let i = 0; i < selectedCategories.length; i++) {
              for(let j = 0; j < questionResults.length; j++) {
                if(questionResults[j].get("categoryName") === selectedCategories[i]) {
                  if(!relatedQids[selectedCategories[i]]) {
                    relatedQids[selectedCategories[i]] = [];
                  }
                  relatedQids[selectedCategories[i]].push(questionResults[j].id);
                }
              }
            }//end of related qids for
            //step 4 search for rows in Quiz with relatedqids and sum answered
            let watched = {};
            for(let i = 0; i < selectedCategories.length; i++) {
              for(let j = 0; j < relatedQids[selectedCategories[i]].length; j++) {
                for(let k = 0; k < quizResults.length; k++) {
                  if(quizResults[k].get("questionId") == relatedQids[selectedCategories[i]][j]) {
                    watched[selectedCategories[i]] = quizResults[k].get("answeredA") + quizResults[k].get("answeredB") + quizResults[k].get("answeredC");
                  }
                }
              }
            }
            _this.setState ({
              relatedWatched : watched,
              selectedCategories: selectedCategories
            });
          } //end of success2
        });

      }//end of success1
    });
  }

  buildRelatedConfig() {
    let _this = this;
    let config = {};
    if (this.state.relatedWatched && this.state.selectedCategories) {
      let categoryNames = this.state.selectedCategories.map(function(cat) {
        return cat;
      });
      let categoryViews = this.state.selectedCategories.map(function(cat) {
        return _this.state.relatedWatched[cat];
      });

      config = {
        chart: {
          type: 'bar'
        },
        title: {
          text: 'Student views for related videos'
        },
        xAxis: {
          categories: categoryNames
        },
        yAxis: {
          title: {
              text: 'Related Views'
          }
        },
        series: [
          {
            name: 'Students',
            data: categoryViews
          }
        ]
      };
    }
    return config;
  }

  buildConfig() {
    let video_names = this.state.titles.map(function(title) {
      return title.name;
    });
    let video_views = this.state.titles.map(function(title) {
      return title.views;
    });
    let config = {
      chart: {
        type: 'bar'
      },
      title: {
        text: 'Student views for videos'
      },
      xAxis: {
        categories: video_names
      },
      yAxis: {
        title: {
            text: 'Views'
        }
      },
      series: [
        {
          name: 'Students',
          data: video_views
        }
      ]
    };
    return config;
  }

  render() {
    let _this = this;
    let config = this.buildConfig();
    let related_config = this.buildRelatedConfig();
    let options = this.state.titles.map(function(title) {
      return {
        value: title.id,
        label: title.name
      };
    });
    let selectDropdown = (
  		<DropdownButton id="input-dropdown-addon">
        {
          this.state.titles.map(function(title) {
            return (<MenuItem key={Math.random()} onClick={() => {_this.setState({"selectedVideo": title.name, "selectedId": title.id}); _this.getRelatedViews.apply(_this, [title.id])}}>{title.name}</MenuItem>);
          })
        }
  		</DropdownButton>
  	);
    return (
      <div>
        <NavField name = {this.state.user_display}/>
        <img className="logo" src={Logo} />
        <center>
          <h3>Participation Analytics</h3>
        </center>
        <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
          <Tab eventKey={1} title="Views per video">
            <div className="col-md-6 col-md-offset-3">
              <ChartField config={config}/>
            </div>
          </Tab>
          <Tab eventKey={2} title="Related video views">
            <br />
            <br />
            <div className="col-md-6 col-md-offset-3">
              <Input
                type="text"
                placeholder="Please select a video"
                value={this.state.selectedVideo}
                buttonAfter={selectDropdown}
              />
            </div>
            {this.state.selectedVideo && this.state.relatedWatched && this.state.selectedCategories && (
              <div className="col-md-6 col-md-offset-3">
                <ChartField config={related_config}/>
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
export default connect(select)(Participation);
