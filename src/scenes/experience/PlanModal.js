import React, { Component } from 'react';
import { Form, Input, Modal, TimePicker } from 'antd';
import { isEmpty } from 'lodash/fp';
import moment from 'moment';

import { formItemLayout } from '../../global';

const { TextArea } = Input;

class PlanModal extends Component {
  state = {
    record: {},
    errors: {}
  }

  componentWillReceiveProps(nextProps) {
    const record = {};
    if (nextProps.time !== this.props.time) {
      record.time = nextProps.time;
    }
    if (nextProps.title !== this.props.title) {
      record.title = nextProps.title;
    }
    if (nextProps.description !== this.props.description) {
      record.description = nextProps.description;
    }
    if (!isEmpty(record)) {
      this.setState({ record });
    }
  }

  handleOk = () => {
    const errors = {};
    if (!this.state.record.title) {
      errors.title = 'The Title field is required.';
    }
    if (!this.state.record.description) {
      errors.description = 'The Description field is required.';
    }
    if (isEmpty(errors)) {
      this.props.onClose({
        time: this.state.record.time,
        title: this.state.record.title,
        description: this.state.record.description
      });
    } else {
      this.setState({ errors });
    }
  }

  render = () => (
    <Modal
      title="Plan Record"
      visible={this.props.visible}
      onOk={this.handleOk}
      onCancel={() => this.props.onClose()}
    >
      <Form>
        <Form.Item
          {...formItemLayout}
          label="Time"
          validateStatus={this.state.errors.time && 'error'}
          help={this.state.errors.time}
        >
          <TimePicker
            format="HH:mm"
            value={this.state.record.time && moment(this.state.record.time, 'HH:mm')}
            onChange={(time, text) => this.setState({
              record: {
                ...this.state.record,
                time: text
              }
            })}
          />
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label="Title"
          validateStatus={this.state.errors.title && 'error'}
          help={this.state.errors.title}
        >
          <Input
            value={this.state.record.title}
            onChange={(e) => this.setState({
              record: {
                ...this.state.record,
                title: e.target.value
              }
            })}
          />
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label="Description"
          validateStatus={this.state.errors.description && 'error'}
          help={this.state.errors.description}
        >
          <TextArea
            value={this.state.record.description}
            onChange={(e) => this.setState({
              record: {
                ...this.state.record,
                description: e.target.value
              }
            })}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default PlanModal;