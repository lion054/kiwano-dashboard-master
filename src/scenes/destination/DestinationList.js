import React, { Component } from 'react';
import { Avatar, Button, Input, Popconfirm, Select, Table, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, UndoOutlined } from '@ant-design/icons';
import { green, grey, red } from '@ant-design/colors';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { apiRequest } from '../../controllers/api/actions';
import { getImageURL, withMenuBar } from '../../global';

const { Search } = Input;
const { Option } = Select;

const columns = [{
  title: 'Badge',
  dataIndex: 'badge',
  render: (text) => !!text && (
    <Avatar
      src={getImageURL(text, true, 40, 40)}
      size="large"
      style={{ backgroundColor: grey[6] }}
    />
  )
},{
  title: 'Name',
  dataIndex: 'name'
},{
  title: 'Title',
  dataIndex: 'title'
},{
  title: 'Region',
  dataIndex: 'region'
},{
  title: 'Created At',
  dataIndex: 'created_at',
  render: (value) => moment(value).format('YYYY-MM-DD')
}];

const scopes = [{
  value: '',
  label: 'Normal'
},{
  value: 'with-trashed',
  label: 'With Trashed'
},{
  value: 'only-trashed',
  label: 'Only Trashed'
}];

class DestinationList extends Component {
  state = {
    records: [],
    search: '',
    scope: ''
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const data = {
      search: this.state.search,
      scope: this.state.scope
    };
    if (this.props.user.role === 'Ambassador') {
      data.ambassador_id = this.props.user.id;
    }
    this.props.apiRequest({
      url: '/destinations',
      method: 'GET',
      data,
      accessToken: this.props.apiToken,
      onSuccess: (records) => this.setState({ records }),
      onError: (error) => message.error(error)
    });
  }

  deleteRecord = (id, force) => this.props.apiRequest({
    url: `/destinations/${id}`,
    method: 'DELETE',
    data: { force },
    accessToken: this.props.apiToken,
    onSuccess: this.fetchData,
    onError: (error) => message.error(error)
  })

  restoreRecord = (id) => this.props.apiRequest({
    url: `/destinations/${id}`,
    method: 'PATCH',
    accessToken: this.props.apiToken,
    onSuccess: this.fetchData,
    onError: (error) => message.error(error)
  })

  render = () => (
    <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
      <div style={{ marginBottom: 8 }}>
        <Link to="/destinations/new">
          <Button type="primary" icon={<PlusOutlined />}>Add</Button>
        </Link>
        <span style={{ marginLeft: 16 }}>Scope:</span>
        <Select
          value={this.state.scope}
          onChange={scope => this.setState({ scope }, this.fetchData)}
          style={{ marginLeft: 8, width: 150 }}
        >
          {scopes.map((item, index) => (
            <Option key={index} value={item.value}>{item.label}</Option>
          ))}
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
        columns={columns.concat({
          title: 'Action',
          dataIndex: 'id',
          render: (text, record) => (
            <span>
              <Link to={`/destinations/edit/${text}`}>
                <EditOutlined style={{ fontSize: 20 }} />
              </Link>
              {!!record.deleted_at && (
                <Popconfirm
                  title="Are you sure to restore this destination?"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() => this.restoreRecord(text)}
                >
                  <UndoOutlined style={{ fontSize: 20, color: green.primary, marginLeft: 8 }} />
                </Popconfirm>
              )}
              <Popconfirm
                title={!!record.deleted_at ? 'Are you sure to delete this destination permanently?' : 'Are you sure to move this destination to trash?'}
                okText="Yes"
                cancelText="No"
                onConfirm={() => this.deleteRecord(text, !!record.deleted_at)}
              >
                <DeleteOutlined style={{ fontSize: 20, color: red.primary, marginLeft: 8 }} />
              </Popconfirm>
            </span>
          )
        })}
        dataSource={this.state.records}
      />
    </div>
  )
}

const mapStateToProps = ({
  auth: { apiToken, user }
}) => ({
  apiToken, user
});

const mapDispatchToProps = (dispacth) => ({
  apiRequest: (params) => dispacth(apiRequest(params))
});

export default compose(
  withMenuBar,
  connect(mapStateToProps, mapDispatchToProps)
)(DestinationList);