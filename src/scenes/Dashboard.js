import React, { Component } from 'react';
import { Avatar, Col, Input, Row, Table, message } from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileOutlined,
  MoneyCollectOutlined,
  QuestionCircleOutlined,
  ShoppingCartOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { green, blue, red } from '@ant-design/colors';
import { Line, LineChart } from 'recharts';
import moment from 'moment';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { apiRequest } from '../controllers/api/actions';
import { withMenuBar } from '../global';

const { Search } = Input;

const columns = [{
  title: 'Title',
  dataIndex: 'title'
},{
  title: 'Start Date',
  dataIndex: 'started_at',
  align: 'center',
  render: (value) => moment(value).format('YYYY-MM-DD')
},{
  title: 'End Date',
  dataIndex: 'ended_at',
  align: 'center',
  render: (value) => moment(value).format('YYYY-MM-DD')
},{
  title: 'Challenge',
  dataIndex: 'challenge',
  align: 'right',
  render: (value) => `$${value}`
},{
  title: 'Price',
  dataIndex: 'price',
  align: 'right',
  render: (value) => `$${value}`
},{
  title: 'Amount',
  dataIndex: 'amount',
  align: 'right',
  render: (value) => `$${value}`
},{
  title: 'Status',
  dataIndex: 'status',
  align: 'center',
  render: (text) => (
    <Avatar
      icon={text === 'Payed' ? <CheckCircleOutlined /> : text === 'Booking' ? <ClockCircleOutlined /> : <QuestionCircleOutlined />}
      style={{
        backgroundColor: 'transparent',
        color: text === 'Payed' ? green.primary : text === 'Booking' ? blue.primary : red.primary,
        fontSize: 24
      }}
    />
  )
},{
  title: 'Actions',
  dataIndex: 'id',
  render: (text) => (
    <Link to={`/trips/view/${text}`} style={{ marginRight: 8 }}>
      <FileOutlined style={{ fontSize: 20 }} />
    </Link>
  )
}];

class Dashboard extends Component {
  state = {
    users: [],
    bookings: [],
    pendings: [],
    earnings: [],
    records: [],
    search: ''
  }

  componentDidMount() {
    this.props.apiRequest({
      url: '/stats/users',
      method: 'GET',
      accessToken: this.props.apiToken,
      onSuccess: (users) => this.setState({ users }),
      onError: (error) => message.error(error)
    });
    this.props.apiRequest({
      url: '/stats/bookings',
      method: 'GET',
      accessToken: this.props.apiToken,
      onSuccess: (bookings) => this.setState({ bookings }),
      onError: (error) => message.error(error)
    });
    this.props.apiRequest({
      url: '/stats/pendings',
      method: 'GET',
      accessToken: this.props.apiToken,
      onSuccess: (pendings) => this.setState({ pendings }),
      onError: (error) => message.error(error)
    });
    this.props.apiRequest({
      url: '/stats/earnings',
      method: 'GET',
      accessToken: this.props.apiToken,
      onSuccess: (earnings) => this.setState({ earnings }),
      onError: (error) => message.error(error)
    });
    this.onSearch('');
  }

  onSearch = (keyword) => this.props.apiRequest({
    url: '/trips',
    method: 'GET',
    data: {
      status: 'Booking',
      search: this.state.search
    },
    accessToken: this.props.apiToken,
    onSuccess: (records) => this.setState({ records }),
    onError: (error) => message.error(error)
  })

  render = () => (
    <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
      <Row>
        <Col sm={12} lg={6}>
          <div className="stats-chart users-chart">
            {this.renderCaption(<TeamOutlined style={{ color: 'white', fontSize: 48 }} />, 'Users', this.state.users.length === 0 ? 0 : this.state.users[this.state.users.length - 1].value)}
            <LineChart width={200} height={100} data={this.state.users}>
              <Line type="monotone" dataKey="value" stroke="rgba(255, 255, 255, 0.5)" strokeWidth={3} />
            </LineChart>
          </div>
        </Col>
        <Col sm={12} lg={6}>
          <div className="stats-chart bookings-chart">
            {this.renderCaption(<ShoppingCartOutlined style={{ color: 'white', fontSize: 48 }} />, 'Bookings', this.state.bookings.length === 0 ? 0 : this.state.bookings[this.state.bookings.length - 1].value)}
            <LineChart width={200} height={100} data={this.state.bookings}>
              <Line type="monotone" dataKey="value" stroke="rgba(255, 255, 255, 0.5)" strokeWidth={3} />
            </LineChart>
          </div>
        </Col>
        <Col sm={12} lg={6}>
          <div className="stats-chart pendings-chart">
            {this.renderCaption(<CalendarOutlined style={{ color: 'white', fontSize: 48 }} />, 'Pendings', this.state.pendings.length === 0 ? 0 : this.state.pendings[this.state.pendings.length - 1].value)}
            <LineChart width={200} height={100} data={this.state.pendings}>
              <Line type="monotone" dataKey="value" stroke="rgba(255, 255, 255, 0.5)" strokeWidth={3} />
            </LineChart>
          </div>
        </Col>
        <Col sm={12} lg={6}>
          <div className="stats-chart earnings-chart">
            {this.renderCaption(<MoneyCollectOutlined style={{ color: 'white', fontSize: 48 }} />, 'Earnings', this.state.earnings.length === 0 ? 0 : this.state.earnings[this.state.earnings.length - 1].value)}
            <LineChart width={200} height={100} data={this.state.earnings}>
              <Line type="monotone" dataKey="value" stroke="rgba(255, 255, 255, 0.5)" strokeWidth={3} />
            </LineChart>
          </div>
        </Col>
      </Row>
      <div style={{ marginTop: 20, marginBottom: 20, fontSize: 32 }}>Bookings</div>
      <Search
        placeholder="Search..."
        onSearch={value => this.setState({ search: value }, this.onSearch)}
        style={{ marginBottom: 20, width: 200 }}
      />
      <Table
        scroll={{ x: true }}
        rowKey="id"
        columns={columns}
        dataSource={this.state.records}
      />
    </div>
  )

  renderCaption = (icon, title, value) => (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      {icon}
      <div style={{ marginLeft: 20 }}>
        <div style={{ color: 'white', fontSize: 32 }}>{value}</div>
        <div style={{ color: 'white', fontSize: 20 }}>{title}</div>
      </div>
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
)(Dashboard);