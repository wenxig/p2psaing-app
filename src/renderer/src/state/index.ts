import { setup, createActor } from 'xstate';
const events: {
  on: string,
  fn: Function
}[] = []
const toggleMachine = setup({
  types: {} as {
    events: { type: 'then' }
  }
}).createMachine({
  id: 'lifecycle',
  initial: 'beforeSetup',
  states: {
    beforeSetup: {
      on: { then: "" },
      entry: () => {

      }
    }
  }
});

export const actor = createActor(toggleMachine).start();
actor.subscribe(({ value }) => {
  events.filter(({ on }) => on == value)
})