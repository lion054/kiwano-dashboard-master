import React, { Component } from 'react';
import { Avatar, Button, Card, Col, Form, Input, List, Modal, Popconfirm, Radio, Row, Spin, Switch, Table, message } from 'antd';
import { DeleteOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { red } from '@ant-design/colors';
import { arrayMove } from 'react-sortable-hoc';
import { isEmpty } from 'lodash/fp';
import { compose } from 'redux';
import { connect } from 'react-redux';

import PhotoUpload from '../../components/PhotoUpload';
import GalleryUpload from '../../components/gallery/Upload';
import { getImageURL, formItemLayout, withMenuBar } from '../../global';
import { apiRequest } from '../../controllers/api/actions';

const { TextArea } = Input;
const { Meta } = Card;

class NewDestination extends Component {
  state = {
    record: {
      banners: [],
      badge: '',
      name: '',
      title: '',
      description: '',
      ambassador_id: '',
      vaccine_notice: '',
      vaccines: [],
      visa_notice: '',
      region: ''
    },
    fileList: [],
    ambassador: {},
    ambassadorModal: false,
    users: [],
    selectedUserId: null,
    newVaccine: '',
    errors: {},
    spinning: false
  }

  componentDidMount() {
    this.props.apiRequest({
      url: '/users',
      method: 'GET',
      data: { role: 'Ambassador' },
      accessToken: this.props.apiToken,
      onSuccess: (users) => this.setState({ users }),
      onError: (error) => message.error(error)
    });
  }

  fetchAmbassador = () => {
    this.props.apiRequest({
      url: `/users/${this.state.record.ambassador_id}`,
      method: 'GET',
      accessToken: this.props.apiToken,
      onSuccess: (ambassador) => this.setState({ ambassador }),
      onError: (error) => message.error(error)
    });
  }

  onRemoveBanner = (file) => {
    const { record, fileList } = this.state;
    const index = fileList.findIndex(item => item.uid === file.uid);
    if (index !== -1) {
      record.banners.splice(index, 1);
      fileList.splice(index, 1);
      this.setState({ record, fileList });
    }
  }

  onSortBanner = (oldIndex, newIndex) => this.setState({
    record: {
      ...this.state.record,
      banners: arrayMove(this.state.record.banners, oldIndex, newIndex)
    },
    fileList: arrayMove(this.state.fileList, oldIndex, newIndex)
  })

  onUploadBanner = ({ file, fileList }) => {
    if (file.status === 'done') {
      const { record } = this.state;
      record.banners.push({ image: file.response.path });
      this.setState({ record, fileList });
    } else {
      this.setState({ fileList });
    }
  }

  onBadgeUploaded = (response) => {
    const { record } = this.state;
    record.badge = response.path;
    this.setState({ record });
  }

  onSave = () => {
    this.setState({ spinning: true });
    this.props.apiRequest({
      url: '/destinations',
      method: 'POST',
      data: this.state.record,
      accessToken: this.props.apiToken,
      onSuccess: (payload) => this.setState({ spinning: false }, () => {
        message.success('New destination was created successfully.');
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

  render = () => (
    <Spin spinning={this.state.spinning}>
      <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
        <Form>
          <Row>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Banners"
                validateStatus={this.state.errors.banners && 'error'}
                help={this.state.errors.banners && this.state.errors.banners.join("\n")}
              >
                <GalleryUpload
                  name="image"
                  action={`${process.env.REACT_APP_API_ENDPOINT}/media`}
                  data={{
                    uuid: true
                  }}
                  headers={{
                    authorization: `Bearer ${this.props.apiToken}`
                  }}
                  listType="picture-card"
                  className="avatar-uploader"
                  fileList={this.state.fileList}
                  onChange={this.onUploadBanner}
                  onRemove={this.onRemoveBanner}
                  onSort={this.onSortBanner}
                >
                  <PlusOutlined />
                  <div className="ant-upload-text">Upload</div>
                </GalleryUpload>
              </Form.Item>
            </Col>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Badge"
                validateStatus={this.state.errors.badge && 'error'}
                help={this.state.errors.badge && this.state.errors.badge.join("\n")}
              >
                <PhotoUpload
                  path={this.state.record.badge}
                  onUploadDone={this.onBadgeUploaded}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={12}>
              <Form.Item
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
              </Form.Item>
            </Col>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Title"
                validateStatus={this.state.errors.title && 'error'}
                help={this.state.errors.title && this.state.errors.title.join("\n")}
              >
                <Input value={this.state.record.title} onChange={e => {
                  const { record } = this.state;
                  record.title = e.target.value;
                  this.setState({ record });
                }} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Description"
                validateStatus={this.state.errors.description && 'error'}
                help={this.state.errors.description && this.state.errors.description.join("\n")}
              >
                <TextArea rows={4} value={this.state.record.description} onChange={e => {
                  const { record } = this.state;
                  record.description = e.target.value;
                  this.setState({ record });
                }} />
              </Form.Item>
            </Col>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Ambassador"
                validateStatus={this.state.errors.ambassador_id && 'error'}
                help={this.state.errors.ambassador_id && this.state.errors.ambassador_id.join("\n")}
              >
                {isEmpty(this.state.ambassador) ? (
                  <Button type="primary" icon={<UserOutlined />} onClick={() => this.setState({ ambassadorModal: true })}>Choose</Button>
                ) : this.renderAmbassador()}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Vaccine Notice"
                validateStatus={this.state.errors.vaccine_notice && 'error'}
                help={this.state.errors.vaccine_notice && this.state.errors.vaccine_notice.join("\n")}
              >
                <TextArea rows={4} value={this.state.record.vaccine_notice} onChange={e => {
                  const { record } = this.state;
                  record.vaccine_notice = e.target.value;
                  this.setState({ record });
                }} />
              </Form.Item>
            </Col>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Visa Notice"
                validateStatus={this.state.errors.visa_notice && 'error'}
                help={this.state.errors.visa_notice && this.state.errors.visa_notice.join("\n")}
              >
                <TextArea rows={4} value={this.state.record.visa_notice} onChange={e => {
                  const { record } = this.state;
                  record.visa_notice = e.target.value;
                  this.setState({ record });
                }} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Region"
                validateStatus={this.state.errors.region && 'error'}
                help={this.state.errors.region && this.state.errors.region.join("\n")}
              >
                <Input value={this.state.record.region} onChange={e => {
                  const { record } = this.state;
                  record.region = e.target.value;
                  this.setState({ record });
                }} />
              </Form.Item>
            </Col>
          </Row>
          {this.renderVaccines()}
          <Row style={{ textAlign: 'center' }}>
            <div>
              <Button type="primary" className="form-action-button" onClick={this.onSave}>Save</Button>
              <Button type="default" className="form-action-button" onClick={() => this.props.history.goBack()}>Back</Button>
            </div>
          </Row>
        </Form>
        {this.renderModal()}
      </div>
    </Spin>
  )

  renderAmbassador = () => (
    <Card hoverable={true} onClick={() => this.setState({ ambassadorModal: true })}>
      <Meta
        avatar={(
          <Avatar
            src={getImageURL(this.state.ambassador.avatar, true, 40, 40)}
            size="large"
          />
        )}
        title={this.state.ambassador.name}
        description={this.state.ambassador.about}
      />
    </Card>
  )

  renderModal = () => (
    <Modal
      title="Choose Ambassador"
      visible={this.state.ambassadorModal}
      onOk={() => this.setState({
        record: {
          ...this.state.record,
          ambassador_id: this.state.selectedUserId
        },
        ambassadorModal: false
      }, this.fetchAmbassador)}
      onCancel={() => this.setState({ ambassadorModal: false })}
    >
      <Radio.Group
        value={this.state.selectedUserId}
        onChange={e => this.setState({ selectedUserId: e.target.value })}
      >
        <List
          itemLayout="horizontal"
          dataSource={this.state.users}
          renderItem={item => (
            <List.Item style={{ cursor: 'pointer' }} onClick={() => this.setState({ selectedUserId: item.id })}>
              <List.Item.Meta
                avatar={(
                  <Avatar
                    src={getImageURL(item.avatar, true, 40, 40)}
                    size="large"
                  />
                )}
                title={item.name}
                description={item.about}
              />
              <Radio value={item.id} />
            </List.Item>
          )}
          style={{ height: '60vh', overflowY: 'scroll' }}
        />
      </Radio.Group>
    </Modal>
  )

  renderVaccines = () => (
    <Row>
      <Form.Item
        {...formItemLayout}
        label="Vaccines"
        validateStatus={this.state.errors.vaccines && 'error'}
        help={this.state.errors.vaccines && this.state.errors.vaccines.join("\n")}
      >
        <div style={{ marginBottom: 8 }}>
          <Input value={this.state.newVaccine} onChange={e => this.setState({ newVaccine: e.target.value })} style={{ marginRight: 8 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={this.onAddVaccine}>Add</Button>
        </div>
        <Table
          columns={[{
            title: 'Name',
            dataIndex: 'name'
          },{
            title: 'Required',
            dataIndex: 'required',
            render: (value, record, index) => (
              <Switch checked={value} onChange={(checked) => this.onSwitchVaccine(index, checked)} />
            )
          },{
            title: 'Action',
            dataIndex: 'key',
            render: (value, record, index) => (
              <span style={{ whiteSpace: 'nowrap' }}>
                <Popconfirm
                  title="Are you sure to delete this item?"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() => this.onDeleteVaccine(index)}
                >
                  <DeleteOutlined style={{ fontSize: 20, color: red.primary }} />
                </Popconfirm>
              </span>
            )
          }]}
          dataSource={this.state.record.vaccines.map((item, index) => ({
            key: index,
            ...item
          }))}
          pagination={false}
        />
      </Form.Item>
    </Row>
  )

  onAddVaccine = () => {
    if (!this.state.newVaccine) {
      message.warn('Please enter name of new vaccine.');
      return;
    }
    const { record } = this.state;
    record.vaccines.push({
      name: this.state.newVaccine,
      required: true
    });
    this.setState({ record });
  }

  onSwitchVaccine(index, checked) {
    const { record } = this.state;
    record.vaccines[index].required = checked;
    this.setState({ record });
  }

  onDeleteVaccine(index) {
    const { record } = this.state;
    record.vaccines.splice(index, 1);
    this.setState({ record });
  }
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
)(NewDestination);