import { ref, computed, watch } from 'vue'
import { useSwal } from 'src/composables/shared/dialog/dialog'

export function useEditableTable(props, emit) {
  const { alertError, alertWarningAction } = useSwal()

  const rows = ref([...props.modelValue])

  watch(() => props.modelValue, val => {
    rows.value = [...val]
  })

  const editingRows = ref(new Set())

  const isEditing = (row) => editingRows.value.has(row)
  const isEditingAnyRow = computed(() => editingRows.value.size > 0)

  const addRow = () => {
    if (isEditingAnyRow.value) {
      alertError('Termine a edição atual antes de criar um novo registo.')
      return
    }

    const newRow = {
      _isNew: true,
      lifeCycleStatus: 'ACTIVE'
    }

    props.columns.forEach(col => {
      if (col.field !== 'actions' && col.field !== 'lifeCycleStatus') {
        newRow[col.field] = ''
      }
    })

    rows.value.push(newRow)
    editingRows.value.add(newRow)
    emit('update:modelValue', [...rows.value])
  }

  const editRow = (row) => {
    if (isEditingAnyRow.value) {
      alertError('Termine a edição atual antes de editar outro registo.')
      return
    }

    row._backup = { ...row }

    row.programId = row.program?.id ?? null
    row.serviceId = row.service?.id ?? null
    editingRows.value.add(row)
  }

  const cancelEdit = (row) => {
    if (row._isNew) {
      rows.value = rows.value.filter(r => r !== row)
      editingRows.value.delete(row)
     
      emit('update:modelValue', [...rows.value])
    } else {
      if (row._backup) {
        Object.assign(row, row._backup)
        delete row._backup
      }
      delete row.programId
      editingRows.value.delete(row)
    }
  }

  const saveRow = async (row) => {
    try {
      const savedRow = await new Promise((resolve, reject) => {
        emit('save', row, { resolve, reject })
      })

      console.log('Linha salva:', savedRow)
      // Atualiza program
      if (savedRow?.program) {
        row.program = savedRow.program
      }

      // Se você tiver service:
      if (savedRow?.service) {
        row.service = savedRow.service
      }

      // Limpa campos auxiliares
      delete row.programId
      delete row.serviceId
      delete row._backup

      // Atualiza visual da tabela
      editingRows.value.delete(row)
      emit('update:modelValue', [...rows.value])
    } catch (err) {
      console.error('Erro ao salvar a linha:', err)

    }
  }



  const deleteRow = async (row) => {
    if (editingRows.value.size > 0 && !isEditing(row)) {
      alertError('Termine a edição atual antes de apagar outro registo.')
      return
    }

    try {
      const confirm = await alertWarningAction(
        'Deseja realmente apagar este registo? Esta ação não poderá ser desfeita.'
      )

      if (!confirm) return

      await new Promise((resolve, reject) => {
        emit('delete', row, { resolve, reject })
      })

      rows.value = rows.value.filter(r => r !== row)
      editingRows.value.delete(row)
      emit('update:modelValue', [...rows.value])
    } catch (err) {
      console.error('Erro ao apagar a linha:', err)
    }
  }

  const search = (searchTerm) => {
    emit('search', searchTerm.trim())
  }

  const toggleStatus = (row) => {
    emit('toggle-status', row)
  }

  const visibleColumns = computed(() =>
    props.columns.filter(col => col.name !== 'actions')
  )

  return {
    rows,
    editingRows,
    isEditing,
    isEditingAnyRow,
    addRow,
    editRow,
    cancelEdit,
    saveRow,
    deleteRow,
    search,
    toggleStatus,
    visibleColumns
  }
}
