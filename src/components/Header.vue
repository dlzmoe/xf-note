<template>
  <div class="header">
    <img src="/src/assets/images/logo.webp" alt="logo">
  </div>
</template>

<script>
export default {
  name: 'Header'
}
</script>

<style>
.header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
}

.header img {
  height: 40px;
  width: auto;
  object-fit: contain;
}
</style>