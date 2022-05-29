import React, { Component } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';

export default class FileUpload extends Component {
  state = {
    loading: false,
    base64: ''
  }

  handleChange = (e) => {
    this.setState({ loading: true });
    const reader = new FileReader();
    reader.onload = (event) => this.setState({
      loading: false,
      base64: event.target.result
    });
    const file = e.target.files[0];
    reader.readAsDataURL(file);
    if (this.props.onChange) {
      this.props.onChange(file);
    }
  }

  render = () => (
    <span className="ant-uploader" style={this.props.style}>
      <div className="ant-upload ant-upload-select ant-upload-select-picture-card">
        <span tabIndex={0} className="ant-upload" role="button" onClick={() => this.fileInput.click()}>
          <input
            ref={c => this.fileInput = c}
            type="file"
            accept="true"
            style={{ display: 'none' }}
            onChange={this.handleChange}
          />
          {!!this.state.base64 ? (
            <img src={this.state.base64} alt="avatar" style={{ width: '100%' }} />
          ) : !!this.props.url ? (
            <img src={this.props.url} alt="avatar" style={{ width: '100%' }} />
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
        </span>
      </div>
    </span>
  )
}
