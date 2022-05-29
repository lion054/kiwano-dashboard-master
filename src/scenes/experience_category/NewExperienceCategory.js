import React, { Component } from 'react';
import { Button, Col, Form, Input, Row, Select, Spin, message } from 'antd';
import { compose } from 'redux';
import { connect } from 'react-redux';

import PhotoUpload from '../../components/PhotoUpload';
import { formItemLayout, withMenuBar } from '../../global';
import { apiRequest } from '../../controllers/api/actions';

const { Item } = Form;
const { TextArea } = Input;
const { Option } = Select;

class NewExperienceCategory extends Component {
  state = {
    record: {
      image: '',
      title: '',
      description: '',
      badge_id: null
    },
    destinations: [],
    badges: [],
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
      url: '/experience_badges',
      method: 'GET',
      accessToken: this.props.apiToken,
      onSuccess: (badges) => this.setState({ badges }),
      onError: (error) => message.error(error)
    });
  }

  onImageUploaded = (response) => {
    const { record } = this.state;
    record.image = response.path;
    this.setState({ record });
  }

  onSave = () => {
    this.setState({ spinning: true });
    this.props.apiRequest({
      url: '/experience_categories',
      method: 'POST',
      data: this.state.record,
      accessToken: this.props.apiToken,
      onSuccess: (payload) => this.setState({ spinning: false }, () => {
        message.success('New category was created successfully.');
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
              <Item
                {...formItemLayout}
                label="Image"
                validateStatus={this.state.errors.image && 'error'}
                help={this.state.errors.image && this.state.errors.image.join("\n")}
              >
                <PhotoUpload
                  path={this.state.record.image}
                  onUploadDone={this.onImageUploaded}
                />
              </Item>
            </Col>
            <Col sm={24} lg={12}>
              <Item
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
              </Item>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={12}>
              <Item
                {...formItemLayout}
                label="Description"
                validateStatus={this.state.errors.description && 'error'}
                help={this.state.errors.description && this.state.errors.description.join("\n")}
              >
                <TextArea rows={4} value={this.state.record.description} onChange={e => {
                  const { record } = this.state;
                  record.description = e.target.value;
                  this.setState({ record });
                }} />
              </Item>
            </Col>
            <Col sm={24} lg={12}>
              <Item
                {...formItemLayout}
                label="Badge"
                validateStatus={this.state.errors.badge_id && 'error'}
                help={this.state.errors.badge_id && this.state.errors.badge_id.join("\n")}
              >
                <Select
                  value={this.state.record.badge_id}
                  onChange={id => {
                    const { record } = this.state;
                    record.badge_id = id;
                    this.setState({ record });
                  }}
                >
                  {this.state.badges.map((item, index) => (
                    <Option key={index} value={item.id}>{item.name}</Option>
                  ))}
                </Select>
              </Item>
            </Col>
          </Row>
          <Row style={{ textAlign: 'center' }}>
            <div>
              <Button type="primary" className="form-action-button" onClick={this.onSave}>Save</Button>
              <Button type="default" className="form-action-button" onClick={() => this.props.history.goBack()}>Back</Button>
            </div>
          </Row>
        </Form>
      </div>
    </Spin>
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
)(NewExperienceCategory);