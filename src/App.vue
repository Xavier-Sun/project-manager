<template>
  <v-app>
    <v-navigation-drawer permanent app>
      <v-list>
        <v-list-item-group>
          <v-list-item
            v-for="(page, index) in pages"
            :key="index"
            :to="page.path"
            link
          >
            <v-list-item-icon>
              <v-icon>{{ page.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ page.text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    pages: [
      {
        icon: "mdi-home",
        text: "Home",
        path: "/",
      },
      {
        icon: "mdi-cog",
        text: "Settings",
        path: "/settings",
      },
    ],
  }),
};
</script>

<style scoped>
</style>
