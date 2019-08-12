<template>
  <div class="vue_app">
    <v-app>
      <v-toolbar app clipped-left dark color="primary">
        <v-toolbar-title class="white--text">Vue Localizer</v-toolbar-title>
        <v-chip v-if="$root.modified" label color="pink" text-color="white" class="ml-4" style="font-size: 18px;">Modified</v-chip>
      </v-toolbar>
      <v-content>
        <v-layout style="max-height: 100%;">
          <v-navigation-drawer app clipped>
            <v-layout row justify-center class="pt-2 pb-2 grey lighten-4">
              <v-btn color="success" @click="saveJson">Save JSON</v-btn>
              <v-btn color="primary">
                <label for="messages" style="cursor: pointer;">Load JSON</label>
              </v-btn>
            </v-layout>
            <!-- Filter by status -->
            <v-card flat>
              <v-toolbar dense color="primary" class="title white--text">Filter by status</v-toolbar>
              <v-card-text>
                <v-layout column align-center>
                  <v-radio-group v-model="filterBy" class="mt-0" hide-details>
                    <v-radio :value="1" label="Show all" hide-details />
                    <v-radio :value="2" label="Warning + problems only" hide-details />
                    <v-radio :value="3" label="Problems only" hide-details />
                  </v-radio-group>
                </v-layout>
              </v-card-text>
            </v-card>
            <v-divider />
            <!-- languages -->
            <v-form ref="new_lang" lazy-validation @submit.prevent="addLanguage">
              <v-layout class="pl-2 pr-1 grey lighten-3 align-center">
                <v-text-field v-model.trim="languageNew" :rules="[emptyName]" label="Add locale" single-line />
                <v-btn fab icon small color="warning" type="submit">
                  <v-icon small>add</v-icon>
                </v-btn>
              </v-layout>
            </v-form>
            <v-card flat>
              <v-card-text class="pt-0">
                <v-data-table :headers="langHeaders" :items="langList" class="striped_table" hide-actions>
                  <template slot="items" slot-scope="props">
                    <td>
                      <v-checkbox v-model="props.item.enabled" :label="props.item.title" primary hide-details />
                      <!--
                      <v-edit-dialog :return-value.sync="props.item.title" lazy @save="updateLanguage(props.index)">
                        {{ props.item.title }}
                        <v-text-field slot="input" v-model.trim="languageName" :rules="[emptyName]" label="Locale" single-line @focus="languageName = props.item.title" />
                      </v-edit-dialog>
                      -->
                    </td>
                    <td align="center" class="pl-1 pr-1 language_order">
                      <v-btn v-if="props.index" fab icon small color="primary" @click="langUp(props.index)">
                        <v-icon small>arrow_upward</v-icon>
                      </v-btn>
                      <v-btn v-if="props.index + 1 < langList.length" fab icon small color="primary" @click="langDown(props.index)">
                        <v-icon small>arrow_downward</v-icon>
                      </v-btn>
                    </td>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>

            <a ref="link" :href="jsonData" class="link-download" download="locales.json">JSON</a>
            <input id="messages" ref="file" type="file" accept="application/json" class="link-download" @change="importLocales">
          </v-navigation-drawer>
          <!-- Localized messages -->
          <v-flex>
            <v-layout column class="pa-3" style="max-height: 100%;">
              <div class="search_panel pb-2">
                <v-spacer>
                  <span class="white--text warning pl-2 pr-2 pt-1 pb-1 ml-3">HINT &mdash; click inside cells to edit localizations inline</span>
                </v-spacer>
                <v-text-field v-model.trim="search" append-icon="search" label="Search" single-line hide-details clearable class="pt-0 mt-0" @keydown.esc="search = ''"/>
                <v-spacer />
              </div>
              <v-data-table :headers="headers" :items="sortedItems" :search="search" class="striped_table cell_divide fixed_table" :rows-per-page-items="listSize" :pagination.sync="pagination">
                <template slot="items" slot-scope="props">
                  <td>
                    <v-icon v-if="props.item.error" color="error">error</v-icon>
                    <v-icon v-if="props.item.warn" color="brown">warning</v-icon>
                    {{ props.item.name }}
                  </td>
                  <td v-for="lang in langList.filter(item => item.enabled)" :key="lang.locale">
                    <v-edit-dialog :return-value.sync="props.item[lang.locale]" lazy large @save="updateMessage(props.item,lang.locale)">
                      {{ props.item.locales[lang.locale] }}
                      <v-text-field slot="input" v-model.trim="localization" label="Localization" single-line @focus="localization = props.item.locales[lang.locale]" />
                    </v-edit-dialog>
                  </td>
                </template>
              </v-data-table>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-content>
    </v-app>
  </div>
</template>

<script>
function strCompare (a, b)
{
  if (a == null) return 1;
  else if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (a.match(/^[+-]?[0-9]+(\.[0-9]+)?$/) && b.match(/^[+-]?[0-9]+(\.[0-9]+)?$/)) return a - b;
  if (a < b) return -1;
  else if (a > b) return 1;
  else return 0;
}

const prefixes = [];
let stringMap = {};

export default
{
  name: 'Main',
  data ()
  {
    return {
      jsonData: '', // used when exporting as JSON text
      messages: {},
      languageName: '',
      languageNew: '',
      langHeaders:
        [
          {
            text: 'Locales',
            class: 'subheading',
            sortable: false,
          },
          {
            text: 'Reorder',
            class: 'subheading',
            sortable: false,
            width: 120,
          }
        ],
      langList: [],
      filterBy: 1,
      stringList: [],
      headerFixed:
        {
          text: 'Identifier',
          class: 'subheading',
          sortable: false,
          value: 'name',
        },
      listSize: [10, 25, 50, 100],
      search: '',
      localization: '',
      pagination:
        {
          descending: false,
          sortBy: '',
          rowsPerPage: 50,
          page: 1,
          totalItems: 0,
        }
    }
  },
  computed:
    {
      sortedItems ()
      {
        const status = this.filterBy;
        return this.stringList.filter(item =>
        {
          switch (status)
          {
            case 2: // warnings + problems only
              return item.warn || item.error;
            case 3: // problems only
              return item.error;
            default:
              return true;
          }
        }).sort((a, b) =>
        {
          return strCompare(a.name, b.name);
        });
      },
      headers ()
      {
        return [this.headerFixed].concat(this.langList.filter(lang => lang.enabled).map(lang =>
        {
          return {
            text: lang.locale.toUpperCase(),
            class: 'subheading',
            sortable: false,
          }
        }));
      }
    },
  methods:
    {
      importLocales (evt)
      {
        const file = (evt.dataTransfer || evt.target).files[0];
        const ctrl = this.$refs.file;
        try
        {
          ctrl.value = null;
        }
        catch (ex)
        {}
        if (ctrl.value) ctrl.parentNode.replaceChild(ctrl.cloneNode(true), ctrl);
        if (this.$root.modified)
        {
          if (!window.confirm('There are unsaved changes. Continue anyway?')) return;
        }
        const reader = new FileReader();
        reader.onload = this.readJson;
        reader.readAsText(file);
      },
      readJson (e)
      {
        const txt = e.target.result;
        let js;
        try
        {
          js = JSON.parse(txt);
          if (js && typeof js === 'object')
          {
            this.langList = Object.keys(js).map(lang =>
            {
              return {
                title: lang,
                locale: lang,
                enabled: true
              }
            });
          }
          else this.langList = [];
          this.messages = js;
          this.search = '';
          prefixes.splice();
          stringMap = {};
          this.buildList(js);
          const list = [];
          for (let key in stringMap)
          {
            const item = stringMap[key];
            const vals = Object.values(item);
            list.push({
              name: key,
              locales: item,
              error: this.langList.length !== vals.length, // the key is missing from the locale
              warn: vals.map(v => v.toLowerCase()).filter((value, index, self) => self.indexOf(value) === index).length !== vals.length, // matching translation for 1 or more of the locales
            });
          }
          this.stringList = list;
          this.$root.modified = false;
        }
        catch (e)
        {
          console.error(e);
        }
      },
      buildList (obj)
      {
        // flatten the hierarchical tree into a flat array
        const type = typeof obj;
        switch (type)
        {
          case 'object':
            for (let key in obj)
            {
              prefixes.push(key);
              this.buildList(obj[key]);
              prefixes.pop();
            }
            break;
          case 'string':
            const name = prefixes.slice(1).join('.');
            const msg = {};
            if (!(name in stringMap)) stringMap[name] = msg;
            stringMap[name][prefixes[0]] = obj;
            break;
        }
      },
      saveJson ()
      {
        let template = {};
        const langMap = {};
        // first add the locales
        this.langList.forEach(lang =>
        {
          langMap[lang.locale] = lang;
          template[lang.title] = {};
        });
        // then for each localization message - create the appropriate object path
        this.stringList.forEach(item =>
        {
          const path = item.name.split('.');
          for (let lang in langMap)
          {
            const locale = langMap[lang];
            let obj = template[locale.title];
            const len = path.length - 1; // the index of the last fragment in the object path
            path.forEach((fragment, index) =>
            {
              if (index === len)
              {
                // the leaf is our localization string
                const msg = item.locales[locale.locale];
                if (msg) obj[fragment] = msg;
              }
              else
              {
                // we are still building the object down
                if (!obj[fragment]) obj[fragment] = {};
                obj = obj[fragment];
              }
            });
          }
        });
        this.jsonData = 'data:application/json;charset=utf-8;base64,' + Buffer.from(JSON.stringify(template, null, 2)).toString('base64');
        const link = this.$refs.link;
        this.$nextTick(() =>
        {
          link.click();
          this.$root.modified = false;
        });
      },
      updateMessage (item, lang)
      {
        item.locales[lang] = this.localization;
        const vals = Object.values(item.locales);
        item.error = this.langList.length !== vals.length;
        item.warn = vals.map(v => v.toLowerCase()).filter((value, index, self) => self.indexOf(value) === index).length !== vals.length;
        this.localization = '';
        this.$root.modified = true;
      },
      addLanguage ()
      {
        if (!this.$refs.new_lang.validate()) return;
        this.langList.push({
          locale: this.languageNew,
          title: this.languageNew,
          enabled: true,
        });
        this.languageNew = '';
        this.$root.modified = true;
      },
      updateLanguage (index)
      {
        // rename a locale
        if (this.languageName)
        {
          this.langList[index].locale = this.languageName;
          this.languageName = '';
          this.$root.modified = true;
        }
      },
      langUp (index)
      {
        // reorder locales
        const lang = this.langList[index];
        this.langList.splice(index, 1);
        this.langList.splice(index - 1, 0, lang);
        this.$root.modified = true;
      },
      langDown (index)
      {
        // reorder locales
        const lang = this.langList[index];
        this.langList.splice(index, 1);
        this.langList.splice(index + 1, 0, lang);
        this.$root.modified = true;
      },
      emptyName (value)
      {
        return !!value || 'Please specify locale name';
      }
    }
}
</script>

<style>
  html
  {
    overflow: hidden;
  }

  *
  {
    box-sizing: border-box;
  }

  .application--wrap
  {
    height: 100vh;
  }

  main
  {
    height: 100%;
    overflow: hidden;
  }

  .link-download
  {
    visibility: hidden;
    z-index: -1;
    width: 1px;
    height: 1px;
  }

  .language_order button + button
  {
    margin-left: 0;
  }

  .fixed_table
  {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .fixed_table thead th
  {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .fixed_table .v-table__overflow
  {
    overflow-y: auto !important;
    flex: 1 1 auto;
  }

  .striped_table tbody tr:nth-child(odd)
  {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .cell_divide th + th,
  .cell_divide td + td
  {
    border-left: 1px solid #AAA;
  }

  .fixed_table tr.v-datatable__progress th
  {
    top: 55px;
    height: 1px;
  }

  .fixed_table td .v-icon
  {
    vertical-align: bottom;
  }

  .search_panel
  {
    display: flex;
    align-items: center;
  }

</style>

<style lang="stylus">
  @import '~vuetify/src/stylus/settings/_theme.styl';

  .fixed_table
  {
    .theme--light th
    {
      background-color: $material-light.cards;
    }

    .theme--dark th
    {
      background-color: $material-dark.cards;
    }
  }
</style>
