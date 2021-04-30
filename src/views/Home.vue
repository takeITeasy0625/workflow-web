<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import workflow from '../components/workflow/workflow.vue';

@Component({components: {workflow}})
export default class Home extends Vue {
}
</script>
