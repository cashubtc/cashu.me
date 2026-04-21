import { boot } from 'quasar/wrappers'
import { useCocoStore } from 'src/stores/coco'

export default boot(async ({ app, store }) => {
  const cocoStore = useCocoStore(store)
  await cocoStore.initialize()
})
