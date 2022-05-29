import React, { Component } from 'react';
import { Avatar, Badge, Button, Drawer, List, message } from 'antd';
import { MessageOutlined, RightCircleOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { isEqual } from 'lodash/fp';
import { connect } from 'react-redux';

import { getImageURL } from '../global';
import { apiRequest } from '../controllers/api/actions';
import { fetchLatestMessages, fetchMoreMessages, sendMessage } from '../controllers/socket/actions';

const { Item } = List;

class Chat extends Component {
  state = {
    collapsed: true,
    currentOtherId: null,
    messages: [],
    text: ''
  }

  componentDidMount() {
    if (!!this.props.apiToken) {
      this.fetchLatestMessages();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.messages, this.state.messages)) {
      this.setState({ messages: nextProps.messages }, this.scrollToEnd);
    }
  }

  scrollToEnd = () => {
    let msgList = document.querySelector('.chat-msg-list');
    msgList.scrollTop = msgList.scrollHeight;
  }

  fetchLatestMessages = () => this.props.apiRequest({
    url: '/messages',
    method: 'GET',
    data: {
      one_id: this.props.user.id,
      other_id: this.state.currentOtherId,
      limit: 15
    },
    accessToken: this.props.apiToken,
    onSuccess: (json) => this.props.fetchLatestMessages(json),
    onError: (error) => message.error(error)
  })

  fetchMoreMessages = () => this.props.apiRequest({
    url: '/messages',
    method: 'GET',
    data: {
      one_id: this.props.user.id,
      other_id: this.state.currentOtherId,
      last_id: this.props.messages.length > 0 ? this.props.messages[this.props.messages.length - 1].id : undefined,
      limit: 15
    },
    accessToken: this.props.apiToken,
    onSuccess: (json) => this.props.fetchMoreMessages(json),
    onError: (error) => message.error(error)
  })

  getAvatar(user_id) {
    const user = this.props.users.find(item => item.id === user_id);
    return user ? getImageURL(user.avatar, true, 40, 40) : null;
  }

  getOrderClassNames(index) {
    // Perform last check prior to first check
    // Because time segment is attached to only last item
    const result = [];
    const userId = this.state.messages[index].from;
    if (index === 0) {
      result.push('first-item');
    } else if (this.state.messages[index - 1].from !== userId) {
      result.push('first-item');
    }
    if (index === this.state.messages.length - 1) {
      result.push('last-item');
    } else if (this.state.messages[index + 1].from !== userId) {
      result.push('last-item');
    }
    return result;
  }

  sendMessage = () => {
    const { text } = this.state;
    if (!!text) {
      this.props.sendMessage(this.props.user.id, this.state.currentOtherId, text);
      this.setState({ text: '' });
    }
  }

  render = () => (
    <Drawer
      closable={false}
      mask={false}
      maskClosable={false}
      bodyStyle={{ padding: 0 }}
      visible={!this.state.collapsed}
      width={300}
      onClose={() => this.setState({ collapsed: true })}
      handler={(
        <div className="custom-scrollbar" style={{
          position: 'absolute',
          top: 0,
          left: -71,
          height: '100vh',
          overflowY: 'scroll',
          backgroundColor: '#001529'
        }}>
          <div
            style={{ padding: 10, cursor: 'pointer' }}
            onClick={() => this.setState({ collapsed: !this.state.collapsed })}
          >
            <MessageOutlined style={{ color: 'white', fontSize: 32, alignSelf: 'center' }} />
          </div>
          {this.props.users.filter(user => user.role === 'Traveller').map(this.renderContact)}
        </div>
      )}
    >
      <div style={{ overflowY: 'hidden' }}>
        <List
          className="chat-msg-list custom-scrollbar"
          rowKey={(message) => message.id}
          dataSource={Array.from(this.state.messages).reverse()}
          split={false}
          renderItem={this.renderMessage}
          style={{ height: 'calc(100vh - 80px)', overflowY: 'scroll' }}
        />
      </div>
      <div className="chat-input-outerwrapper" style={{ height: 80 }}>
        <div className="chat-input-innerwrapper">
          <input
            type="text"
            placeholder="Type your message"
            value={this.state.text}
            onChange={e => this.setState({ text: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && this.sendMessage()}
          />
          <Button className="chat-send" shape="circle" icon={<RightCircleOutlined />} onClick={this.sendMessage} />
        </div>
      </div>
    </Drawer>
  )

  renderContact = (user, index) => (
    <div
      key={index}
      onClick={() => this.setState({
        collapsed: false,
        currentOtherId: user.id
      }, this.fetchLatestMessages)}
      className="chat-contact"
      style={{
        backgroundColor: user.id === this.state.currentOtherId && 'rgba(255, 255, 255, 0.5)',
        position: 'relative'
      }}
    >
      <Avatar
        src={getImageURL(user.avatar, true, 40, 40)}
        size="large"
      />
      {/* <div style={{
        position: 'absolute',
        top: 0,
        left: 5
      }}>
        <Badge count={5} />
      </div> */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: 0
      }}>
        <Badge status={user.connected ? 'success' : 'default'} />
      </div>
    </div>
  )

  renderMessage = ({ from, body, created_at }, index) => {
    const clsNames = this.getOrderClassNames(index);
    return (from === this.props.user.id) ? (
      <Item key={index} className={classNames('from-me', ...clsNames)}>
        <div className="msg-body">{body}</div>
        {clsNames.includes('last-item') && (
          <div className="msg-time">{created_at}</div>
        )}
      </Item>
    ) : (
      <Item key={index} className={classNames('from-other', ...clsNames)}>
        {clsNames.includes('last-item') ? (
          <Avatar
            src={this.getAvatar(from)}
            size="large"
            style={{ marginLeft: 10, marginRight: 10 }}
          />
        ) : (
          <div style={{ width: 60, height: 40 }} />
        )}
        <div>
          <div className="msg-body">{body}</div>
          {clsNames.includes('last-item') && (
            <div className="msg-time">{created_at}</div>
          )}
        </div>
      </Item>
    );
  }
}

const mapStateToProps = ({
  auth: { user, apiToken },
  socket: { users, messages }
}) => ({
  user, apiToken,
  users, messages
});

const mapDispatchToProps = (dispacth) => ({
  apiRequest: (params) => dispacth(apiRequest(params)),
  fetchLatestMessages: (messages) => dispacth(fetchLatestMessages(messages)),
  fetchMoreMessages: (messages) => dispacth(fetchMoreMessages(messages)),
  sendMessage: (from, to, body) => dispacth(sendMessage(from, to, body))
});

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
