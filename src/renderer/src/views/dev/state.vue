<script setup lang="ts">
import { useMachine } from '@xstate/vue';
import { setup } from 'xstate';
import Layout from '@l/base.vue';
import { random } from "lodash-es"
const toggleMachine = setup({
  types: {} as {
    events: { type: 'TOGGLE', store: any }
  }
}).createMachine({
  id: 'toggle',
  initial: 'inactive',
  states: {
    inactive: {
      on: { TOGGLE: 'active',},
      entry: (val) => {
        console.log(val.event.store);
      }
    },
    active: {
      on: { TOGGLE: 'another' }
    },
    another: {
      on: { TOGGLE: 'inactive' }
    },
  }
});

const Ma = useMachine(toggleMachine);
</script>

<template>
  <Layout>
    <el-button @click="Ma.send({ type: 'TOGGLE', store: random() })">
      {{ Ma.snapshot.value.value }}
    </el-button>
  </Layout>
</template>