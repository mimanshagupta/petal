/*
 * UploadPage
 * Upload vidoes to stream on app
 */
import React, { Component } from 'react';
import { Input, Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import NavField from '../fields/NavField.react';
import Logo from '../../../img/iconmodified.png';

class UploadPage extends Component {
  constructor(props, context) {
    super(props, context);
    let _this = this;
    _this.uploadedBy = '';
    this.state = {
      user_display: '',
      vid_link: '',
      vid_title: '',
      titles: []
    };
    props.data.Parse.User.current().fetch().then(function (user) {
      let u = user.get('username');
      _this.uploadedBy = u;
      _this.setState({
        user_display: u
      });
      _this.getAllVideos.apply(_this, null);
    });
  }

  onLinkChange() {
    this.setState({
      vid_link:  this.refs.vidlink.getValue()
    });
  }

  onTitleChange() {
    this.setState({
      vid_title:  this.refs.vidtitle.getValue()
    });
  }

  onClicked() {
      let Parse = this.props.data.Parse;
      let _this = this;
      let VideoObject = Parse.Object.extend("Videos");
      let videoObject = new VideoObject();
      let videolink = _this.state.vid_link;
      let videotitle = _this.state.vid_title;
      let uploadedby = _this.state.user_display;
      videolink = this.filterLink(videolink);
      if (!videolink.endsWith('.mp4')) {
        alert('Please enter a valid url for the video file. Only mp4 format supported.')
      }
      else {
        videoObject.save({
          vid_link: videolink,
          vid_title: videotitle,
          username: uploadedby,
          watched: 0
        });
      }
  }

  filterLink(link) {
    link = link.replace('www', 'dl').replace('dropbox', 'dropboxusercontent');
    link = link.replace(/(\?).*/g,'');
    return link;
  }

  getAllVideos() {
    let _this = this;
    let Parse = this.props.data.Parse;
    let uploadedby = this.uploadedBy;
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

  render() {
    return (
            <div>
                <NavField name = {this.state.user_display}/>
                <img className="logo" src={Logo} />
                <center><h1>Upload Videos</h1>
                <Input type="text" ref = "vidlink" onChange={this.onLinkChange.bind(this)} label="Video Link" placeholder="Enter dropbox link" className="vidlink"/>
                <Input type="text" ref = "vidtitle" onChange={this.onTitleChange.bind(this)} label="Title" placeholder="Enter title" className="vidtitle"/></center>
                <center><Button bsStyle="info" onClick = {this.onClicked.bind(this)}>Upload</Button>
                <br/><br/>
                <div className="categoryNames">
                  <ListGroup>
                    {this.state.titles.map(function (title, index) {
                        return <ListGroupItem  key={index}><a href={'/play?video=' + title.vidLink + '&name=' + title.name + '&id=' + title.id}><p>{title.name}</p></a></ListGroupItem> ;
                    })}
                  </ListGroup>
                </div>
                </center>
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
export default connect(select)(UploadPage);
