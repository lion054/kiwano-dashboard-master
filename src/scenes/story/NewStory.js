import React, { Component } from 'react';
import { Avatar, Button, Card, Col, Form, Input, List, Modal, Radio, Row, Select, Spin, Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { red } from '@ant-design/colors';
import { isEmpty } from 'lodash/fp';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { getImageURL, formItemLayout, withMenuBar } from '../../global';
import { apiRequest } from '../../controllers/api/actions';

const { Option } = Select;
const { Meta } = Card;

class NewStory extends Component {
  state = {
    record: {
      destination_id: '',
      caption: '',
      author_id: '',
      items: []
    },
    destinations: [],
    author: {},
    authorModal: false,
    users: [],
    selectedUserId: '',
    fileList: [],
    previewImage: '',
    errors: {},
    spinning: false
  }

  componentDidMount() {
    this.props.apiRequest({
      url: '/destinations',
      method: 'GET',
      accessToken: this.props.apiToken,
      onSuccess: (destinations) => this.setState({ destinations }),
      onError: (error) => message.error(error)
    });
    this.props.apiRequest({
      url: '/users',
      method: 'GET',
      accessToken: this.props.apiToken,
      onSuccess: (payload) => this.setState({
        users: payload.filter(user => user.role !== 'Traveller')
      }),
      onError: (error) => message.error(error)
    });
  }

  fetchAuthor = () => this.props.apiRequest({
    url: `/users/${this.state.record.author_id}`,
    method: 'GET',
    accessToken: this.props.apiToken,
    onSuccess: (author) => this.setState({ author }),
    onError: (error) => message.error(error)
  })

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

  onChangeUploadStatus = ({ file, fileList }) => {
    const { status, name, response } = file;
    if (status !== 'uploading') {
      console.log(file, fileList);
    }
    if (status === 'done') {
      message.success(`${name} file uploaded successfully.`);
      const { record } = this.state;
      record.items.push({ image: response.path });
      fileList[fileList.length - 1].url = getImageURL(response.path, true, 86, 86);
      fileList[fileList.length - 1].previewUrl = getImageURL(response.path, true, 86, 86);
      this.setState({ record, fileList });
    } else {
      if (status === 'error') {
        message.error(`${name} file upload failed.`);
      }
      this.setState({ fileList });
    }
  }

  onRemove = (file) => {
    const index = this.state.fileList.findIndex(item => item.uid === file.uid);
    if (index !== -1) {
      const { record, fileList } = this.state;
      record.items.splice(index, 1);
      fileList.splice(index, 1);
      this.setState({ record, fileList });
    }
  }

  onSave = () => {
    this.setState({ spinning: true });
    this.props.apiRequest({
      url: '/stories',
      method: 'POST',
      data: this.state.record,
      accessToken: this.props.apiToken,
      onSuccess: (payload) => this.setState({ spinning: false }, () => {
        message.success('New destination was created successfully.');
        this.props.history.goBack();
      }),
      onError: (error) => {
        if (typeof error === 'string') {
          this.setState({ spinning: false });
          message.error(error);
        } else {
          this.setState({
            spinning: false,
            errors: error
          });
        }
      }
    });
  }

  render = () => (
    <Spin spinning={this.state.spinning}>
      <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
        <Form>
          <Row>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Caption"
                validateStatus={this.state.errors.caption && 'error'}
                help={this.state.errors.caption && this.state.errors.caption.join("\n")}
              >
                <Input value={this.state.record.caption} onChange={e => {
                  const { record } = this.state;
                  record.caption = e.target.value;
                  this.setState({ record });
                }} />
              </Form.Item>
            </Col>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Destination"
                validateStatus={this.state.errors.destination_id && 'error'}
                help={this.state.errors.destination_id && this.state.errors.destination_id.join("\n")}
              >
                <Select
                  value={this.state.record.destination_id}
                  onChange={id => {
                    const { record } = this.state;
                    record.destination_id = id;
                    this.setState({ record });
                  }}
                >
                  {this.state.destinations.map((item, index) => (
                    <Option key={index} value={item.id}>{item.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Author"
                validateStatus={this.state.errors.author_id && 'error'}
                help={this.state.errors.author_id && this.state.errors.author_id.join("\n")}
              >
                {isEmpty(this.state.author) ? (
                  <Button type="primary" icon={<UserOutlined />} onClick={() => this.setState({ authorModal: true })}>Choose</Button>
                ) : this.renderAuthor()}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <div className="ant-form-item" style={{ marginBottom: 8 }}>
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
                showUploadList={this.state.fileList.length > 1 ? {
                  showDownloadIcon: false
                } : {
                  showDownloadIcon: false,
                  showRemoveIcon: false
                }}
                fileList={this.state.fileList}
                beforeUpload={this.beforeUpload}
                onChange={this.onChangeUploadStatus}
                onPreview={file => this.setState({ previewImage: file.previewUrl || file.url })}
                onRemove={this.onRemove}
              >
                <div>
                  {this.state.loading ? (
                    <LoadingOutlined />
                  ) : (
                    <PlusOutlined />
                  )}
                  <div className="ant-upload-text">Upload</div>
                </div>
              </Upload>
            </div>
            {this.state.errors.items && (
              <div style={{ color: red.primary }}>{this.state.errors.items.join("\n")}</div>
            )}
          </Row>
          <Row style={{ textAlign: 'center' }}>
            <div>
              <Button type="primary" className="form-action-button" onClick={this.onSave}>Save</Button>
              <Button type="default" className="form-action-button" onClick={() => this.props.history.goBack()}>Back</Button>
            </div>
          </Row>
        </Form>
        {this.renderAuthorModal()}
        {this.renderPreviewModal()}
      </div>
    </Spin>
  )

  renderAuthor = () => (
    <Card hoverable={true} onClick={() => this.setState({ authorModal: true })}>
      <Meta
        avatar={(
          <Avatar
            src={getImageURL(this.state.author.avatar, true, 40, 40)}
            size="large"
          />
        )}
        title={this.state.author.name}
        description={this.state.author.about}
      />
    </Card>
  )

  renderAuthorModal = () => (
    <Modal
      title="Choose Author"
      visible={this.state.authorModal}
      onOk={() => this.setState({
        record: {
          ...this.state.record,
          author_id: this.state.selectedUserId
        },
        authorModal: false
      }, this.fetchAuthor)}
      onCancel={() => this.setState({ authorModal: false })}
    >
      <Radio.Group
        value={this.state.selectedUserId}
        onChange={e => this.setState({ selectedUserId: e.target.value })}
      >
        <List
          itemLayout="horizontal"
          dataSource={this.state.users}
          renderItem={item => (
            <List.Item style={{ cursor: 'pointer' }} onClick={() => this.setState({ selectedUserId: item.id })}>
              <List.Item.Meta
                avatar={(
                  <Avatar
                    src={getImageURL(item.avatar, true, 40, 40)}
                    size="large"
                  />
                )}
                title={item.name}
                description={item.about}
              />
              <Radio value={item.id} />
            </List.Item>
          )}
          style={{ height: '60vh', overflowY: 'scroll' }}
        />
      </Radio.Group>
    </Modal>
  )

  renderPreviewModal = () => (
    <Modal
      visible={!!this.state.previewImage}
      footer={null}
      onCancel={() => this.setState({ previewImage: '' })}
    >
      <img alt="Uploaded file" src={this.state.previewImage} style={{ width: '100%' }} />
    </Modal>
  )
}

const mapStateToProps = ({
  auth: { apiToken }
}) => ({
  apiToken
});

const mapDispatchToProps = (dispacth) => ({
  apiRequest: (params) => dispacth(apiRequest(params))
});

export default compose(
  withMenuBar,
  connect(mapStateToProps, mapDispatchToProps)
)(NewStory);