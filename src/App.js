import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import * as firebase from 'firebase';
import { Spin } from 'antd';

import 'antd/dist/antd.css';
import 'react-phone-input-2/lib/style.css';
import 'react-quill/dist/quill.snow.css';
import './App.css';
import './scrollbar.css';

import store from './controllers/store';

import SignIn from './scenes/SignIn';
import NotFound from './scenes/NotFound';

import Dashboard from './scenes/Dashboard';
import UserList from './scenes/user/UserList';
import NewUser from './scenes/user/NewUser';
import EditUser from './scenes/user/EditUser';
import DestinationList from './scenes/destination/DestinationList';
import NewDestination from './scenes/destination/NewDestination';
import EditDestination from './scenes/destination/EditDestination';
import StoryList from './scenes/story/StoryList';
import NewStory from './scenes/story/NewStory';
import EditStory from './scenes/story/EditStory';
import ArticleCategoryList from './scenes/article_category/ArticleCategoryList';
import NewArticleCategory from './scenes/article_category/NewArticleCategory';
import EditArticleCategory from './scenes/article_category/EditArticleCategory';
import ArticleList from './scenes/article/ArticleList';
import NewArticle from './scenes/article/NewArticle';
import EditArticle from './scenes/article/EditArticle';
import ExperienceCategoryList from './scenes/experience_category/ExperienceCategoryList';
import NewExperienceCategory from './scenes/experience_category/NewExperienceCategory';
import EditExperienceCategory from './scenes/experience_category/EditExperienceCategory';
import ExperienceList from './scenes/experience/ExperienceList';
import NewExperience from './scenes/experience/NewExperience';
import EditExperience from './scenes/experience/EditExperience';
import TripList from './scenes/trip/TripList';
import ViewTrip from './scenes/trip/ViewTrip';
import About from './scenes/About';

import PrivateRoute from './components/PrivateRoute';

import { apiRequest } from './controllers/api/actions';
import { authLogin } from './controllers/auth/actions';
import { openSocket } from './controllers/socket/actions';

const routes = [{
  path: '/',
  component: Dashboard
},{
  path: '/users',
  component: UserList
},{
  path: '/users/new',
  component: NewUser
},{
  path: '/users/edit/:id',
  component: EditUser
},{
  path: '/destinations',
  component: DestinationList
},{
  path: '/destinations/new',
  component: NewDestination
},{
  path: '/destinations/edit/:id',
  component: EditDestination
},{
  path: '/stories',
  component: StoryList
},{
  path: '/stories/new',
  component: NewStory
},{
  path: '/stories/edit/:id',
  component: EditStory
},{
  path: '/article_categories',
  component: ArticleCategoryList
},{
  path: '/article_categories/new',
  component: NewArticleCategory
},{
  path: '/article_categories/edit/:id',
  component: EditArticleCategory
},{
  path: '/articles',
  component: ArticleList
},{
  path: '/articles/new',
  component: NewArticle
},{
  path: '/articles/edit/:id',
  component: EditArticle
},{
  path: '/experience_categories',
  component: ExperienceCategoryList
},{
  path: '/experience_categories/new',
  component: NewExperienceCategory
},{
  path: '/experience_categories/edit/:id',
  component: EditExperienceCategory
},{
  path: '/experiences',
  component: ExperienceList
},{
  path: '/experiences/new',
  component: NewExperience
},{
  path: '/experiences/edit/:id',
  component: EditExperience
},{
  path: '/trips',
  component: TripList
},{
  path: '/trips/view/:id',
  component: ViewTrip
},{
  path: '/about',
  component: About
}];

export default class App extends Component {
  state = {
    loading: true
  }

  apiToken = ''

  componentDidMount() {
    const firebaseConfig = {
      apiKey: "AIzaSyAMjgPzoH20IacKYSdzylSt1RXzeC5PoXU",
      authDomain: "kiwano-app.firebaseapp.com",
      databaseURL: "https://kiwano-app.firebaseio.com",
      projectId: "kiwano-app",
      storageBucket: "kiwano-app.appspot.com",
      messagingSenderId: "964178344700",
      appId: "1:964178344700:web:674cff306c06e4a7233579"
    };
    firebase.initializeApp(firebaseConfig);

    this.unsubscribe = store.subscribe(this.watchToken);

    const apiToken = localStorage.getItem('api.token');
    store.dispatch(apiRequest({
      url: '/auth/verify',
      method: 'GET',
      accessToken: apiToken,
      onSuccess: (user) => {
        store.dispatch(authLogin(user, apiToken));
        // store.dispatch(openSocket());
      },
      onError: () => this.setState({ loading: false })
    }));
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  watchToken = () => {
    const { auth } = store.getState();
    if (!this.apiToken && !!auth.apiToken) {
      this.apiToken = auth.apiToken;
      this.setState({ loading: false });
    }
  }

  render = () => this.state.loading ? (
    <div style={{
      width: '100wh',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Spin />
    </div>
  ) : (
    <Provider store={store}>
      <BrowserRouter basename={process.env.REACT_APP_PUBLIC_BASE}>
        <div className="App">
          <Switch>
            <Route exact path="/login" component={SignIn} />
            {routes.map((item, index) => (
              <PrivateRoute key={index} exact path={item.path} component={item.component} />
            ))}
            <Route path="*" component={NotFound} />
          </Switch>
        </div>
      </BrowserRouter>
    </Provider>
  )
}