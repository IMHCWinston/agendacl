export default function({ $axios, redirect }) {
  $axios.onError((error) => {
    if (error.message) {
      console.log(error.message);
    }
    if (error) { return Promise.resolve(false); }
  })
}
