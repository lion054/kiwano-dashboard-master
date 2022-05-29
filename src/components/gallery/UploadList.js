import React, { Component } from 'react';
import Animate from 'rc-animate';
import classNames from 'classnames';

import { previewImage } from 'antd/es/upload/utils';
import { ConfigConsumer } from 'antd/es/config-provider';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

import UploadItem from './UploadItem';

const SortableItem = SortableElement(UploadItem);

const SortableList = SortableContainer(props => {
  const prefixCls = props.getPrefixCls('upload', props.prefixCls);
  const list = props.items.map((file, index) => (
    <SortableItem
      key={file.uid}
      index={index}
      file={file}
      prefixCls={prefixCls}
      listType={props.listType}
      progressAttr={props.progressAttr}
      showRemoveIcon={props.showRemoveIcon}
      removeIcon={props.removeIcon}
      onRemove={props.onRemove}
      locale={props.locale}
      showDownloadIcon={props.showDownloadIcon}
      downloadIcon={props.downloadIcon}
      showPreviewIcon={props.showPreviewIcon}
    />
  ));
  const listClassNames = classNames({
    [`${prefixCls}-list`]: true,
    [`${prefixCls}-list-${props.listType}`]: true,
    [`${prefixCls}-list-rtl`]: props.direction === 'rtl',
  });
  const animationDirection = props.listType === 'picture-card' ? 'animate-inline' : 'animate';
  return (
    <Animate
      transitionName={`${prefixCls}-${animationDirection}`}
      component="div"
      className={listClassNames}
    >
      {list}
    </Animate>
  );
})

export default class UploadList extends Component {
  componentDidUpdate() {
    const { listType, items, previewFile } = this.props;
    if (listType !== 'picture' && listType !== 'picture-card') {
      return;
    }
    (items || []).forEach(file => {
      if (
        typeof document === 'undefined' ||
        typeof window === 'undefined' ||
        !window.FileReader ||
        !window.File ||
        !(file.originFileObj instanceof File || file.originFileObj instanceof Blob) ||
        file.thumbUrl !== undefined
      ) {
        return;
      }
      file.thumbUrl = '';
      if (previewFile) {
        previewFile(file.originFileObj).then((previewDataUrl) => {
          // Need append '' to avoid dead loop
          file.thumbUrl = previewDataUrl || '';
          this.forceUpdate();
        });
      }
    });
  }

  onDragEnd = ({ oldIndex, newIndex }) => {
    if (this.props.onSort) {
      this.props.onSort(oldIndex, newIndex);
    }
  }

  renderUploadList = ({ getPrefixCls, direction }) => (
    <SortableList
      axis="xy"
      useDragHandle={true}
      onSortEnd={this.onDragEnd}
      onRemove={this.props.onRemove}
      getPrefixCls={getPrefixCls}
      direction={direction}
      prefixCls={this.props.prefixCls}
      items={this.props.items}
      listType={this.props.listType}
      showPreviewIcon={this.props.showPreviewIcon}
      showRemoveIcon={this.props.showRemoveIcon}
      showDownloadIcon={this.props.showDownloadIcon}
      removeIcon={this.props.removeIcon}
      downloadIcon={this.props.downloadIcon}
      locale={this.props.locale}
      progressAttr={this.props.progressAttr}
    />
  )

  render = () => (
    <ConfigConsumer>{this.renderUploadList}</ConfigConsumer>
  )
}

UploadList.defaultProps = {
  listType: 'text', // or picture
  progressAttr: {
    strokeWidth: 2,
    showInfo: false,
  },
  showRemoveIcon: true,
  showDownloadIcon: false,
  showPreviewIcon: true,
  previewFile: previewImage,
}