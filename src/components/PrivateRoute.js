import React from 'react';
import { Redirect, Route } from 'react-router-dom';

import { connect } from 'react-redux';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => (!rest.apiToken && props.location.pathname !== '/login') ? (
      <Redirect from={props.location.pathname} to="/login" />
    ) : (
      <Component {...props} />
    )}
  />
);

const mapStateToProps = ({ auth }) => ({
  apiToken: auth.apiToken
});

export default connect(mapStateToProps)(PrivateRoute);