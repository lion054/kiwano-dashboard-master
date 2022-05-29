import React, { Component } from 'react';
import { Avatar, Button, Card, Col, Form, Input, List, Modal, Radio, Row, Select, Spin, message } from 'antd';
import ReactQuill from 'react-quill';
import { isEmpty } from 'lodash/fp';
import { compose } from 'redux';
import { connect } from 'react-redux';

import PhotoUpload from '../../components/PhotoUpload';
import { getImageURL, formItemLayout, withMenuBar } from '../../global';
import { apiRequest } from '../../controllers/api/actions';

const { Option } = Select;
const { Meta } = Card;

class EditArticle extends Component {
  state = {
    record: {
      destination_id: null,
      category_id: null,
      type: null,
      image: '',
      title: '',
      description: '',
      author_id: null
    },
    destinations: [],
    categories: [],
    author: {},
    authorModal: false,
    users: [],
    selectedUserId: null,
    description: '',
    errors: {},
    spinning: false
  }

  componentDidMount() {
    this.props.apiRequest({
      url: `/articles/${this.props.match.params.id}`,
      method: 'GET',
      accessToken: this.props.apiToken,
      onSuccess: (payload) => {
        this.setState({
          record: payload,
          selectedUserId: payload.author_id,
          description: this.encodeDescription(payload.description)
        }, this.fetchAuthor);
      },
      onError: (error) => message.error(error)
    });
    this.props.apiRequest({
      url: '/destinations',
      method: 'GET',
      accessToken: this.props.apiToken,
      onSuccess: (destinations) => this.setState({ destinations }),
      onError: (error) => message.error(error)
    });
    this.props.apiRequest({
      url: '/article_categories',
      method: 'GET',
      accessToken: this.props.apiToken,
      onSuccess: (categories) => this.setState({ categories }),
      onError: (error) => message.error(error)
    });
    this.props.apiRequest({
      url: '/users',
      method: 'GET',
      accessToken: this.props.apiToken,
      onSuccess: (users) => this.setState({ users }),
      onError: (error) => message.error(error)
    });
  }

  encodeDescription(text) {
    const result = text.replace(/src="(([A-z0-9-_+]+\/)*([A-z0-9-_]+.[A-z0-9-_]*))"/g, (match, capture) => {
      const regex = new RegExp(capture, 'g');
      const newUrl = getImageURL(capture);
      return match.replace(regex, newUrl);
    });
    if (result !== text) {
      return result;
    }
    return text.replace(/src='(([A-z0-9-_+]+\/)*([A-z0-9-_]+.[A-z0-9-_]*))'/g, (match, capture) => {
      const regex = new RegExp(capture, 'g');
      const newUrl = getImageURL(capture);
      return match.replace(regex, newUrl);
    });
  }

  decodeDescription(text) {
    const result = text.replace(/src="(.*?)"/g, (match, capture) => {
      const regex = new RegExp(`${process.env.REACT_APP_API_ENDPOINT}/media/`, 'g');
      const newUrl = capture.replace(regex, '');
      if (capture === newUrl) {
        return match;
      }
      return match.replace(new RegExp(capture, 'g'), atob(newUrl));
    });
    if (result !== text) {
      return result;
    }
    return text.replace(/src='(.*?)'/g, (match, capture) => {
      const regex = new RegExp(`${process.env.REACT_APP_API_ENDPOINT}/media/`, 'g');
      const newUrl = capture.replace(regex, '');
      if (capture === newUrl) {
        return match;
      }
      return match.replace(new RegExp(capture, 'g'), atob(newUrl));
    });
  }

  fetchAuthor = () => this.props.apiRequest({
    url: `/users/${this.state.record.author_id}`,
    method: 'GET',
    accessToken: this.props.apiToken,
    onSuccess: (author) => this.setState({ author }),
    onError: (error) => message.error(error)
  })

  handleEditorImage = () => {
    const input = document.createElement('input');

    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
      const file = input.files[0];
      const data = new FormData();
      data.append('image', file);
      data.append('uuid', true);

      // Save current cursor state
      const range = this.quill.getEditor().getSelection(true);

      this.props.apiRequest({
        url: '/media',
        method: 'POST',
        data,
        accessToken: this.props.apiToken,
        onSuccess: (payload) => {
          const url = getImageURL(payload.path);
          this.quill.getEditor().insertEmbed(range.index, 'image', url);
        },
        onError: (error) => message.error(error)
      });
    }
  }

  onImageUploaded = (response) => {
    const { record } = this.state;
    record.image = response.path;
    this.setState({ record });
  }

  onSave = () => {
    this.setState({ spinning: true });
    this.props.apiRequest({
      url: `/articles/${this.props.match.params.id}`,
      method: 'PUT',
      data: {
        ...this.state.record,
        description: this.decodeDescription(this.state.description)
      },
      accessToken: this.props.apiToken,
      onSuccess: (payload) => this.setState({ spinning: false }, () => {
        message.success('The article was updated successfully.');
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
                label="Image"
                validateStatus={this.state.errors.image && 'error'}
                help={this.state.errors.image && this.state.errors.image.join("\n")}
              >
                <PhotoUpload
                  path={this.state.record.image}
                  onUploadDone={this.onImageUploaded}
                />
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
                label="Category"
                validateStatus={this.state.errors.category_id && 'error'}
                help={this.state.errors.category_id && this.state.errors.category_id.join("\n")}
              >
                <Select
                  value={this.state.record.category_id}
                  onChange={id => {
                    const { record } = this.state;
                    record.category_id = id;
                    this.setState({ record });
                  }}
                >
                  {this.state.categories.map((item, index) => (
                    <Option key={index} value={item.id}>{item.title}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Type"
                validateStatus={this.state.errors.type && 'error'}
                help={this.state.errors.type && this.state.errors.type.join("\n")}
              >
                <Select
                  value={this.state.record.type}
                  onChange={value => {
                    const { record } = this.state;
                    record.type = value;
                    this.setState({ record });
                  }}
                >
                  <Option key="1" value="Inspiring">Inspiring</Option>
                  <Option key="2" value="Helpful">Helpful</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Title"
                validateStatus={this.state.errors.title && 'error'}
                help={this.state.errors.title && this.state.errors.title.join("\n")}
              >
                <Input value={this.state.record.title} onChange={e => {
                  const { record } = this.state;
                  record.title = e.target.value;
                  this.setState({ record });
                }} />
              </Form.Item>
            </Col>
            <Col sm={24} lg={12}>
              <Form.Item {...formItemLayout} label="Author">
                {!isEmpty(this.state.author) && this.renderAuthor()}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Form.Item
              {...formItemLayout}
              label="Description"
              validateStatus={this.state.errors.description && 'error'}
              help={this.state.errors.description && this.state.errors.description.join("\n")}
              className="rich-editor"
            >
              <ReactQuill
                ref={c => this.quill = c}
                theme="snow"
                modules={{
                  toolbar: {
                    container: [
                      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                      ['link', 'image'],
                      ['blockquote', 'code-block'],
  
                      [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
                      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
                      [{ 'direction': 'rtl' }],                         // text direction
  
                      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  
                      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                      [{ 'align': [] }],
  
                      ['clean']                                         // remove formatting button
                    ],
                    handlers: {
                      image: this.handleEditorImage
                    }
                  }
                }}
                value={this.state.description}
                onChange={(content, delta, source, editor) => {
                  this.setState({ description: content });
                }}
              />
            </Form.Item>
          </Row>
          <Row style={{ textAlign: 'center' }}>
            <div>
              <Button type="primary" className="form-action-button" onClick={this.onSave}>Save</Button>
              <Button type="default" className="form-action-button" onClick={() => this.props.history.goBack()}>Back</Button>
            </div>
          </Row>
        </Form>
        {this.renderModal()}
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

  renderModal = () => (
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
          dataSource={this.state.users.filter(user => user.role !== 'Traveller')}
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
}

const mapStateToProps = ({
  auth: { user, apiToken }
}) => ({
  user, apiToken
});

const mapDispatchToProps = (dispacth) => ({
  apiRequest: (params) => dispacth(apiRequest(params))
});

export default compose(
  withMenuBar,
  connect(mapStateToProps, mapDispatchToProps)
)(EditArticle);