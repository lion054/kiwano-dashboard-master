import React, { Component } from 'react';
import { Button, Col, Form, Input, InputNumber, Popconfirm, Row, Select, Spin, Table, message } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { blue, red } from '@ant-design/colors';
import { arrayMove } from 'react-sortable-hoc';
import ISO6391 from 'iso-639-1';
import { compose } from 'redux';
import { connect } from 'react-redux';

import PhotoUpload from '../../components/PhotoUpload';
import GalleryUpload from '../../components/gallery/Upload';
import { formItemLayout, withMenuBar } from '../../global';
import { apiRequest } from '../../controllers/api/actions';
import PlanModal from './PlanModal';
import IncludedModal from './IncludedModal';
import ExcludedModal from './ExcludedModal';
import CancellationModal from './CancellationModal';

const { Option } = Select;
const { TextArea } = Input;

class NewExperience extends Component {
  state = {
    record: {
      description_id: null,
      category_id: null,
      banners: [],
      title: '',
      days: 0,
      hours: 0,
      vehicle: '',
      cost: '',
      subtitle: '',
      place: '',
      guide_languages: [],
      tour_type: '',
      highlights: '',
      todo: '',
      plan: [],
      badges: [],
      included: [],
      excluded: [],
      cancel_policy: [],
      image: ''
    },
    fileList: [],
    destinations: [],
    categories: [],
    badges: [],
    errors: {},
    languages: [],
    editingPlan: null,
    editingIncluded: null,
    editingExcluded: null,
    editingCancellation: null,
    spinning: false
  }

  componentDidMount() {
    this.props.apiRequest({
      url: '/destinations',
      method: 'GET',
      accessToken: this.props.apiToken,
      onSuccess: (destinations) => this.setState({ destinations }),
      onError: (error) => message.error(error)
    });
    this.props.apiRequest({
      url: '/experience_categories',
      method: 'GET',
      accessToken: this.props.apiToken,
      onSuccess: (categories) => this.setState({ categories }),
      onError: (error) => message.error(error)
    });
    this.props.apiRequest({
      url: '/experience_badges',
      method: 'GET',
      accessToken: this.props.apiToken,
      onSuccess: (badges) => this.setState({ badges }),
      onError: (error) => message.error(error)
    });
    const codes = ISO6391.getAllCodes();
    this.setState({ languages: ISO6391.getLanguages(codes) });
  }

  onChangeCategory = (value) => this.setState({
    record: {
      ...this.state.record,
      category_id: value
    }
  })

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

  onChangeTitle = (e) => this.setState({
    record: {
      ...this.state.record,
      title: e.target.value
    }
  })

  onChangeDays = (value) => this.setState({
    record: {
      ...this.state.record,
      days: value
    }
  })

  onChangeHours = (value) => this.setState({
    record: {
      ...this.state.record,
      hours: value
    }
  })

  onChangeVehicle = (e) => this.setState({
    record: {
      ...this.state.record,
      vehicle: e.target.value
    }
  })

  onChangeCost = (value) => this.setState({
    record: {
      ...this.state.record,
      cost: value
    }
  })

  onChangeSubtitle = (e) => this.setState({
    record: {
      ...this.state.record,
      subtitle: e.target.value
    }
  })

  onChangePlace = (e) => this.setState({
    record: {
      ...this.state.record,
      place: e.target.value
    }
  })

  onChangeGuideLanguages = (value) => this.setState({
    record: {
      ...this.state.record,
      guide_languages: value
    }
  })

  onChangeTourType = (value) => this.setState({
    record: {
      ...this.state.record,
      tour_type: value
    }
  })

  onChangeHighlights = (e) => this.setState({
    record: {
      ...this.state.record,
      highlights: e.target.value
    }
  })

  onChangeToDo = (e) => this.setState({
    record: {
      ...this.state.record,
      todo: e.target.value
    }
  })

  onChangeBadges = (value) => this.setState({
    record: {
      ...this.state.record,
      badges: value
    }
  })

  onImageUploaded = (response) => {
    const { record } = this.state;
    record.image = response.path;
    this.setState({ record });
  }

  onSave = () => {
    this.setState({ spinning: true });
    this.props.apiRequest({
      url: '/experiences',
      method: 'POST',
      data: this.state.record,
      accessToken: this.props.apiToken,
      onSuccess: (payload) => this.setState({ spinning: false }, () => {
        message.success('New experience was created successfully.');
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
                label="Destination"
                validateStatus={this.state.errors.destination_id && 'error'}
                help={this.state.errors.destination_id && this.state.errors.destination_id.join("\n")}
              >
                <Select
                  value={this.state.record.destination_id}
                  onChange={id => {
                    const { record } = this.state;
                    record.destination_id = id;
                    this.setState({ record });
                  }}
                >
                  {this.state.destinations.map((item, index) => (
                    <Option key={index} value={item.id}>{item.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Category"
                validateStatus={this.state.errors.category_id && 'error'}
                help={this.state.errors.category_id && this.state.errors.category_id.join("\n")}
              >
                <Select
                  value={this.state.record.category_id}
                  onChange={id => {
                    const { record } = this.state;
                    record.category_id = id;
                    this.setState({ record });
                  }}
                >
                  {this.state.categories.map((item, index) => (
                    <Option key={index} value={item.id}>{item.title}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
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
                label="Title"
                validateStatus={this.state.errors.title && 'error'}
                help={this.state.errors.title && this.state.errors.title.join("\n")}
              >
                <Input
                  value={this.state.record.title}
                  onChange={this.onChangeTitle}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Days"
                validateStatus={this.state.errors.days && 'error'}
                help={this.state.errors.days && this.state.errors.days.join("\n")}
              >
                <InputNumber
                  min={0}
                  value={this.state.record.days}
                  onChange={this.onChangeDays}
                />
              </Form.Item>
            </Col>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Hours"
                validateStatus={this.state.errors.hours && 'error'}
                help={this.state.errors.hours && this.state.errors.hours.join("\n")}
              >
                <InputNumber
                  min={0}
                  value={this.state.record.hours}
                  onChange={this.onChangeHours}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Vehicle"
                validateStatus={this.state.errors.vehicle && 'error'}
                help={this.state.errors.vehicle && this.state.errors.vehicle.join("\n")}
              >
                <Input
                  value={this.state.record.vehicle}
                  onChange={this.onChangeVehicle}
                />
              </Form.Item>
            </Col>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Cost"
                validateStatus={this.state.errors.cost && 'error'}
                help={this.state.errors.cost && this.state.errors.cost.join("\n")}
              >
                <InputNumber
                  min={0}
                  value={this.state.record.cost}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  onChange={this.onChangeCost}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Subtitle"
                validateStatus={this.state.errors.subtitle && 'error'}
                help={this.state.errors.subtitle && this.state.errors.subtitle.join("\n")}
              >
                <Input
                  value={this.state.record.subtitle}
                  onChange={this.onChangeSubtitle}
                />
              </Form.Item>
            </Col>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Place"
                validateStatus={this.state.errors.place && 'error'}
                help={this.state.errors.place && this.state.errors.place.join("\n")}
              >
                <Input
                  value={this.state.record.place}
                  onChange={this.onChangePlace}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Guide Languages"
                validateStatus={this.state.errors.guide_languages && 'error'}
                help={this.state.errors.guide_languages && this.state.errors.guide_languages.join("\n")}
              >
                <Select
                  mode="multiple"
                  value={this.state.record.guide_languages}
                  onChange={this.onChangeGuideLanguages}
                >
                  {this.state.languages.map((item, index) => (
                    <Option key={index} value={item.code}>{item.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Tour Type"
                validateStatus={this.state.errors.tour_type && 'error'}
                help={this.state.errors.tour_type && this.state.errors.tour_type.join("\n")}
              >
                <Select
                  value={this.state.record.tour_type}
                  onChange={this.onChangeTourType}
                >
                  <Option value="Private">Private</Option>
                  <Option value="Public">Public</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Highlights"
                validateStatus={this.state.errors.highlights && 'error'}
                help={this.state.errors.highlights && this.state.errors.highlights.join("\n")}
              >
                <TextArea
                  rows={4}
                  value={this.state.record.highlights}
                  onChange={this.onChangeHighlights}
                />
              </Form.Item>
            </Col>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="ToDo"
                validateStatus={this.state.errors.todo && 'error'}
                help={this.state.errors.todo && this.state.errors.todo.join("\n")}
              >
                <TextArea
                  rows={4}
                  value={this.state.record.todo}
                  onChange={this.onChangeToDo}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Badges"
                validateStatus={this.state.errors.badges && 'error'}
                help={this.state.errors.badges && this.state.errors.badges.join("\n")}
              >
                <Select
                  mode="multiple"
                  value={this.state.record.badges}
                  onChange={this.onChangeBadges}
                >
                  {this.state.badges.map((item, index) => (
                    <Option key={index} value={item.id}>{item.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={24} lg={12}>
              <Form.Item
                {...formItemLayout}
                label="Image"
                validateStatus={this.state.errors.image && 'error'}
                help={this.state.errors.image && this.state.errors.image.join("\n")}
              >
                <PhotoUpload
                  path={this.state.record.image}
                  onUploadDone={this.onImageUploaded}
                />
              </Form.Item>
            </Col>
          </Row>
          {this.renderPlan()}
          {this.renderIncluded()}
          {this.renderExcluded()}
          {this.renderCancellation()}
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

  renderPlan = () => (
    <Row>
      <Form.Item
        {...formItemLayout}
        label="Plan"
        validateStatus={this.state.errors.plan && 'error'}
        help={this.state.errors.plan && this.state.errors.plan.join("\n")}
      >
        <div style={{ marginBottom: 8 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => this.setState({ editingPlan: '' })}>Add</Button>
        </div>
        <Table
          columns={[{
            title: 'Time',
            dataIndex: 'time'
          },{
            title: 'Title',
            dataIndex: 'title'
          },{
            title: 'Description',
            dataIndex: 'description'
          },{
            title: 'Action',
            dataIndex: 'key',
            render: (value) => (
              <span style={{ whiteSpace: 'nowrap' }}>
                <EditOutlined
                  style={{ fontSize: 20, color: blue.primary, cursor: 'pointer', marginRight: 8 }}
                  onClick={() => this.setState({ editingPlan: value })}
                />
                <Popconfirm
                  title="Are you sure to delete this item?"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() => {
                    const { record } = this.state;
                    record.plan.splice(value, 1);
                    this.setState({ record });
                  }}
                >
                  <DeleteOutlined style={{ fontSize: 20, color: red.primary }} />
                </Popconfirm>
              </span>
            )
          }]}
          dataSource={this.state.record.plan.map((item, index) => ({
            key: index,
            ...item
          }))}
          pagination={false}
        />
      </Form.Item>
      <PlanModal
        visible={this.state.editingPlan !== null}
        onClose={(item) => {
          if (item) {
            const { record } = this.state;
            if (Number.isInteger(this.state.editingPlan)) {
              record.plan[this.state.editingPlan] = item;
            } else {
              record.plan.push(item);
            }
            this.setState({ record });
          }
          this.setState({ editingPlan: null });
        }}
        {...this.getPlanItem()}
      />
    </Row>
  )

  getPlanItem() {
    if (!Number.isInteger(this.state.editingPlan)) {
      return null;
    }
    return this.state.record.plan[this.state.editingPlan];
  }

  renderIncluded = () => (
    <Row>
      <Form.Item
        {...formItemLayout}
        label="Included"
        validateStatus={this.state.errors.included && 'error'}
        help={this.state.errors.included && this.state.errors.included.join("\n")}
      >
        <div style={{ marginBottom: 8 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => this.setState({ editingIncluded: '' })}>Add</Button>
        </div>
        <Table
          columns={[{
            title: 'Label',
            dataIndex: 'label'
          },{
            title: 'Checked',
            dataIndex: 'checked',
            render: (value) => value ? (
              <CheckOutlined style={{
                color: value ? blue.primary : red.primary,
                fontSize: 20
              }} />
            ) : (
              <CloseOutlined style={{
                color: value ? blue.primary : red.primary,
                fontSize: 20
              }} />
            )
          },{
            title: 'Action',
            dataIndex: 'key',
            render: (value) => (
              <span style={{ whiteSpace: 'nowrap' }}>
                <EditOutlined
                  style={{ fontSize: 20, color: blue.primary, cursor: 'pointer', marginRight: 8 }}
                  onClick={() => this.setState({ editingIncluded: value })}
                />
                <Popconfirm
                  title="Are you sure to delete this item?"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() => {
                    const { record } = this.state;
                    record.included.splice(value, 1);
                    this.setState({ record });
                  }}
                >
                  <DeleteOutlined style={{ fontSize: 20, color: red.primary }} />
                </Popconfirm>
              </span>
            )
          }]}
          dataSource={this.state.record.included.map((item, index) => ({
            key: index,
            ...item
          }))}
          pagination={false}
        />
      </Form.Item>
      <IncludedModal
        visible={this.state.editingIncluded !== null}
        onClose={(item) => {
          if (item) {
            const { record } = this.state;
            if (Number.isInteger(this.state.editingIncluded)) {
              record.included[this.state.editingIncluded] = item;
            } else {
              record.included.push(item);
            }
            this.setState({ record });
          }
          this.setState({ editingIncluded: null });
        }}
        {...this.getIncludedItem()}
      />
    </Row>
  )

  getIncludedItem() {
    if (!Number.isInteger(this.state.editingIncluded)) {
      return null;
    }
    return this.state.record.included[this.state.editingIncluded];
  }

  renderExcluded = () => (
    <Row>
      <Form.Item
        {...formItemLayout}
        label="Excluded"
        validateStatus={this.state.errors.excluded && 'error'}
        help={this.state.errors.excluded && this.state.errors.excluded.join("\n")}
      >
        <div style={{ marginBottom: 8 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => this.setState({ editingExcluded: '' })}>Add</Button>
        </div>
        <Table
          columns={[{
            title: 'Label',
            dataIndex: 'label'
          },{
            title: 'Checked',
            dataIndex: 'checked',
            render: (value) => value ? (
              <CheckOutlined style={{
                color: blue.primary,
                fontSize: 20
              }} />
            ) : (
              <CloseOutlined style={{
                color: red.primary,
                fontSize: 20
              }} />
            )
          },{
            title: 'Action',
            dataIndex: 'key',
            render: (value) => (
              <span style={{ whiteSpace: 'nowrap' }}>
                <EditOutlined
                  style={{ fontSize: 20, color: blue.primary, cursor: 'pointer', marginRight: 8 }}
                  onClick={() => this.setState({ editingExcluded: value })}
                />
                <Popconfirm
                  title="Are you sure to delete this item?"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() => {
                    const { record } = this.state;
                    record.excluded.splice(value, 1);
                    this.setState({ record });
                  }}
                >
                  <DeleteOutlined style={{ fontSize: 20, color: red.primary }} />
                </Popconfirm>
              </span>
            )
          }]}
          dataSource={this.state.record.excluded.map((item, index) => ({
            key: index,
            ...item
          }))}
          pagination={false}
        />
      </Form.Item>
      <ExcludedModal
        visible={this.state.editingExcluded !== null}
        onClose={(item) => {
          if (item) {
            const { record } = this.state;
            if (Number.isInteger(this.state.editingExcluded)) {
              record.excluded[this.state.editingExcluded] = item;
            } else {
              record.excluded.push(item);
            }
            this.setState({ record });
          }
          this.setState({ editingExcluded: null });
        }}
        {...this.getExcludedItem()}
      />
    </Row>
  )

  getExcludedItem() {
    if (!Number.isInteger(this.state.editingExcluded)) {
      return null;
    }
    return this.state.record.excluded[this.state.editingExcluded];
  }

  renderCancellation = () => (
    <Row>
      <Form.Item
        {...formItemLayout}
        label="Cancellation"
        validateStatus={this.state.errors.cancel_policy && 'error'}
        help={this.state.errors.cancel_policy && this.state.errors.cancel_policy.join("\n")}
      >
        <div style={{ marginBottom: 8 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => this.setState({ editingCancellation: '' })}>Add</Button>
        </div>
        <Table
          columns={[{
            title: 'Label',
            dataIndex: 'label'
          },{
            title: 'Checked',
            dataIndex: 'checked',
            render: (value) => value ? (
              <CheckOutlined style={{
                color: blue.primary,
                fontSize: 20
              }} />
            ) : (
              <CloseOutlined style={{
                color: red.primary,
                fontSize: 20
              }} />
            )
          },{
            title: 'Action',
            dataIndex: 'key',
            render: (value) => (
              <span style={{ whiteSpace: 'nowrap' }}>
                <EditOutlined
                  style={{ fontSize: 20, color: blue.primary, cursor: 'pointer', marginRight: 8 }}
                  onClick={() => this.setState({ editingCancellation: value })}
                />
                <Popconfirm
                  title="Are you sure to delete this item?"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() => {
                    const { record } = this.state;
                    record.cancel_policy.splice(value, 1);
                    this.setState({ record });
                  }}
                >
                  <DeleteOutlined style={{ fontSize: 20, color: red.primary }} />
                </Popconfirm>
              </span>
            )
          }]}
          dataSource={this.state.record.cancel_policy.map((item, index) => ({
            key: index,
            ...item
          }))}
          pagination={false}
        />
      </Form.Item>
      <CancellationModal
        visible={this.state.editingCancellation !== null}
        onClose={(item) => {
          if (item) {
            const { record } = this.state;
            if (Number.isInteger(this.state.editingCancellation)) {
              record.cancel_policy[this.state.editingCancellation] = item;
            } else {
              record.cancel_policy.push(item);
            }
            this.setState({ record });
          }
          this.setState({ editingCancellation: null });
        }}
        {...this.getCancellationItem()}
      />
    </Row>
  )

  getCancellationItem() {
    if (!Number.isInteger(this.state.editingCancellation)) {
      return null;
    }
    return this.state.record.cancel_policy[this.state.editingCancellation];
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
)(NewExperience);