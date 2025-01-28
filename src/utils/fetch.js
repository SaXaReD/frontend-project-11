import axios from 'axios';
import proxy from './proxy.js';

export default (url) => axios.get(proxy(url));
