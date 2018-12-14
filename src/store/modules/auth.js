/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import Vue from 'vue';
import { AUTH_LOGIN, AUTH_LOGOUT } from '../actions/auth';
import { PROFILE_LOAD } from '../actions/profile';
import { getToken, setToken, removeToken } from '../../utils/token';

const AUTH_REQUEST_MUT = 'AUTH_REQUEST_MUT';
const AUTH_SUCCESS_MUT = 'AUTH_SUCCESS_MUT';
const AUTH_ERROR_MUT = 'AUTH_ERROR_MUT';
const AUTH_LOGOUT_MUT = 'AUTH_LOGOUT_MUT';
const AUTH_CLEAR_MUT = 'AUTH_CLEAR_MUT';

const initialState = {
  token: getToken() || '',
  status: '',
  errorMessage: '',
};

const mutations = {
  [AUTH_REQUEST_MUT]: state => state.status = 'PENDING',
  [AUTH_SUCCESS_MUT]: (state, token) => {
    state.status = 'SUCCESS';
    state.token = token;
  },
  [AUTH_ERROR_MUT]: (state, message) => {
    state.status = 'ERROR';
    state.errorMessage = message;
  },
  [AUTH_LOGOUT_MUT]: (state) => {
    state.token = '';
  },
  [AUTH_CLEAR_MUT]: (state) => {
    state.status = '';
    state.errorMessage = '';
  },
};

const getters = {
  isLoggedIn: state => state.token !== '',
  authStatus: state => state.status,
  // getTokenAuthHeaderValue: state => state.token ? `Bearer ${state.token}` : null  // TO-DO
};

const actions = {
  [AUTH_LOGIN]: ({ commit, dispatch, getters }, credentials) => {
    if (getters.isLoggedIn) {
      commit(AUTH_LOGOUT_MUT);
    }

    commit(AUTH_REQUEST_MUT);

    return Vue.axios.post('users/login', credentials)
      .then((response) => {
        if (response.status !== 200) {
          throw new Error(`Some netwotk problem, response status: ${response.status}`);
        }
        const token = response.data.access_token;
        setToken(token);
        commit(AUTH_SUCCESS_MUT, token);
        dispatch(PROFILE_LOAD);
        return response;
      })
      .catch((err) => {
        commit(AUTH_ERROR_MUT, err.message);
        throw new Error(err.message);
      });
  },
  [AUTH_LOGOUT]: ({ commit }) => {
    commit(AUTH_LOGOUT_MUT);
    commit(AUTH_CLEAR_MUT);
    removeToken();
  },
};

export default {
  state: initialState,
  actions,
  mutations,
  getters,
};
