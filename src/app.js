import _ from 'lodash';
import axios from 'axios';
import * as yup from 'yup';
import fetchData from './utils/fetch.js';
import initView from './view/view.js';
import getFeedAndPosts from './parser.js';

export default () => {
  const elements = {
    form: document.querySelector('#url-form'),
    input: document.querySelector('#url-input'),
    button: document.querySelector('#url-submit'),
    feedbackContainer: document.querySelector('.feedback'),
    postsContainer: document.querySelector('#posts'),
    feedsContainer: document.querySelector('#feeds'),
    modal: {
      title: document.querySelector('.modal-title'),
      body: document.querySelector('.modal-body'),
      footer: document.querySelector('.modal-footer'),
    },
    spanSpinner: document.createElement('span'),
    spanLoading: document.createElement('span'),
  };

  const initialState = {
    rssForm: {
      isValid: true,
      error: null,
    },
    loadingStatus: {
      state: '',
      error: null,
    },
    feeds: [],
    posts: [],
    uiStatus: {
      visitedPosts: new Set(),
      modalId: null,
    },
  };

  const watchedState = initView(initialState, elements);

  yup.setLocale({
    mixed: {
      required: 'form.errors.required',
      notOneOf: 'form.errors.existingUrl',
    },
    string: {
      url: 'form.errors.invalidUrl',
    },
  });

  const validateUrl = (url, urlList) => {
    const schema = yup
      .string()
      .required()
      .url()
      .notOneOf(urlList);

    return schema.validate(url)
      .then(() => null)
      .catch((error) => error.message);
  };

  const updatePosts = () => {
    const { feeds, posts } = watchedState;
    const promises = feeds.map(({ url, id }) => fetchData(url)
      .then(({ data }) => {
        const [, receivedPosts] = getFeedAndPosts(data.contents);
        const oldPosts = posts.filter((post) => post.feedId === id);
        const addedPosts = _.differenceBy(receivedPosts, oldPosts, 'link');
        if (addedPosts.length !== 0) {
          const newPosts = addedPosts.map((post) => ({ ...post, id: _.uniqueId(), feedId: id }));
          watchedState.posts = [...newPosts, ...posts];
        }
      })
      .catch(console.error));
    Promise.all(promises)
      .finally(() => setTimeout(() => updatePosts(watchedState), 10000));
  };

  const fetchAndProcessFeed = (url) => {
    watchedState.loadingStatus.state = 'processing';
    watchedState.loadingStatus.error = null;
    fetchData(url)
      .then(({ data }) => {
        const [feed, posts] = getFeedAndPosts(data.contents);
        const newFeed = { ...feed, id: _.uniqueId(), url };
        const newPosts = posts.map((post) => ({ ...post, id: _.uniqueId(), feedId: newFeed.id }));

        watchedState.feeds = [newFeed, ...watchedState.feeds];
        watchedState.posts = [...newPosts, ...watchedState.posts];
        watchedState.loadingStatus.state = 'success';
      })
      .catch((err) => {
        if (axios.isAxiosError(err)) {
          watchedState.loadingStatus.error = 'form.errors.networkProblems';
        } else if (err === 'form.errors.invalidRss') {
          watchedState.rssForm.error = 'form.errors.invalidRss';
        } else {
          watchedState.rssForm.error = 'form.errors.unknownError';
        }
        watchedState.loadingStatus.state = 'failed';
      });
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.rssForm.isValid = true;
    watchedState.rssForm.error = null;
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const urls = watchedState.feeds.map((feed) => feed.url);
    validateUrl(url, urls)
      .then((err) => {
        if (err) {
          watchedState.rssForm.isValid = false;
          watchedState.rssForm.error = err;
          return;
        }
        fetchAndProcessFeed(url);
      });
  });

  elements.postsContainer.addEventListener('click', ({ target }) => {
    const { id } = target.dataset;

    if (id) {
      watchedState.uiStatus.visitedPosts.add(id);
      watchedState.uiStatus.modalId = id;
    }
  });

  updatePosts(watchedState);
};
