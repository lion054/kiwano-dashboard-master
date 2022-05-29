import React, { Component } from 'react';
import RcUpload from 'rc-upload';
import classNames from 'classnames';
import UploadList from './UploadList';
import { UploadProps } from 'antd/es/upload/interface';
import { T, fileToObject, getFileItem, removeFileItem } from 'antd/es/upload/utils';
import LocaleReceiver from 'antd/es/locale-provider/LocaleReceiver';
import defaultLocale from 'antd/es/locale/default';
import { ConfigConsumer } from 'antd/es/config-provider';
// import warning from 'antd/es/_util/warning';

export { UploadProps };

class Upload extends Component {
  static getDerivedStateFromProps(nextProps) {
    if ('fileList' in nextProps) {
      return {
        fileList: nextProps.fileList || [],
      };
    }
    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
      fileList: props.fileList || props.defaultFileList || [],
      dragState: 'drop',
    };

    // warning(
    //   'fileList' in props || !('value' in props),
    //   'Upload',
    //   '`value` is not validate prop, do you mean `fileList`?',
    // );
  }

  onStart = (file) => {
    const { fileList } = this.state;
    const targetItem = fileToObject(file);
    targetItem.status = 'uploading';

    const nextFileList = fileList.concat();

    const fileIndex = nextFileList.findIndex(({ uid }) => uid === targetItem.uid);
    if (fileIndex === -1) {
      nextFileList.push(targetItem);
    } else {
      nextFileList[fileIndex] = targetItem;
    }

    this.onChange({
      file: targetItem,
      fileList: nextFileList,
    });
  }

  onSuccess = (response, file, xhr) => {
    try {
      if (typeof response === 'string') {
        response = JSON.parse(response);
      }
    } catch (e) {
      /* do nothing */
    }
    const { fileList } = this.state;
    const targetItem = getFileItem(file, fileList);
    // removed
    if (!targetItem) {
      return;
    }
    targetItem.status = 'done';
    targetItem.response = response;
    targetItem.xhr = xhr;
    this.onChange({
      file: { ...targetItem },
      fileList,
    });
  }

  onProgress = (e, file) => {
    const { fileList } = this.state;
    const targetItem = getFileItem(file, fileList);
    // removed
    if (!targetItem) {
      return;
    }
    targetItem.percent = e.percent;
    this.onChange({
      event: e,
      file: { ...targetItem },
      fileList,
    });
  }

  onError = (error, response, file) => {
    const { fileList } = this.state;
    const targetItem = getFileItem(file, fileList);
    // removed
    if (!targetItem) {
      return;
    }
    targetItem.error = error;
    targetItem.response = response;
    targetItem.status = 'error';
    this.onChange({
      file: { ...targetItem },
      fileList,
    });
  }

  handleRemove = (file) => {
    const { onRemove } = this.props;
    const { fileList } = this.state;

    Promise.resolve(typeof onRemove === 'function' ? onRemove(file) : onRemove).then(ret => {
      // Prevent removing file
      if (ret === false) {
        return;
      }

      const removedFileList = removeFileItem(file, fileList);

      if (removedFileList) {
        file.status = 'removed';

        if (this.upload) {
          this.upload.abort(file);
        }

        this.onChange({
          file,
          fileList: removedFileList,
        });
      }
    });
  }

  onChange = (info) => {
    if (!('fileList' in this.props)) {
      this.setState({ fileList: info.fileList });
    }

    const { onChange } = this.props;
    if (onChange) {
      onChange({
        ...info,
        fileList: [...info.fileList],
      });
    }
  }

  onFileDrop = (e) => this.setState({
    dragState: e.type,
  })

  beforeUpload = (file, fileList) => {
    const { beforeUpload } = this.props;
    const { fileList: stateFileList } = this.state;
    if (!beforeUpload) {
      return true;
    }
    const result = beforeUpload(file, fileList);
    if (result === false) {
      // Get unique file list
      const uniqueList = [];
      stateFileList.concat(fileList.map(fileToObject)).forEach(f => {
        if (uniqueList.every(uf => uf.uid !== f.uid)) {
          uniqueList.push(f);
        }
      });

      this.onChange({
        file,
        fileList: uniqueList,
      });
      return false;
    }
    if (result && result.then) {
      return result;
    }
    return true;
  }

  onSort = (oldIndex, newIndex) => this.props.onSort && this.props.onSort(oldIndex, newIndex)

  renderUploadList = (locale) => {
    const {
      showUploadList,
      listType,
      onPreview,
      onDownload,
      previewFile,
      disabled,
      locale: propLocale,
      iconRender
    } = this.props;
    const {
      showRemoveIcon,
      showPreviewIcon,
      showDownloadIcon,
      removeIcon,
      downloadIcon,
    } = showUploadList;
    const { fileList } = this.state;
    return (
      <UploadList
        listType={listType}
        items={fileList}
        previewFile={previewFile}
        onPreview={onPreview}
        onDownload={onDownload}
        onRemove={this.handleRemove}
        showRemoveIcon={!disabled && showRemoveIcon}
        showPreviewIcon={showPreviewIcon}
        showDownloadIcon={showDownloadIcon}
        removeIcon={removeIcon}
        downloadIcon={downloadIcon}
        iconRender={iconRender}
        locale={{ ...locale, ...propLocale }}
        onSort={this.onSort}
      />
    );
  };

  renderUpload = ({ getPrefixCls, direction }) => {
    const {
      prefixCls: customizePrefixCls,
      className,
      showUploadList,
      listType,
      type,
      disabled,
      children,
      style,
    } = this.props;
    const { fileList, dragState } = this.state;

    const prefixCls = getPrefixCls('upload', customizePrefixCls);

    const rcUploadProps = {
      onStart: this.onStart,
      onError: this.onError,
      onProgress: this.onProgress,
      onSuccess: this.onSuccess,
      ...this.props,
      prefixCls,
      beforeUpload: this.beforeUpload,
    };

    delete rcUploadProps.className;
    delete rcUploadProps.style;

    const uploadList = showUploadList ? (
      <LocaleReceiver componentName="Upload" defaultLocale={defaultLocale.Upload}>
        {this.renderUploadList}
      </LocaleReceiver>
    ) : null;

    if (type === 'drag') {
      const dragCls = classNames(
        prefixCls,
        {
          [`${prefixCls}-drag`]: true,
          [`${prefixCls}-drag-uploading`]: fileList.some(file => file.status === 'uploading'),
          [`${prefixCls}-drag-hover`]: dragState === 'dragover',
          [`${prefixCls}-disabled`]: disabled,
        },
        className,
      );
      return (
        <span>
          <div
            className={dragCls}
            onDrop={this.onFileDrop}
            onDragOver={this.onFileDrop}
            onDragLeave={this.onFileDrop}
            style={style}
          >
            <RcUpload {...rcUploadProps} ref={c => this.upload = c} className={`${prefixCls}-btn`}>
              <div className={`${prefixCls}-drag-container`}>{children}</div>
            </RcUpload>
          </div>
          {uploadList}
        </span>
      );
    }

    const uploadButtonCls = classNames(prefixCls, {
      [`${prefixCls}-select`]: true,
      [`${prefixCls}-select-${listType}`]: true,
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-rtl`]: direction === 'rtl',
    });

    // Remove id to avoid open by label when trigger is hidden
    // https://github.com/ant-design/ant-design/issues/14298
    // https://github.com/ant-design/ant-design/issues/16478
    if (!children || disabled) {
      delete rcUploadProps.id;
    }

    const uploadButton = (
      <div className={uploadButtonCls} style={children ? undefined : { display: 'none' }}>
        <RcUpload {...rcUploadProps} ref={c => this.upload = c} />
      </div>
    );

    if (listType === 'picture-card') {
      return (
        <span className={classNames(className, `${prefixCls}-picture-card-wrapper`)}>
          {uploadList}
          {uploadButton}
        </span>
      );
    }

    return (
      <span className={className}>
        {uploadButton}
        {uploadList}
      </span>
    );
  }

  render = () => (
    <ConfigConsumer>{this.renderUpload}</ConfigConsumer>
  )
}

Upload.defaultProps = {
  type: 'select',
  multiple: false,
  action: '',
  data: {},
  accept: '',
  beforeUpload: T,
  showUploadList: true,
  listType: 'text', // or picture
  className: '',
  disabled: false,
  supportServerRender: true,
};

export default Upload;