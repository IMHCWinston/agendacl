/* eslint-disable no-console */
export default function({ $axios, env }) {
  $axios.setBaseURL(env.baseURL || $axios.defaults.baseURL)
  $axios.onError((error) => {
    if (error.message) {
      console.log(error.message);
    }
    if (error) { return Promise.resolve(false); }
  })
}
