import React, { Component } from 'react';
import { Col, Row, Table } from 'antd';
import moment from 'moment/moment';

class PrintTrip extends Component {
  render = () => (
    <div style={{ padding: 24, width: '100%' }}>
      <Row>
        <Col span={12} className="tahu" style={{ fontSize: 64 }}>Kiwano Travel</Col>
        <Col span={12} className="pull-right">
          <h2>INVOICE</h2>
          <h3>#{this.props.id}</h3>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <div>info@kiwanotravel.com</div>
          <div>+47 33 33 34 35</div>
          <div>Rådhusgaten 4, 3126 Tønsberg, Norway</div>
          <div style={{ marginTop: 32 }}>Bill To:</div>
          <h4>{this.props.user_name}</h4>
        </Col>
        <Col span={12}>
          <Row>
            <Col span={12} className="pull-right">Date</Col>
            <Col span={12} className="pull-right">{moment().format('MMMM Do YYYY')}</Col>
          </Row>
          <Row>
            <Col span={12} className="pull-right">Trip Cost</Col>
            <Col span={12} className="pull-right">${this.props.amount}</Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col sm={24} lg={12} style={{ paddingTop: 10, paddingRight: 10 }}>
          <Table
            rowKey="id"
            columns={[{
              title: 'Experience',
              dataIndex: 'title'
            },{
              title: 'Cost',
              dataIndex: 'cost',
              render: (text) => `$${text}`
            }]}
            dataSource={this.props.experiences}
            pagination={false}
          />
        </Col>
        <Col sm={24} lg={12} style={{ paddingTop: 10, paddingLeft: 10 }}>
          {!!this.props.challenge && (
            <Row>
              <Col span={12} className="pull-right">CHALLENGE</Col>
              <Col span={12} className="pull-right">${this.props.challenge}</Col>
            </Row>
          )}
          <Row>
            <Col span={12} className="pull-right">PRICE</Col>
            <Col span={12} className="pull-right">${this.props.price}</Col>
          </Row>
          <Row>
            <Col span={12} className="pull-right">QUANTITY</Col>
            <Col span={12} className="pull-right">{this.props.quantity}</Col>
          </Row>
          <Row>
            <Col span={12} className="pull-right">AMOUNT</Col>
            <Col span={12} className="pull-right">${this.props.amount}</Col>
          </Row>
        </Col>
      </Row>
    </div>
  )
}

export default PrintTrip;