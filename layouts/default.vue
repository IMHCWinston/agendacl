<!-- Set a layout for all your pages,  The pages itself will replace the <Nuxt /> Component-->
<template>
  <div>
    <Nuxt />
  </div>
</template>

<style>

#__nuxt {
  width:100%
}

html {
  font-family:
    'Source Sans Pro',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
  scroll-behavior: smooth;
  overflow-y:auto;
}
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-thumb {
  background: #b0b0b0;
  border-radius: 7px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}

</style>
