import React, { Component } from 'react';
import { Avatar, Button, Input, Popconfirm, Table, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { red } from '@ant-design/colors';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { apiRequest } from '../../controllers/api/actions';
import { getImageURL, withMenuBar } from '../../global';

const { Search } = Input;

const columns = [{
  title: 'Destination',
  dataIndex: 'destination_name'
},{
  title: 'Avatar',
  dataIndex: 'image',
  render: (text) => !!text && (
    <Avatar
      shape="square"
      src={getImageURL(text, true, 40, 40)}
      size="large"
    />
  )
},{
  title: 'Caption',
  dataIndex: 'caption'
},{
  title: 'Author',
  dataIndex: 'author_name',
  render: (text, record) => (
    <>
      <Avatar
        src={getImageURL(record.author_avatar, true, 40, 40)}
        size="large"
      />
      <span style={{ marginLeft: 8 }}>{text}</span>
    </>
  )
},{
  title: 'Created At',
  dataIndex: 'created_at',
  render: (value) => moment(value).format('YYYY-MM-DD')
}];

class StoryList extends Component {
  state = {
    records: [],
    search: ''
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const data = {
      search: this.state.search
    };
    if (this.props.user.role === 'Ambassador') {
      data.ambassador_id = this.props.user.id;
    }
    this.props.apiRequest({
      url: '/stories',
      method: 'GET',
      data,
      accessToken: this.props.apiToken,
      onSuccess: (records) => this.setState({ records }),
      onError: (error) => message.error(error)
    });
  }

  deleteRecord = (id) => this.props.apiRequest({
    url: `/stories/${id}`,
    method: 'DELETE',
    accessToken: this.props.apiToken,
    onSuccess: this.fetchData,
    onError: (error) => message.error(error)
  })

  render = () => (
    <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
      <div style={{ marginBottom: 8 }}>
        <Link to="/stories/new">
          <Button type="primary" icon={<PlusOutlined />}>Add</Button>
        </Link>
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
          render: (text) => (
            <span>
              <Link to={`/stories/edit/${text}`} style={{ marginRight: 8 }}>
                <EditOutlined style={{ fontSize: 20 }} />
              </Link>
              <Popconfirm
                title="Are you sure to delete this destination?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => this.deleteRecord(text)}
              >
                <DeleteOutlined style={{ fontSize: 20, color: red.primary }} />
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
)(StoryList);