import React, { Component } from 'react';
import { Button, message } from 'antd';
import { PrinterOutlined } from '@ant-design/icons'
import ReactToPrint from 'react-to-print';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { apiRequest } from '../../controllers/api/actions';
import { withMenuBar } from '../../global';
import PrintTrip from './PrintTrip';

class ViewTrip extends Component {
  state = {
    title: '',
    user_name: '',
    experiences: [],
    started_at: '',
    ended_at: '',
    companions: [],
    ambassadors: [],
    challenge: null,
    price: null,
    amount: null,
    status: ''
  }

  componentDidMount() {
    this.props.apiRequest({
      url: `/trips/${this.props.match.params.id}`,
      method: 'GET',
      accessToken: this.props.apiToken,
      onSuccess: (record) => {
        this.setState({ ...record });
      },
      onError: (error) => message.error(error)
    });
  }

  render = () => (
    <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
      <ReactToPrint
        trigger={() => (
          <Button type="primary" icon={<PrinterOutlined />} onClick={this.onPrint}>Print</Button>
        )}
        content={() => this.printEl}
      />
      <PrintTrip
        id={this.props.match.params.id}
        title={this.state.title}
        user_name={this.state.user_name}
        experiences={this.state.experiences.map((item, index) => ({
          id: index,
          title: item.data.title,
          cost: item.data.cost
        }))}
        challenge={this.state.challenge}
        price={this.state.price}
        quantity={this.state.companions.length + 1}
        amount={this.state.amount}
        ref={el => this.printEl = el}
      />
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
)(ViewTrip);