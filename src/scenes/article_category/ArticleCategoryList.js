import React, { Component } from 'react';
import { Avatar, Button, Input, Popconfirm, Select, Table, message } from 'antd';
import { CheckCircleOutlined, DeleteOutlined, EditOutlined, PlusOutlined, UndoOutlined } from '@ant-design/icons';
import { green, red } from '@ant-design/colors';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { apiRequest } from '../../controllers/api/actions';
import { getImageURL, withMenuBar } from '../../global';

const { Search } = Input;
const { Option } = Select;

const columns = [{
  title: 'Image',
  dataIndex: 'image',
  render: (text) => (
    <Avatar
      shape="square"
      src={getImageURL(text, true, 40, 40)}
      size="large"
    />
  )
},{
  title: 'Title',
  dataIndex: 'title'
},{
  title: 'Initiative',
  dataIndex: 'initiative',
  align: 'center',
  render: (text) => text && (
    <CheckCircleOutlined style={{ color: green.primary, fontSize: 20 }} />
  )
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

class ArticleCategoryList extends Component {
  state = {
    records: [],
    destinations: [],
    destination_id: 0,
    search: '',
    scope: ''
  }

  componentDidMount() {
    this.fetchData();
    let data = undefined;
    if (this.props.user.role === 'Ambassador') {
      data = { ambassador_id: this.props.user.id };
    }
    this.props.apiRequest({
      url: '/destinations',
      method: 'GET',
      data,
      accessToken: this.props.apiToken,
      onSuccess: (destinations) => this.setState({ destinations }),
      onError: (error) => message.error(error)
    });
  }

  fetchData = () => {
    const data = {
      destination_id: this.state.destination_id,
      search: this.state.search,
      scope: this.state.scope
    };
    if (this.props.user.role === 'Ambassador') {
      data.ambassador_id = this.props.user.id;
    }
    this.props.apiRequest({
      url: '/article_categories',
      method: 'GET',
      data,
      accessToken: this.props.apiToken,
      onSuccess: (records) => this.setState({ records }),
      onError: (error) => message.error(error)
    });
  }

  deleteRecord = (id, force) => this.props.apiRequest({
    url: `/article_categories/${id}`,
    method: 'DELETE',
    data: { force },
    accessToken: this.props.apiToken,
    onSuccess: this.fetchData,
    onError: (error) => message.error(error)
  })

  restoreRecord = (id) => this.props.apiRequest({
    url: `/article_categories/${id}`,
    method: 'PATCH',
    accessToken: this.props.apiToken,
    onSuccess: this.fetchData,
    onError: (error) => message.error(error)
  })

  render = () => (
    <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
      <div style={{ marginBottom: 8 }}>
        <Link to="/article_categories/new">
          <Button type="primary" icon={<PlusOutlined />}>Add</Button>
        </Link>
        <span style={{ marginLeft: 16 }}>Destination:</span>
        <Select
          value={this.state.destination_id}
          onChange={id => this.setState({ destination_id: id }, this.fetchData)}
          style={{ marginLeft: 8, width: 150 }}
        >
          {[{
            id: 0,
            name: 'All'
          }].concat(this.state.destinations).map((item, index) => (
            <Option key={index} value={item.id}>{item.name}</Option>
          ))}
        </Select>
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
              <Link to={`/article_categories/edit/${text}`}>
                <EditOutlined style={{ fontSize: 20 }} />
              </Link>
              {!!record.deleted_at && (
                <Popconfirm
                  title="Are you sure to restore this category?"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() => this.restoreRecord(text)}
                >
                  <UndoOutlined style={{ fontSize: 20, color: green.primary, marginLeft: 8 }} />
                </Popconfirm>
              )}
              <Popconfirm
                title={!!record.deleted_at ? 'Are you sure to delete this category permanently?' : 'Are you sure to move this category to trash?'}
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
)(ArticleCategoryList);