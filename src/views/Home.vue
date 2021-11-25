<template>
  <v-data-table
    :headers="headers"
    :items="myProjects"
    :search="search"
    disable-pagination
    hide-default-footer
  >
    <template #top>
      <v-toolbar flat>
        <v-toolbar-title> My Projects </v-toolbar-title>
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
                        v-model="editedProject.directory"
                        label="Directory"
                        append-icon="mdi-dots-horizontal"
                        @click:append="selectDirectory(editedProject)"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="editedProject.name"
                        :rules="nameRules"
                        label="Name"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-select
                        v-model="editedProject.languages"
                        label="Language"
                        chips
                        clearable
                        multiple
                        :items="languages"
                      ></v-select>
                    </v-col>
                    <v-col cols="12">
                      <v-select
                        v-model="editedProject.labels"
                        label="Labels"
                        chips
                        clearable
                        multiple
                        :items="labelNames"
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue" text @click="closeDialogEdit"> Cancel </v-btn>
              <v-btn
                color="blue"
                text
                :disabled="!isEditFormValid"
                @click="saveEditedProject"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title>
              <p>Are you sure you want to remove this project?</p>
              <p>This will NOT delete local files.</p>
            </v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue" text @click="closeDialogDelete">
                Cancel
              </v-btn>
              <v-btn color="red" text @click="removeProjectConfirm">
                Remove
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
      <v-toolbar flat>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
          clearable
        ></v-text-field>
      </v-toolbar>
    </template>
    <template #[`item.name`]="{ item }">
      <span>{{ item.name }}</span>
    </template>
    <template #[`item.languages`]="{ item }">
      <v-chip-group>
        <v-chip v-for="(language, index) in item.languages" :key="index">
          {{ language }}
        </v-chip>
      </v-chip-group>
    </template>
    <template #[`item.lastAccessTime`]="{ item }">
      {{ item.lastAccessTime }}
    </template>
    <template #[`item.directory`]="{ item }">
      {{ item.directory }}
    </template>
    <template #[`item.labels`]="{ item }">
      <v-chip-group>
        <v-menu v-for="(label, index) in item.labels" :key="index">
          <template #activator="{ on, attrs }">
            <v-chip v-bind="attrs" v-on="on">
              {{ label }}
            </v-chip>
          </template>
          <v-list dense>
            <v-list-item-group>
              <v-list-item
                v-for="(command, index) in getCommands(label)"
                :key="index"
                @click="executeScript(item, command.script)"
              >
                <v-list-item-title>
                  {{ command.name }}
                </v-list-item-title>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-menu>
      </v-chip-group>
    </template>
    <template #[`item.actions`]="{ item }">
      <v-menu bottom left>
        <template #activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon> mdi-dots-vertical </v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item-group>
            <v-list-item
              v-for="(action, index) in defaultActions"
              :key="index"
              @click="action.do(item)"
            >
              <v-list-item-icon>
                <v-icon>
                  {{ action.icon }}
                </v-icon>
              </v-list-item-icon>
              <v-list-item-title>
                {{ action.label }}
              </v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-menu>
    </template>
  </v-data-table>
</template>

<script>
import child_process from "child_process";
import path from "path";
import electron from "electron";

export default {
  name: "Home",

  data: () => ({
    labels: [],
    languages: [],
    myProjects: [],

    headers: [
      { text: "Name", value: "name" },
      { text: "Languages", value: "languages", sortable: false },
      { text: "Last Access Time", value: "lastAccessTime" },
      { text: "Directory", value: "directory", sortable: false },
      { text: "Labels", value: "labels", sortable: false },
      { text: "", value: "actions", sortable: false },
    ],

    search: "",

    defaultActions: [],

    isEditFormValid: false,

    dialogEdit: false,
    dialogDelete: false,

    editedProjectIndex: -1,
    editedProject: {
      name: "New Project",
      languages: [],
      lastAccessTime: null,
      directory: null,
      labels: [],
    },
    defaultProject: {
      name: "New Project",
      languages: [],
      lastAccessTime: null,
      directory: null,
      labels: [],
    },

    nameRules: [
      (name) => !!name || "Name is required",
      (name) =>
        (name && name.length <= 128) || "Name must be less than 128 characters",
    ],
  }),

  computed: {
    labelNames() {
      return this.labels.map((label) => {
        return label.name;
      });
    },

    formTitle() {
      return this.editedProjectIndex === -1 ? "Add Project" : "Edit Project";
    },
  },

  mounted() {
    this.defaultActions = [
      {
        icon: "mdi-pencil",
        label: "Edit",
        do: this.editProject,
      },
      {
        icon: "mdi-delete",
        label: "Remove",
        do: this.removeProject,
      },
      {
        icon: "mdi-folder",
        label: "Open in folder",
        do: this.openProjectInFolder,
      },
      {
        icon: "mdi-microsoft-visual-studio-code",
        label: "Open in Visual Studio Code",
        do: this.openProjectInVisualStudioCode,
      },
    ];

    this.labels = this.$store.get("userData.labels");
    this.languages = this.$store.get("userData.languages");
    this.myProjects = this.$store.get("userData.myProjects");
  },

  watch: {
    dialogEdit(value) {
      value || this.closeDialogEdit();
    },
    dialogDelete(value) {
      value || this.closeDialogDelete();
    },
  },

  methods: {
    storeMyProjects() {
      this.$store.set("userData.myProjects", this.myProjects);
    },

    closeDialogDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedProjectIndex = -1;
        this.editedProject = Object.assign({}, this.defaultProject);
      });
    },

    removeProject(project) {
      this.editedProjectIndex = this.myProjects.indexOf(project);
      this.editedProject = Object.assign({}, project);
      this.dialogDelete = true;
    },

    removeProjectConfirm() {
      this.myProjects.splice(this.editedProjectIndex, 1);
      this.storeMyProjects();
      this.closeDialogDelete();
    },

    closeDialogEdit() {
      this.dialogEdit = false;
      this.$nextTick(() => {
        this.editedProjectIndex = -1;
        this.editedProject = Object.assign({}, this.defaultProject);
      });
    },

    editProject(project) {
      this.editedProjectIndex = this.myProjects.indexOf(project);
      this.editedProject = Object.assign({}, project);
      this.dialogEdit = true;
    },

    saveEditedProject() {
      if (this.editedProjectIndex > -1) {
        this.$set(this.myProjects, this.editedProjectIndex, this.editedProject);
      } else {
        this.myProjects.push(this.editedProject);
      }
      this.storeMyProjects();
      this.closeDialogEdit();
    },

    openProjectInFolder(project) {
      if (project.directory) {
        electron.shell.openExternal(project.directory);
      }
    },

    openProjectInVisualStudioCode(project) {
      if (project.directory) {
        child_process.exec(`code "${project.directory}"`);
      }
    },

    selectDirectory(project) {
      let directory = electron.ipcRenderer.sendSync("select-directory");
      if (directory) {
        project.directory = directory;
        if (project.name === this.defaultProject.name) {
          project.name = path.basename(directory);
        }
        let languages = electron.ipcRenderer.sendSync(
          "get-project-languages",
          project.directory
        );
        project.languages = languages;
      }
    },

    getCommands(labelName) {
      let label = this.getLabel(labelName);
      return label ? label.commands : [];
    },

    getLabel(labelName) {
      for (let i = 0; i < this.labels.length; ++i) {
        if (this.labels[i].name === labelName) {
          return this.labels[i];
        }
      }
      return null;
    },

    executeScript(project, script) {
      child_process.execSync(script, {
        cwd: project.directory,
        env: { PROJECT_NAME: project.name, PROJECT_DIR: project.directory },
      });
    },
  },
};
</script>

<style scoped>
</style>