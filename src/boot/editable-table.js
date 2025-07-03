import { boot } from 'quasar/wrappers'
import EditableTablePlugin from '@voloide/editable-table'

export default boot(({ app }) => {
  app.use(EditableTablePlugin)
})
