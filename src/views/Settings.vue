<template>
  <v-container>
    <v-switch v-model="darkMode" label="Dark Mode"></v-switch>
  </v-container>
</template>

<script>
export default {
  name: "Settings",

  data: () => ({
    darkMode: false,
  }),
};
</script>

<style>
</style>