import React, { Component } from 'react';
import { Button, Col, Input, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import { apiRequest } from '../controllers/api/actions';
import { authLogin } from '../controllers/auth/actions';
import { openSocket } from '../controllers/socket/actions';

const { Password } = Input;

class SignIn extends Component {
  state = {
    email: '',
    password: ''
  }

  doLogin = () => this.props.apiRequest({
    url: '/auth/login_with_email_password',
    method: 'POST',
    data: {
      email: this.state.email,
      password: this.state.password
    },
    onSuccess: (json) => {
      const { user, token } = json;
      localStorage.setItem('api.token', token);
      this.props.authLogin(user, token);
      this.props.openSocket();
    },
    onError: (error) => message.error(error)
  })

  render = () => !!this.props.apiToken ? (
    <Redirect to="/" />
  ) : (
    <div style={{
      width: '100wh',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Col sm={20} lg={6} style={{ textAlign: 'center' }}>
        <Input
          prefix={<UserOutlined />}
          placeholder="Enter your email address"
          style={{ margin: 5 }}
          value={this.state.email}
          onChange={(e) => this.setState({ email: e.target.value })}
        />
        <Password
          prefix={<LockOutlined />}
          placeholder="Enter your password"
          style={{ margin: 5 }}
          value={this.state.password}
          onChange={(e) => this.setState({ password: e.target.value })}
        />
        <Button type="primary" style={{ margin: 5 }} onClick={this.doLogin}>Login</Button>
      </Col>
    </div>
  )
}

const mapStateToProps = ({ auth }) => ({
  apiToken: auth.apiToken
});

const mapDispatchToProps = (dispacth) => ({
  apiRequest: (params) => dispacth(apiRequest(params)),
  authLogin: (user, token) => dispacth(authLogin(user, token)),
  openSocket: () => dispacth(openSocket())
});

export default connect(mapStateToProps, mapDispatchToProps)(SignIn);