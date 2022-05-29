import React, { Component } from 'react';
import { Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getImageURL } from '../global';

class PhotoUpload extends Component {
  state = {
    loading: false
  }

  beforeUpload = (file) => {
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      message.error('You can only upload JPG/PNG file!');
      return false;
    }
    if (file.size / 1024 / 1024 >= 2) {
      message.error('Image must smaller than 2MB!');
      return false;
    }
    return true;
  }

  handleChange = ({ file, fileList }) => {
    if (file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (file.status === 'done') {
      this.setState({ loading: false });
      if (this.props.onUploadDone) {
        this.props.onUploadDone(file.response);
      }
    } else if (file.status === 'error') {
      this.setState({ loading: false });
    }
  }

  render = () => (
    <Upload
      name="image"
      action={`${process.env.REACT_APP_API_ENDPOINT}/media`}
      data={{
        uuid: true
      }}
      headers={{
        authorization: `Bearer ${this.props.apiToken}`
      }}
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      beforeUpload={this.beforeUpload}
      onChange={this.handleChange}
    >
      {!!this.props.path ? (
        <img src={getImageURL(this.props.path, true, 86, 86)} alt="avatar" style={{ width: '100%' }} />
      ) : (
        <div>
          {this.state.loading ? (
            <LoadingOutlined />
          ) : (
            <PlusOutlined />
          )}
          <div className="ant-upload-text">Upload</div>
        </div>
      )}
    </Upload>
  )
}

PhotoUpload.propTypes = {
  path: PropTypes.string.isRequired,
  onUploadDone: PropTypes.func.isRequired
}

const mapStateToProps = ({
  auth: { apiToken }
}) => ({
  apiToken
});

export default connect(mapStateToProps)(PhotoUpload);