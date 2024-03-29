<template>
  <div>
    <v-switch v-model="darkMode" label="Dark Mode"></v-switch>

    <v-divider></v-divider>

    <v-data-table
      :headers="headers"
      :items="labels"
      disable-pagination
      hide-default-footer
    >
      <template #top>
        <v-toolbar flat>
          <v-toolbar-title> Labels </v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="createLabel"> New Label </v-btn>
          <v-dialog v-model="dialogEditCommand" max-width="500px">
            <v-card>
              <v-card-title class="text-h5"> Edit Command </v-card-title>
              <v-card-text>
                <v-form>
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          v-model="editedCommand.name"
                          label="Name"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-textarea
                          v-model="editedCommand.script"
                          label="Script"
                        ></v-textarea>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-form>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue" text @click="closeDialogEditCommand">
                  Cancel
                </v-btn>
                <v-btn color="red" text @click="deleteEditedCommand">
                  Delete
                </v-btn>
                <v-btn color="blue" text @click="saveEditedCommand">
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDeleteLabel" max-width="500px">
            <v-card>
              <v-card-title class="text-h5">
                Are you sure you want to delete this label?
              </v-card-title>
              <v-card-text>
                <v-checkbox
                  v-model="deleteCompletely"
                  label="Remove this label from all projects at the same time"
                ></v-checkbox>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue" text @click="closeDialogDeleteLabel">
                  Cancel
                </v-btn>
                <v-btn color="red" text @click="deleteLabelConfirm">
                  Delete
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template #[`item.name`]="{ item }">
        <v-edit-dialog
          :return-value.sync="item.name"
          @save="$store.set('userData.labels', labels)"
        >
          {{ item.name }}
          <template #input>
            <v-text-field
              v-model="item.name"
              label="Name"
              single-line
            ></v-text-field>
          </template>
        </v-edit-dialog>
      </template>
      <template #[`item.commands`]="{ item }">
        <v-chip-group>
          <v-chip
            v-for="(command, index) in item.commands"
            :key="index"
            @click="editCommand(item, index)"
          >
            {{ command.name }}
          </v-chip>
          <v-chip @click="createAndEditCommand(item)"> + </v-chip>
        </v-chip-group>
      </template>
      <template #[`item.actions`]="{ item }">
        <v-icon small @click="deleteLabel(item)"> mdi-delete </v-icon>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  name: "Settings",

  data: () => ({
    labels: [],
    languages: [],

    headers: [
      { text: "Name", value: "name" },
      { text: "Commands", value: "commands", sortable: false },
      { text: "", value: "actions", sortable: false },
    ],

    dialogEditCommand: false,
    dialogDeleteLabel: false,

    deleteCompletely: false,

    editedLabelIndex: -1,
    editedLabel: {
      name: "New Label",
      commands: [],
    },
    defaultLabel: {
      name: "New Label",
      commands: [],
    },

    editedCommandIndex: -1,
    editedCommand: {
      name: "New Command",
      script: "",
    },
    defaultCommand: {
      name: "New Command",
      script: "",
    },
  }),

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

  mounted() {
    this.labels = this.$store.get("userData.labels");
    this.languages = this.$store.get("userData.languages");
  },

  watch: {
    dialogDeleteLabel(value) {
      value || this.closeDialogDeleteLabel();
    },
    dialogEditCommand(value) {
      value || this.closeDialogEditCommand();
    },
  },

  methods: {
    storeLabels() {
      this.$store.set("userData.labels", this.labels);
    },
    storeLanguages() {
      this.$store.set("userData.languages", this.languages);
    },

    createLabel() {
      this.labels.push(this.defaultLabel);
      this.storeLabels();
    },

    closeDialogDeleteLabel() {
      this.dialogDeleteLabel = false;
      this.$nextTick(() => {
        this.editedLabelIndex = -1;
        this.editedLabel = Object.assign({}, this.defaultLabel);
      });
    },

    deleteLabel(label) {
      this.editedLabelIndex = this.labels.indexOf(label);
      this.editedLabel = Object.assign({}, label);
      this.dialogDeleteLabel = true;
    },

    deleteLabelConfirm() {
      this.labels.splice(this.editedLabelIndex, 1);

      if (this.deleteCompletely) {
        let labelName = this.editedLabel.name;
        let myProjects = this.$store.get("userData.myProjects");
        myProjects.forEach((project) => {
          project.labels = project.labels.filter((label) => {
            return label !== labelName;
          });
        });
        this.$store.set("userData.myProjects", myProjects);
      }

      this.storeLabels();
      this.closeDialogDeleteLabel();
    },

    closeDialogEditCommand() {
      this.dialogEditCommand = false;
      this.$nextTick(() => {
        this.editedLabelIndex = -1;
        this.editedLabel = Object.assign({}, this.defaultLabel);
        this.editedCommandIndex = -1;
        this.editedCommand = Object.assign({}, this.defaultCommand);
      });
    },

    createAndEditCommand(label) {
      this.editedLabelIndex = this.labels.indexOf(label);
      this.labels[this.editedLabelIndex].commands.push(this.defaultCommand);
      this.storeLabels();
      this.editCommand(
        label,
        this.labels[this.editedLabelIndex].commands.length - 1
      );
    },

    editCommand(label, commandIndex) {
      this.editedLabelIndex = this.labels.indexOf(label);
      this.editedLabel = Object.assign({}, label);
      this.editedCommandIndex = commandIndex;
      this.editedCommand = Object.assign(
        {},
        label.commands[this.editedCommandIndex]
      );
      this.dialogEditCommand = true;
    },

    deleteEditedCommand() {
      this.labels[this.editedLabelIndex].commands.splice(
        this.editedCommandIndex,
        1
      );
      this.storeLabels();
      this.closeDialogEditCommand();
    },

    saveEditedCommand() {
      this.editedLabel.commands[this.editedCommandIndex] = Object.assign(
        {},
        this.editedCommand
      );
      this.$set(this.labels, this.editedLabelIndex, this.editedLabel);
      this.storeLabels();
      this.closeDialogEditCommand();
    },
  },
};
</script>

<style scoped>
</style>