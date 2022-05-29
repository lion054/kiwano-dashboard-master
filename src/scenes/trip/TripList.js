import React, { Component } from 'react';
import { Avatar, Input, Select, Table, message } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, FileOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { green, blue, red } from '@ant-design/colors';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { apiRequest } from '../../controllers/api/actions';
import { getImageURL, withMenuBar } from '../../global';

const { Search } = Input;
const { Option } = Select;

class TripList extends Component {
  state = {
    records: [],
    users: [],
    user_id: null,
    status: '',
    search: ''
  }

  componentDidMount() {
    this.props.apiRequest({
      url: '/users',
      method: 'GET',
      accessToken: this.props.apiToken,
      onSuccess: (users) => {
        this.setState({ users });
        this.fetchData();
      },
      onError: (error) => message.error(error)
    });
  }

  fetchData = () => this.props.apiRequest({
    url: '/trips',
    method: 'GET',
    data: {
      user_id: this.state.user_id,
      search: this.state.search
    },
    accessToken: this.props.apiToken,
    onSuccess: (records) => this.setState({ records }),
    onError: (error) => message.error(error)
  })

  render = () => (
    <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
      <div style={{ marginBottom: 8 }}>
        <span style={{ marginLeft: 16 }}>User:</span>
        <Select
          value={this.state.user_id}
          onChange={id => this.setState({ user_id: id }, this.fetchData)}
          style={{ marginLeft: 8, width: 250 }}
        >
          {[{
            id: null,
            name: 'All'
          }].concat(this.state.users.filter(user => user.role === 'Traveller')).map((item, index) => (
            <Option key={index} value={item.id}>{item.name}</Option>
          ))}
        </Select>

        <span style={{ marginLeft: 16 }}>Status:</span>
        <Select
          value={this.state.status}
          onChange={status => this.setState({ status }, this.fetchData)}
          style={{ marginLeft: 8, width: 250 }}
        >
          <Option key={0} value="">All</Option>
          <Option key={1} value="Booking">Booking</Option>
          <Option key={3} value="Payed">Payed</Option>
        </Select>

        <Search
          placeholder="Search..."
          onSearch={value => this.setState({ search: value }, this.fetchData)}
          style={{ marginLeft: 8, width: 200 }}
        />
      </div>
      <Table
        scroll={{ x: true }}
        rowKey="id"
        columns={[{
          title: 'User',
          dataIndex: 'user_id',
          render: this.renderUser
        },{
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
          title: 'Companions',
          dataIndex: 'companions',
          render: this.renderCompanions
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
          title: 'Action',
          dataIndex: 'id',
          render: (text) => (
            <Link to={`/trips/view/${text}`} style={{ marginRight: 8 }}>
              <FileOutlined style={{ fontSize: 20 }} />
            </Link>
          )
        }]}
        dataSource={this.state.records}
      />
    </div>
  )

  renderUser = (user_id) => {
    const user = this.state.users.find(user => user.id === user_id);
    return user ? (
      <Avatar
        src={getImageURL(user.avatar, true, 40, 40)}
        size="large"
      />
    ) : (
      <Avatar
        icon={<QuestionCircleOutlined />}
        size="large"
      />
    );
  }

  renderCompanions = (companions) => (
    <>
      {companions.map((companion, index) => {
        const user = this.state.users.find(user => user.id === companion.id);
        return user ? (
          <Avatar
            key={index}
            src={getImageURL(user.avatar, true, 40, 40)}
            size="large"
          />
        ) : (
          <Avatar
            key={index}
            icon={<QuestionCircleOutlined />}
            size="large"
          />
        );
      })}
    </>
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
)(TripList);