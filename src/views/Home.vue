<template>
  <v-data-table
    :headers="headers"
    :items="myProjects"
    disable-pagination
    hide-default-footer
  >
    <template #top>
      <v-toolbar flat>
        <v-toolbar-title>My Projects</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialogEdit" max-width="500px">
          <template #activator="{ on, attrs }">
            <v-btn color="primary" v-bind="attrs" v-on="on">
              Add Project
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>
            <v-card-text>
              <v-form v-model="isEditFormValid">
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        v-model="editedProject.name"
                        :rules="nameRules"
                        label="Name"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-combobox
                        v-model="editedProject.languages"
                        label="Language"
                        clearable
                        multiple
                        :items="languages"
                      ></v-combobox>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="editedProject.localPath"
                        label="Local Path"
                        append-icon="mdi-dots-horizontal"
                        @click:append="selectLocalPath(editedProject)"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-combobox
                        v-model="editedProject.labels"
                        label="Labels"
                        clearable
                        multiple
                        :items="labels"
                      ></v-combobox>
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue" text @click="closeEditDialog"> Cancel </v-btn>
              <v-btn
                color="blue"
                text
                :disabled="!isEditFormValid"
                @click="save"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title>
              Are you sure you want to remove this project? This will not delete
              local files.
            </v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue" text @click="closeDeleteDialog">
                Cancel
              </v-btn>
              <v-btn color="red" text @click="removeProjectConfirm">
                Remove
              </v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template #[`item.name`]="{ item }">
      <b>{{ item.name }}</b>
    </template>
    <template #[`item.languages`]="{ item }">
      <v-chip-group>
        <v-chip small v-for="language in item.languages" :key="language">
          {{ language }}
        </v-chip>
      </v-chip-group>
    </template>
    <template #[`item.lastAccessTime`]="{ item }">
      {{ item.lastAccessTime }}
    </template>
    <template #[`item.labels`]="{ item }">
      <v-chip-group>
        <v-chip small v-for="label in item.labels" :key="label">
          {{ label }}
        </v-chip>
      </v-chip-group>
    </template>
    <template #[`item.actions`]="{ item }">
      <v-menu bottom left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon> mdi-dots-vertical </v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item-group>
            <v-list-item v-for="(action, index) in defaultActions" :key="index">
              <v-list-item-title @click="action.method(item)">
                {{ action.description }}
              </v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-menu>
    </template>
    <template #no-data>
      <v-btn> Reset </v-btn>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: "Home",

  data: () => ({
    languages: [
      "C",
      "C++",
      "C#",
      "Rust",
      "Python",
      "Java",
      "JavaScript",
      "Maxscript",
    ],

    labels: [
      "NodeJS",
      "VueJS",
      "Unity",
      "UE4",
      "UE5",
      "Windows",
      "Linux",
      "Cross Platform",
      "CMake",
      "C",
      "C++",
    ],

    defaultActions: [],

    isEditFormValid: false,

    dialogEdit: false,
    dialogDelete: false,

    headers: [
      { text: "Name", value: "name", sortable: false },
      { text: "Languages", value: "languages", sortable: false },
      { text: "Last Access Time", value: "lastAccessTime" },
      { text: "Local Path", value: "localPath", sortable: false },
      { text: "Labels", value: "labels", sortable: false },
      { value: "actions", sortable: false },
    ],

    myProjects: [],

    editedIndex: -1,
    editedProject: {
      name: "New Project",
      languages: [],
      lastAccessTime: null,
      localPath: null,
      labels: [],
    },
    defaultProject: {
      name: "New Project",
      languages: [],
      lastAccessTime: null,
      localPath: null,
      labels: [],
    },

    nameRules: [
      (v) => !!v || "Name is required",
      (v) => (v && v.length <= 128) || "Name must be less than 128 characters",
    ],
  }),

  mounted() {
    this.defaultActions = [
      {
        icon: "mdi-pencil",
        description: "Edit",
        method: this.editProject,
      },
      {
        icon: "mdi-delete",
        description: "Remove",
        method: this.removeProject,
      },
      {
        icon: "mdi-folder",
        description: "Open in folder",
        method: this.openProjectInFolder,
      },
      {
        icon: "mdi-microsoft-visual-studio-code",
        description: "Open in Code",
        method: this.openProjectInCode,
      },
    ];

    this.myProjects = this.$store.get("userData.myProjects");
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Add" : "Edit";
    },
  },

  watch: {
    dialogEdit(value) {
      value || this.closeEditDialog();
    },
    dialogDelete(value) {
      value || this.closeDeleteDialog();
    },
  },

  methods: {
    removeProjectConfirm() {
      this.myProjects.splice(this.editedIndex, 1);
      this.closeDeleteDialog();

      this.writeToConfig();
    },

    closeEditDialog() {
      this.dialogEdit = false;
      this.$nextTick(() => {
        this.editedProject = Object.assign({}, this.defaultProject);
        this.editedIndex = -1;
      });
    },

    closeDeleteDialog() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedProject = Object.assign({}, this.defaultProject);
        this.editedIndex = -1;
      });
    },

    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.myProjects[this.editedIndex], this.editedProject);
      } else {
        this.myProjects.push(this.editedProject);
      }
      this.closeEditDialog();

      this.writeToConfig();
    },

    editProject(project) {
      this.editedIndex = this.myProjects.indexOf(project);
      this.editedProject = Object.assign({}, project);
      this.dialogEdit = true;
    },

    removeProject(project) {
      this.editedIndex = this.myProjects.indexOf(project);
      this.editedProject = Object.assign({}, project);
      this.dialogDelete = true;
    },

    openProjectInFolder(project) {
      if (project.localPath) {
        this.$electron.shell.openExternal(project.localPath);
      }
    },

    openProjectInCode(project) {
      if (project.localPath) {
        this.$exec(`code "${project.localPath}"`);
      }
    },

    selectLocalPath(project) {
      let directory = this.$electron.ipcRenderer.sendSync("select-directory");
      if (directory) {
        project.localPath = directory;
      }
    },

    writeToConfig() {
      this.$store.set("userData.myProjects", this.myProjects);
    },
  },
};
</script>

<style scoped>
</style>