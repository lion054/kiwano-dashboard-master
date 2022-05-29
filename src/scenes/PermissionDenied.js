import React, { Component } from 'react';
import { Result, Button } from 'antd';

export default class PermissionDenied extends Component {
  onBack = () => this.props.history.goBack()

  render = () => (
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      extra={(
        <Button type="primary" onClick={this.onBack}>Back</Button>
      )}
    />
  )
}