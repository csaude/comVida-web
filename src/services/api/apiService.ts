import axios, { AxiosInstance, AxiosRequestHeaders } from 'axios';
import EncryptionManager from 'src/utils/EncryptionManager';

// Function to encode credentials for Basic Authentication
function getBasicAuthHeader(username: string, password: string): string {
  const credentials = `${username}:${password}`;
  return `Basic ${btoa(credentials)}`;
}

// Create Axios instance without baseURL (will be dynamically set)
const instance: AxiosInstance = axios.create({
  responseType: 'json',
  validateStatus(status) {
    return status >= 200 && status < 300;
  },
});

// Request interceptor to add dynamic baseURL and authorization headers
instance.interceptors.request.use(
  (request) => {
    // Retrieve facility from session storage
    const facilityData = sessionStorage.getItem('selectedFacility');
    const facility = facilityData ? JSON.parse(facilityData) : null;

    if (!facility || !facility.value.url) {
      throw new Error('Facility URL not found in session storage.');
    }

    // Set dynamic baseURL
    request.baseURL = `${facility.value.url}/ws/rest/v1`;

    if (request.url?.startsWith('http://') || request.url?.startsWith('https://')) {
      // Do not modify the baseURL for full URLs
      request.baseURL = '';
    }

    // Retrieve and decrypt username and password
    const username = EncryptionManager.getDecryptedSessionItem('username');
    const password = EncryptionManager.getDecryptedSessionItem('password');

    if (username && password) {
      // Add Authorization header for Basic Authentication
      request.headers = {
        ...request.headers,
        Accept: 'application/json',
        Authorization: getBasicAuthHeader(username, password),
      } as AxiosRequestHeaders;
    }

    return request;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors or session timeout
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized access - possibly due to expired credentials.');
      // Handle unauthorized access, e.g., redirect to login or logout
    }
    return Promise.reject(error);
  }
);

export default instance;
