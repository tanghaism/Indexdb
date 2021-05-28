<template>
  <div>1231</div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {useDB} from './provider-indexdb'

export default defineComponent({
  name: 'App',
  setup() {
    const db = useDB();
    console.log('项目生成的indexDB实例', db)
  },
})
</script>

<style>
</style>
