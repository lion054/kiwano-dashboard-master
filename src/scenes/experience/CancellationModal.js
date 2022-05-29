import React, { Component } from 'react';
import { Form, Input, Modal, Switch } from 'antd';
import { isEmpty } from 'lodash/fp';

import { formItemLayout } from '../../global';

class CancellationModal extends Component {
  state = {
    record: {},
    errors: {}
  }

  componentWillReceiveProps(nextProps) {
    const record = {};
    if (nextProps.label !== this.props.label) {
      record.label = nextProps.label;
    }
    if (nextProps.checked !== this.props.checked) {
      record.checked = nextProps.checked;
    }
    if (!isEmpty(record)) {
      this.setState({ record });
    }
  }

  handleOk = () => {
    const errors = {};
    if (!this.state.record.label) {
      errors.label = 'The Label field is required.';
    }
    if (isEmpty(errors)) {
      this.props.onClose({
        label: this.state.record.label,
        checked: this.state.record.checked
      });
    } else {
      this.setState({ errors });
    }
  }

  render = () => (
    <Modal
      title="Cancellation Record"
      visible={this.props.visible}
      onOk={this.handleOk}
      onCancel={() => this.props.onClose()}
    >
      <Form>
        <Form.Item
          {...formItemLayout}
          label="Label"
          validateStatus={this.state.errors.label && 'error'}
          help={this.state.errors.label}
        >
          <Input
            value={this.state.record.label}
            onChange={(e) => this.setState({
              record: {
                ...this.state.record,
                label: e.target.value
              }
            })}
          />
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label="Checked"
        >
          <Switch checked={this.state.record.checked} onChange={value => this.setState({
            record: {
              ...this.state.record,
              checked: value
            }
          })} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CancellationModal;