import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Layout, Menu, PageHeader } from 'antd';
import {
  CameraOutlined,
  CreditCardOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  PieChartOutlined,
  StarOutlined,
  TagOutlined,
  UserOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import qs from 'qs';

import Chat from './components/Chat';

const { Content, Sider } = Layout;

export const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 }
  }
};

const menus = [{
  path: '/',
  icon: <PieChartOutlined />,
  title: 'Dashboard'
},{
  path: '/users',
  icon: <UserOutlined />,
  title: 'Users'
},{
  path: '/destinations',
  icon: <EnvironmentOutlined />,
  title: 'Destinations'
},{
  path: '/stories',
  icon: <CameraOutlined />,
  title: 'Stories'
},{
  path: '/article_categories',
  icon: <TagOutlined />,
  title: 'Article Categories'
},{
  path: '/articles',
  icon: <FileTextOutlined />,
  title: 'Articles'
},{
  path: '/experience_categories',
  icon: <StarOutlined />,
  title: 'Experience Categories'
},{
  path: '/experiences',
  icon: <CameraOutlined />,
  title: 'Experiences'
},{
  path: '/trips',
  icon: <CreditCardOutlined />,
  title: 'Trips'
},{
  path: '/about',
  icon: <VideoCameraOutlined />,
  title: 'About'
}];

const getCurrentPath = (path) => {
  const found = menus.find(item => {
    if (!item.icon) {
      return false;
    }
    if (item.path === '/') {
      return path === '/';
    }
    return path.startsWith(item.path);
  });
  return found ? found.path : path;
}

const getCurrentTitle = (path) => {
  const found = menus.find(item => {
    if (!item.icon) {
      return false;
    }
    if (item.path === '/') {
      return path === '/';
    }
    return path.startsWith(item.path);
  });
  return found ? found.title : '';
}

export const withMenuBar = (Component) => ({
  children,
  ...props
}) => (
  <Layout style={{ overflow: 'hidden', height: '100vh' }}>
    <Sider
      breakpoint="lg"
      collapsedWidth={0}
      onBreakpoint={broken => console.log(broken)}
      onCollapse={(collapsed, type) => console.log(collapsed, type)}
      className="custom-scrollbar"
      style={{ overflowY: 'scroll' }}
    >
      <div className="logo tahu">Kiwano</div>
      <Menu theme="dark" mode="inline" selectedKeys={[getCurrentPath(props.match.path)]}>
        {menus.map((item) => (
          <Menu.Item key={item.path}>
            <Link to={item.path}>
              {item.icon}
              <span className="nav-text">{item.title}</span>
            </Link>
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
    <Layout>
      <PageHeader
        style={{ border: '1px solid rgb(235, 237, 240)', background: 'white', marginRight: 71 }}
        title={getCurrentTitle(props.match.path)}
        extra={[(
          <Button key="1" type="primary" onClick={() => {
            localStorage.removeItem('api.token');
            window.location.reload(false);
          }}>Logout</Button>
        )]}
      />
      <Content className="custom-scrollbar" style={{ overflowY: 'scroll', padding: '24px 16px 0', marginRight: 71 }}>
        <Component {...props}>{children}</Component>
      </Content>
    </Layout>
    <Chat />
  </Layout>
)

export const getImageURL = (path, thumbnail, width, height) => {
  if (!path) {
    return path;
  }
  if (/^[a-z0-9]+:\/\//.test(path)) {
    /* http:// */
    /* https:// */
    return path;
  }
  let result = `${process.env.REACT_APP_API_ENDPOINT}/media/${btoa(path)}`;
  const params = {};
  if (thumbnail) {
    params.thumbnail = true;
    if (width) {
      params.width = width;
      if (height) {
        params.height = height;
      }
    }
  }
  const query = qs.stringify(params);
  if (query !== '') {
    result += '?' + query;
  }
  return result;
}