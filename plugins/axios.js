/* eslint-disable no-console */
export default function({ $axios, redirect, env }) {
  console.log(env);
  $axios.setBaseURL($axios.defaults.baseURL)
  $axios.onError((error) => {
    if (error.message) {
      console.log(error.message);
    }
    if (error) { return Promise.resolve(false); }
  })
}
