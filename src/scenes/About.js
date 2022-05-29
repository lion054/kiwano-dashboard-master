import React, { Component } from 'react';
import { Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Player } from 'video-react';
import '../../node_modules/video-react/dist/video-react.css';
import * as firebase from 'firebase';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { apiRequest } from '../controllers/api/actions';
import { withMenuBar } from '../global';

class About extends Component {
  state = {
    videoURL: ''
  }

  componentDidMount() {
    this.props.apiRequest({
      url: '/about',
      method: 'GET',
      accessToken: this.props.apiToken,
      onSuccess: (payload) => this.setState({ videoURL: payload.video }),
      onError: (error) => message.error(error)
    });
  }

  beforeUpload = (file) => {
    if (!file.type.startsWith('video/')) {
      message.error('You can upload only video file!');
      return false;
    }
    return true;
  }

  customRequest = ({ onProgress, onError, onSuccess, file }) => {
    const storageRef = firebase.storage().ref();
    firebase.auth().signInWithEmailAndPassword('ambassador@kiwano.com', '1234567890').then(() => {
      const oldFile = storageRef.child('about.mp4');
      return oldFile.delete().catch(e => new Promise((resolve, reject) => {
        if (e.code === 'storage/object-not-found') {
          resolve('done');
        } else {
          reject(e);
        }
      }));
    }).then(() => {
      const newFile = storageRef.child('about.mp4');
      const uploadTask = newFile.put(file, {
        contentType: 'video/mp4'
      });
      uploadTask.on('state_changed', (snapshot) => {
        const percent = snapshot.bytesTransferred / snapshot.totalBytes * 100;
        console.log('Upload is ' + percent + '% done');
        onProgress({ percent });
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED:
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING:
            console.log('Upload is running');
            break;
          default:
            break;
        }
      }, (error) => {
        // Handle unsuccessful uploads
      }, () => {
        uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
          this.props.apiRequest({
            url: '/about',
            method: 'POST',
            data: {
              video: downloadURL
            },
            accessToken: this.props.apiToken,
            onSuccess: () => this.setState({ videoURL: downloadURL }),
            onError: (error) => message.error(error)
          });
        });
      });
      return uploadTask;
    }).then((video) => {
      onSuccess(video);
    }).catch(e => {
      onError(e);
    });
  }

  render = () => (
    <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
      <Upload
        name="video"
        beforeUpload={this.beforeUpload}
        customRequest={this.customRequest}
      >
        <Button type="primary" icon={<UploadOutlined />}>Upload</Button>
      </Upload>
      {!!this.state.videoURL && (
        <div style={{ marginTop: 8 }}>
          <Player
            playsInline
            src={this.state.videoURL}
          />
        </div>
      )}
    </div>
  )
}

const mapStateToProps = ({ auth }) => ({
  apiToken: auth.apiToken
});

const mapDispatchToProps = (dispacth) => ({
  apiRequest: (params) => dispacth(apiRequest(params))
});

export default compose(
  withMenuBar,
  connect(mapStateToProps, mapDispatchToProps)
)(About);