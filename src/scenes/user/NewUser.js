import React, { Component } from 'react';
import { Button, Col, DatePicker, Form, Input, Row, Select, Spin, message } from 'antd';
import PhoneInput from 'react-phone-input-2';
import moment from 'moment';
import { compose } from 'redux';
import { connect } from 'react-redux';

import PhotoUpload from '../../components/PhotoUpload';
import { formItemLayout, withMenuBar } from '../../global';
import { apiRequest } from '../../controllers/api/actions';

const { Item } = Form;
const { Password, TextArea } = Input;
const { Option } = Select;

const roles = ['Administrator', 'Ambassador', 'Traveller'];

class NewUser extends Component {
  state = {
    record: {
      avatar: '',
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      passport_number: '',
      passport_issued_at: '',
      passport_expired_at: '',
      address: '',
      city: '',
      post_code: '',
      country: '',
      phone_number: '',
      role: '',
      about: ''
    },
    countries: [],
    errors: {},
    spinning: false
  }

  componentDidMount() {
    this.props.apiRequest({
      url: '/countries',
      method: 'GET',
      onSuccess: (countries) => this.setState({ countries }),
      onError: (error) => message.error(error)
    });
  }

  onAvatarUploaded = (response) => {
    const { record } = this.state;
    record.avatar = response.path;
    this.setState({ record });
  }

  onSave = () => {
    this.setState({ spinning: true });
    const { password, password_confirmation, ...record } = this.state.record;
    if (!!password) {
      record.password = password;
    }
    if (!!password_confirmation) {
      record.password_confirmation = password_confirmation;
    }
    this.props.apiRequest({
      url: '/users',
      method: 'POST',
      data: record,
      accessToken: this.props.apiToken,
      onSuccess: (payload) => this.setState({ spinning: false }, () => {
        message.success('New user was created successfully.');
        this.props.history.goBack();
      }),
      onError: (error) => {
        if (typeof error === 'string') {
          this.setState({ spinning: false });
          message.error(error);
        } else {
          this.setState({
            spinning: false,
            errors: error
          });
        }
      }
    });
  }

  getDate(value) {
    return !value ? null : moment(value);
  }

  render = () => (
    <Spin spinning={this.state.spinning}>
      <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
        <Form>
          <Row>
            <Col sm={24} lg={12}>
              <Item
                {...formItemLayout}
                label="Avatar"
                validateStatus={this.state.errors.avatar && 'error'}
                help={this.state.errors.avatar && this.state.errors.avatar.join("\n")}
              >
                <PhotoUpload
                  path={this.state.record.avatar}
                  onUploadDone={this.onAvatarUploaded}
                />
              </Item>
            </Col>
            <Col sm={24} lg={12}>
              <Row>
                <Item
                  {...formItemLayout}
                  label="Name"
                  validateStatus={this.state.errors.name && 'error'}
                  help={this.state.errors.name && this.state.errors.name.join("\n")}
                >
                  <Input value={this.state.record.name} onChange={e => {
                    const { record } = this.state;
                    record.name = e.target.value;
                    this.setState({ record });
                  }} />
                </Item>
              </Row>
              <Row>
                <Item
                  {...formItemLayout}
                  label="Email"
                  validateStatus={this.state.errors.email && 'error'}
                  help={this.state.errors.email && this.state.errors.email.join("\n")}
                >
                  <Input value={this.state.record.email} onChange={e => {
                    const { record } = this.state;
                    record.email = e.target.value;
                    this.setState({ record });
                  }} />
                </Item>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={12}>
              <Item
                {...formItemLayout}
                label="Password"
                validateStatus={this.state.errors.password && 'error'}
                help={this.state.errors.password && this.state.errors.password.join("\n")}
              >
                <Password value={this.state.record.password} onChange={e => {
                  const { record } = this.state;
                  record.password = e.target.value;
                  this.setState({ record });
                }} />
              </Item>
            </Col>
            <Col sm={24} lg={12}>
              <Item
                {...formItemLayout}
                label="Password Confirmation"
                validateStatus={this.state.errors.password_confirmation && 'error'}
                help={this.state.errors.password_confirmation && this.state.errors.password_confirmation.join("\n")}
              >
                <Password value={this.state.record.password_confirmation} onChange={e => {
                  const { record } = this.state;
                  record.password_confirmation = e.target.value;
                  this.setState({ record });
                }} />
              </Item>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={12}>
              <Item
                {...formItemLayout}
                label="Passport Issued At"
                validateStatus={this.state.errors.passport_issued_at && 'error'}
                help={this.state.errors.passport_issued_at && this.state.errors.passport_issued_at.join("\n")}
              >
                <DatePicker value={this.getDate(this.state.record.passport_issued_at)} onChange={(date, dateString) => {
                  const { record } = this.state;
                  record.passport_issued_at = dateString;
                  this.setState({ record });
                }} />
              </Item>
            </Col>
            <Col sm={24} lg={12}>
              <Item
                {...formItemLayout}
                label="Passport Exprired At"
                validateStatus={this.state.errors.passport_expired_at && 'error'}
                help={this.state.errors.passport_expired_at && this.state.errors.passport_expired_at.join("\n")}
              >
                <DatePicker value={this.getDate(this.state.record.passport_expired_at)} onChange={(date, dateString) => {
                  const { record } = this.state;
                  record.passport_expired_at = dateString;
                  this.setState({ record });
                }} />
              </Item>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={12}>
              <Item
                {...formItemLayout}
                label="Passport Number"
                validateStatus={this.state.errors.passport_number && 'error'}
                help={this.state.errors.passport_number && this.state.errors.passport_number.join("\n")}
              >
                <Input value={this.state.record.passport_number} onChange={e => {
                  const { record } = this.state;
                  record.passport_number = e.target.value;
                  this.setState({ record });
                }} />
              </Item>
            </Col>
            <Col sm={24} lg={12}>
              <Item
                {...formItemLayout}
                label="Address"
                validateStatus={this.state.errors.address && 'error'}
                help={this.state.errors.address && this.state.errors.address.join("\n")}
              >
                <Input value={this.state.record.address} onChange={e => {
                  const { record } = this.state;
                  record.address = e.target.value;
                  this.setState({ record });
                }} />
              </Item>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={12}>
              <Item
                {...formItemLayout}
                label="City"
                validateStatus={this.state.errors.city && 'error'}
                help={this.state.errors.city && this.state.errors.city.join("\n")}
              >
                <Input value={this.state.record.city} onChange={e => {
                  const { record } = this.state;
                  record.city = e.target.value;
                  this.setState({ record });
                }} />
              </Item>
            </Col>
            <Col sm={24} lg={12}>
              <Item
                {...formItemLayout}
                label="Post Code"
                validateStatus={this.state.errors.post_code && 'error'}
                help={this.state.errors.post_code && this.state.errors.post_code.join("\n")}
              >
                <Input value={this.state.record.post_code} onChange={e => {
                  const { record } = this.state;
                  record.post_code = e.target.value;
                  this.setState({ record });
                }} />
              </Item>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={12}>
              <Item
                {...formItemLayout}
                label="Country"
                validateStatus={this.state.errors.country && 'error'}
                help={this.state.errors.country && this.state.errors.country.join("\n")}
              >
                <Select value={this.state.record.country} onChange={country => {
                  const { record } = this.state;
                  record.country = country;
                  this.setState({ record });
                }}>
                  {this.state.countries.map((item, index) => (
                    <Option key={index} value={item.abbreviation}>{item.country}</Option>
                  ))}
                </Select>
              </Item>
            </Col>
            <Col sm={24} lg={12}>
              <Item
                {...formItemLayout}
                label="Phone"
                validateStatus={this.state.errors.phone_number && 'error'}
                help={this.state.errors.phone_number && this.state.errors.phone_number.join("\n")}
              >
                <PhoneInput
                  placeholder=""
                  value={this.state.record.phone_number}
                  onChange={(phone_number) => {
                    const { record } = this.state;
                    record.phone_number = phone_number;
                    this.setState({ record });
                  }}
                  containerStyle={{ lineHeight: '34px' }}
                  inputStyle={{ width: '100%' }}
                  dropdownStyle={{ margin: '3px 0 3px -1px' }}
                />
              </Item>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={12}>
              <Item {...formItemLayout} label="Role">
                <Select value={this.state.record.role} onChange={role => {
                  const { record } = this.state;
                  record.role = role;
                  this.setState({ record });
                }}>
                  {roles.map((item, index) => (
                    <Option key={index} value={item}>{item}</Option>
                  ))}
                </Select>
              </Item>
            </Col>
            <Col sm={24} lg={12}>
              <Item
                {...formItemLayout}
                label="About"
                validateStatus={this.state.errors.about && 'error'}
                help={this.state.errors.about && this.state.errors.about.join("\n")}
              >
                <TextArea rows={4} value={this.state.record.about} onChange={e => {
                  const { record } = this.state;
                  record.about = e.target.value;
                  this.setState({ record });
                }} />
              </Item>
            </Col>
          </Row>
          <Row style={{ textAlign: 'center' }}>
            <div>
              <Button type="primary" className="form-action-button" onClick={this.onSave}>Save</Button>
              <Button type="default" className="form-action-button" onClick={() => this.props.history.goBack()}>Back</Button>
            </div>
          </Row>
        </Form>
      </div>
    </Spin>
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
)(NewUser);