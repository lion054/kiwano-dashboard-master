import React, { Component } from 'react';
import { SortableHandle } from 'react-sortable-hoc';
import Animate from 'rc-animate';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import {
  AppstoreOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTwoTone,
  LoadingOutlined,
  PaperClipOutlined,
  PictureTwoTone
} from '@ant-design/icons';
import { isImageUrl } from 'antd/es/upload/utils';
import Tooltip from 'antd/es/tooltip';
import Progress from 'antd/es/progress';

const DragHandle = SortableHandle(() => (
  <span style={{ margin: '0 4px' }}>
    <AppstoreOutlined style={{ color: 'white' }} />
  </span>
));

export default class UploadItem extends Component {
  handlePreview = (file, e) => {
    const { onPreview } = this.props;
    if (!onPreview) {
      return;
    }
    e.preventDefault();
    return onPreview(file);
  }

  handleDownload = (file) => {
    const { onDownload } = this.props;
    if (typeof onDownload === 'function') {
      onDownload(file);
    } else if (file.url) {
      window.open(file.url);
    }
  }

  handleClose = (file) => {
    const { onRemove } = this.props;
    if (onRemove) {
      onRemove(file);
    }
  }

  handleIconRender = (file) => {
    const { listType, locale, iconRender } = this.props;
    if (iconRender) {
      return iconRender(file, listType);
    }
    const isLoading = file.status === 'uploading';
    const fileIcon = isImageUrl(file) ? (
      <PictureTwoTone twoToneColor="white" />
    ) : (
      <FileTwoTone twoToneColor="white" />
    );
    let icon = isLoading ? (
      <LoadingOutlined />
    ) : (
      <PaperClipOutlined />
    );
    if (listType === 'picture') {
      icon = isLoading ? (
        <LoadingOutlined />
      ) : fileIcon;
    } else if (listType === 'picture-card') {
      icon = isLoading ? locale.uploading : fileIcon;
    }
    return icon;
  }

  handleActionIconRender = (customIcon, callback, title) => {
    if (React.isValidElement(customIcon)) {
      return React.cloneElement(customIcon, {
        ...customIcon.props,
        title,
        onClick: (e) => {
          callback();
          if (customIcon.props.onClick) {
            customIcon.props.onClick(e);
          }
        },
      });
    }
    return (
      <span title={title} onClick={callback}>
        {customIcon}
      </span>
    );
  }

  render() {
    const {
      file,
      prefixCls,
      listType,
      progressAttr,
      showRemoveIcon,
      removeIcon,
      locale,
      showDownloadIcon,
      downloadIcon,
      showPreviewIcon
    } = this.props;
    let progress;
    const iconNode = this.handleIconRender(file);
    let icon = (
      <div className={`${prefixCls}-text-icon`}>{iconNode}</div>
    );
    if (listType === 'picture' || listType === 'picture-card') {
      if (file.status === 'uploading' || (!file.thumbUrl && !file.url)) {
        const uploadingClassName = classNames({
          [`${prefixCls}-list-item-thumbnail`]: true,
          [`${prefixCls}-list-item-file`]: file.status !== 'uploading',
        });
        icon = (
          <div className={uploadingClassName}>{iconNode}</div>
        );
      } else {
        const thumbnail = isImageUrl(file) ? (
          <img
            src={file.thumbUrl || file.url}
            alt={file.name}
            className={`${prefixCls}-list-item-image`}
          />
        ) : (
          iconNode
        );
        const aClassName = classNames({
          [`${prefixCls}-list-item-thumbnail`]: true,
          [`${prefixCls}-list-item-file`]: !isImageUrl(file),
        });
        icon = (
          <a
            className={aClassName}
            onClick={e => this.handlePreview(file, e)}
            href={file.url || file.thumbUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {thumbnail}
          </a>
        );
      }
    }

    if (file.status === 'uploading') {
      // show loading icon if upload progress listener is disabled
      const loadingProgress = 'percent' in file ? (
        <Progress type="line" {...progressAttr} percent={file.percent} />
      ) : null;

      progress = (
        <div className={`${prefixCls}-list-item-progress`} key="progress">
          {loadingProgress}
        </div>
      );
    }
    const infoUploadingClass = classNames({
      [`${prefixCls}-list-item`]: true,
      [`${prefixCls}-list-item-${file.status}`]: true,
      [`${prefixCls}-list-item-list-type-${listType}`]: true,
    });
    const linkProps = typeof file.linkProps === 'string' ? JSON.parse(file.linkProps) : file.linkProps;

    const customRemoveIcon = showRemoveIcon ? (
      removeIcon && this.handleActionIconRender(
        removeIcon,
        () => this.handleClose(file),
        locale.removeFile,
      )
    ) || (
      <DeleteOutlined title={locale.removeFile} onClick={() => this.handleClose(file)} />
    ) : null;

    const customDownloadIcon = showDownloadIcon && file.status === 'done' ? (
      downloadIcon && this.handleActionIconRender(
        downloadIcon,
        () => this.handleDownload(file),
        locale.downloadFile,
      )
    ) || (
      <DeleteOutlined
        title={locale.downloadFile}
        onClick={() => this.handleDownload(file)}
      />
    ) : null;
    const downloadOrDelete = listType !== 'picture-card' && (
      <span
        key="download-delete"
        className={`${prefixCls}-list-item-card-actions ${
          listType === 'picture' ? 'picture' : ''
        }`}
      >
        {customDownloadIcon && (
          <a title={locale.downloadFile}>{customDownloadIcon}</a>
        )}
        {customRemoveIcon && (
          <a title={locale.removeFile}>{customRemoveIcon}</a>
        )}
      </span>
    );
    const listItemNameClass = classNames({
      [`${prefixCls}-list-item-name`]: true,
      [`${prefixCls}-list-item-name-icon-count-${
        [customDownloadIcon, customRemoveIcon].filter(x => x).length
      }`]: true,
    });
    const preview = file.url ? [
      <a
        key="view"
        target="_blank"
        rel="noopener noreferrer"
        className={listItemNameClass}
        title={file.name}
        {...linkProps}
        href={file.url}
        onClick={e => this.handlePreview(file, e)}
      >
        {file.name}
      </a>,
      downloadOrDelete,
    ] : [
      <span
        key="view"
        className={listItemNameClass}
        onClick={e => this.handlePreview(file, e)}
        title={file.name}
      >
        {file.name}
      </span>,
      downloadOrDelete,
    ];
    const style = {
      pointerEvents: 'none',
      opacity: 0.5,
    };
    const previewIcon = showPreviewIcon ? (
      <a
        href={file.url || file.thumbUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={file.url || file.thumbUrl ? undefined : style}
        onClick={e => this.handlePreview(file, e)}
        title={locale.previewFile}
      >
        <EyeOutlined style={{ color: 'white' }} />
      </a>
    ) : null;

    const actions = listType === 'picture-card' && file.status !== 'uploading' && (
      <span className={`${prefixCls}-list-item-actions`}>
        <DragHandle />
        {previewIcon}
        {file.status === 'done' && customDownloadIcon}
        {customRemoveIcon}
      </span>
    );

    let message;
    if (file.response && typeof file.response === 'string') {
      message = file.response;
    } else {
      message = (file.error && file.error.statusText) || locale.uploadError;
    }
    const iconAndPreview = (
      <span>
        {icon}
        {preview}
      </span>
    );
    const dom = (
      <div className={infoUploadingClass}>
        <div className={`${prefixCls}-list-item-info`}>{iconAndPreview}</div>
        {actions}
        <Animate transitionName="fade" component="">
          {progress}
        </Animate>
      </div>
    );
    const listContainerNameClass = classNames({
      [`${prefixCls}-list-picture-card-container`]: listType === 'picture-card',
    });
    return (
      <div key={file.uid} className={listContainerNameClass}>
        {file.status === 'error' ? <Tooltip title={message}>{dom}</Tooltip> : <span>{dom}</span>}
      </div>
    );
  }
}

UploadItem.propTypes = {
  file: PropTypes.object.isRequired,
  prefixCls: PropTypes.string,
  listType: PropTypes.string,
  progressAttr: PropTypes.any,
  showRemoveIcon: PropTypes.bool,
  removeIcon: PropTypes.any,
  locale: PropTypes.any,
  showDownloadIcon: PropTypes.bool,
  downloadIcon: PropTypes.any,
  showPreviewIcon: PropTypes.bool
}