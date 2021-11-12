<template>
  <v-container>
    <v-switch v-model="darkMode" label="Dark Mode"></v-switch>
  </v-container>
</template>

<script>
export default {
  name: "Settings",

  computed: {
    darkMode: {
      get() {
        return this.$vuetify.theme.dark;
      },
      set(newValue) {
        this.$vuetify.theme.dark = newValue;
        this.$store.set("settings.darkMode", newValue);
      },
    },
  },
};
</script>

<style>
</style>