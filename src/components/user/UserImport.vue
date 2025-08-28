<template>
  <q-card flat bordered class="q-pa-none">
    <q-card-section class="q-pa-none">
      <q-banner dense class="text-primary bg-grey-3 q-pa-none q-px-md q-py-xs">
        <span class="text-weight-medium">Importar Utilizadores</span>
      </q-banner>
    </q-card-section>

    <q-card-section>
      <div class="row items-center q-col-gutter-sm">
        <div class="col">
          <q-file
            v-model="file"
            label="Selecionar ficheiro (.xlsx/.xls)"
            accept=".xlsx,.xls"
            outlined dense clearable
            @update:model-value="handleFileUpload"
          />
        </div>
        <div class="col-auto">
          <q-btn dense flat icon="download" label="Template" @click="downloadTemplate" color="amber-10" />
        </div>
      </div>

      <!-- Dica de sistemas permitidos -->
      <div v-if="allowedSystems.length" class="q-mt-sm text-caption text-grey">
        Sistemas integrados permitidos:&nbsp;
        <q-chip v-for="s in allowedSystems" :key="s || '(vazio)'" size="sm" class="q-mr-xs">
          {{ s || '(vazio)' }}
        </q-chip>
      </div>

      <!-- Tabela -->
      <div v-if="rows.length" class="q-mt-md">
        <div class="row items-center q-mb-sm">
          <div class="col">
            <div class="text-caption text-grey">
              {{ validCount }} válido(s) • {{ invalidCount }} com erro(s)
            </div>
          </div>
        </div>
        <EditableTable
          v-model="rows"
          title="Pré-visualização"
          :columns="columns"
          :loading="loading"
          :rows-per-page-options="[10, 20, 50, 100]"
          :hide-search-input="true"
          :hide-search-button="true"
          :hide-add-button="true"
          :hide-toggle-status="true"
          :confirm-error="alertError"
          v-model:pagination="pagination"
          :select-options="{ integratedSystemOptions }"
          @save="(row, { resolve, reject }) => onSaveRow(row).then(resolve).catch(reject)"
          @delete="(row, { resolve, reject }) => onDelete(row).then(resolve).catch(reject)"
        />
      </div>
    </q-card-section>

    <q-card-actions align="right" class="q-gutter-sm">
      <q-btn label="Cancelar" color="negative" @click="$emit('close')" />
      <q-btn
        color="primary"
        :disable="!validCount"
        :label="`Importar válidos (${validCount})`"
        @click="importNow"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import { Loading, QSpinnerRings } from 'quasar'
import { useSwal } from 'src/composables/shared/dialog/dialog'
import { useUserStore } from 'src/stores/user/userStore'
import { useSourceSystemStore } from 'src/stores/source/SourceSystemStore'

type Row = {
  rowId: number
  name?: string
  surname?: string
  username?: string
  integratedSystemId?: number | string | null
  integratedSystemLabel?: string          // display-only
  idOnIntegratedSystem?: string | null
  _sysText?: string                       // texto do Excel (code/descr/label)
  _errors: string[]
  _valid: boolean
}

const emit = defineEmits<{ (e: 'close'): void; (e: 'imported', v:{imported:number}): void }>()

const { alertError, alertSucess } = useSwal()
const userStore = useUserStore()
const sourceSystemStore = useSourceSystemStore()

const file = ref<File | null>(null)
const data = ref<Row[]>([])
const loading = ref(false)

/* ---------------- Pagination (client-side) ---------------- */
const pagination = ref({
  sortBy: 'rowId',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

function syncRowsNumber() {
  pagination.value.rowsNumber = data.value.length
  const maxPage = Math.max(1, Math.ceil(Math.max(1, pagination.value.rowsNumber) / pagination.value.rowsPerPage))
  if (pagination.value.page > maxPage) pagination.value.page = maxPage
}

/* ---------------- Rows bridge (v-model) ---------------- */
const rows = computed<Row[]>({
  get: () => {
    // mantém o label sempre atualizado
    const r = data.value.map(x => ({
      ...x,
      integratedSystemLabel:
        idToLabel.value.get(x.integratedSystemId ?? '') || (x.integratedSystemLabel ?? '')
    }))
    syncRowsNumber()                          // 👈 garante contagem atualizada
    return r
  },
  set: v => {
    const seen = new Set<string>()
    data.value = v.map(x => {
      const r = { ...x }
      r.integratedSystemLabel = idToLabel.value.get(r.integratedSystemId ?? '') || ''
      return validateRow(r, seen)
    })
    syncRowsNumber()                          // 👈 após edição
  }
})

/* ---------------- Select options (padrão select-options) ---------------- */
const integratedSystemOptions = computed(() =>
  sourceSystemStore.currentPageSourceSystems
    .filter(s => (s.lifeCycleStatus ?? 'ACTIVE') !== 'INACTIVE')
    .map(s => ({
      label: s.description ? `${s.code} — ${s.description}` : `${s.code}`,
      value: s.id
    }))
)

const idToLabel = computed(() => {
  const m = new Map<any,string>()
  integratedSystemOptions.value.forEach(o => m.set(o.value, o.label))
  return m
})

/* todos os sistemas para mapear id->code na hora de enviar */
const allSystems = ref<any[]>([])
const codeById = computed(() => {
  const m = new Map<any,string>()
  allSystems.value.forEach(s => m.set(s.id, s.code))
  return m
})

/* mapeamento texto excel -> id  (code / description / "code - description") */
const tokenToId = ref<Map<string, number | string>>(new Map())

function norm(s:any): string {
  return (s ?? '')
    .toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[—–]/g, '-')      // em/en dash
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim().toLowerCase()
}

const onDelete = async (row: Row) => {
  // remove pelo rowId (é único no import)
  data.value = data.value.filter(r => r.rowId !== row.rowId)
  syncRowsNumber()
  return true
}

// ✔️ agora só aceita CÓDIGO (ex.: "OPENMRS"), não descrição
function mapSysTextToId(text: string): number | string | null {
  const n = norm(text)
  if (!n) return null
  return codeToId.value.get(n) ?? null
}

/* ---------------- Columns (padrão EditableTable) ---------------- */
const columns = [
  { name:'status', label:'Validação', field:(r:Row)=> (r._valid ? 'OK' : `${r._errors.length} erro(s)`), align:'left' },
  { name:'name', label:'Nome', field:'name', align:'left', editType:'text', required:true },
  { name:'surname', label:'Apelido', field:'surname', align:'left', editType:'text', required:true },
  { name:'username', label:'Username', field:'username', align:'left', editType:'text', required:true },
  {
    name:'integratedSystemId',
    label:'Sistema Integrado',
    field:'integratedSystemLabel',              // mostra o label
    align:'left',
    editType:'select',
    editOptionsKey:'integratedSystemOptions',   // vem de :select-options
    optionLabelKey:'label',
    optionValueKey:'value',
    editValueField:'integratedSystemId',        // grava o id
    required:false
  },
  { name:'idOnIntegratedSystem', label:'ID no Sistema', field:'idOnIntegratedSystem', align:'left', editType:'text' },
  { name:'errors', label:'Erros', field:(r:Row)=>(r._errors||[]).join(' • '), align:'left', style: 'width: 60%; white-space: normal; word-break: break-word;' },
  { name:'actions', label:'Acções', align:'center' }
]

const validCount   = computed(() => data.value.filter(r => r._valid).length)
const invalidCount = computed(() => data.value.filter(r => !r._valid).length)

/* ---------------- Boot ---------------- */
onMounted(async () => {
  // garantir dados para options e mapeamentos
  if (!sourceSystemStore.currentPageSourceSystems.length) {
    await sourceSystemStore.fetchSourceSystems({ page:0, size:1000, ignoreCache:true })
  }
  allSystems.value = await sourceSystemStore.getAllSourceSystemsAcrossPages({ size: 1000 })
  const active = allSystems.value.filter((s:any) => (s.lifeCycleStatus ?? 'ACTIVE') !== 'INACTIVE')

  const map = new Map<string, number | string>()
  for (const s of active) {
    const code = (s.code ?? '').toString()
    const desc = (s.description ?? '').toString()
    if (code) map.set(norm(code), s.id)
    if (desc) map.set(norm(desc), s.id)
    if (code && desc) map.set(norm(`${code} - ${desc}`), s.id)
  }
  tokenToId.value = map

  const display = Array.from(new Set(
    active.map((s:any)=> s.description ? `${s.code} — ${s.description}` : `${s.code}`)
  )).sort((a,b)=>a.localeCompare(b))
  allowedSystems.value = ['', ...display]
  pagination.value.page = 1
  syncRowsNumber()
})

/* ---------------- Validations ---------------- */
function validateUsername(u?:string){
  if (!u) return 'Username é obrigatório'
  if (!/^[a-zA-Z0-9._-]{3,50}$/.test(u)) return 'Username inválido (3–50, letras/números . _ -)'
  return null
}

// 🔎 mapa code -> id apenas para sistemas ATIVOS
const codeToId = computed(() => {
  const m = new Map<string, number | string>()
  allSystems.value
    .filter((s:any) => (s.lifeCycleStatus ?? 'ACTIVE') !== 'INACTIVE')
    .forEach((s:any) => {
      const code = (s.code ?? '').toString()
      if (code) m.set(norm(code), s.id)
    })
  return m
})

// conjunto de códigos válidos (normalizados)
const validCodes = computed(() => new Set(codeToId.value.keys()))


function validateRow(row: Row, seen: Set<string>) {
  const errors: string[] = []

  if (!row.name) errors.push('Nome é obrigatório')
  if (!row.surname) errors.push('Apelido é obrigatório')

  const uErr = validateUsername(row.username)
  if (uErr) errors.push(uErr)

  const uname = (row.username || '').toLowerCase()
  if (uname) {
    if (seen.has(uname)) errors.push('Username duplicado no ficheiro')
    else seen.add(uname)
  }

  // ✅ validação EXCLUSIVA por CÓDIGO de sistema
  const sysText = (row._sysText || '').trim()
  if (sysText) {
    const isValidCode = validCodes.value.has(norm(sysText))
    if (!isValidCode) {
      errors.push(`Código de Sistema Integrado inválido: "${row._sysText}".`)
    } else {
      // se for um código válido e ainda não temos o id, preenche automaticamente
      if (row.integratedSystemId == null || row.integratedSystemId === '') {
        const id = mapSysTextToId(sysText)
        if (id != null) {
          row.integratedSystemId = id
          row.integratedSystemLabel = idToLabel.value.get(id) || ''
        }
      }
    }
  }

  // se tem sistema (por id), precisa do ID no Sistema
  if (row.integratedSystemId != null && row.integratedSystemId !== '' && !row.idOnIntegratedSystem) {
    errors.push('ID no Sistema é obrigatório quando Sistema Integrado é informado')
  }

  row._errors = errors
  row._valid = errors.length === 0
  return row
}


/* ---------------- Excel ---------------- */
const HEADER_MAP: Record<string,string> = {
  'nome':'name','name':'name',
  'apelido':'surname','sobrenome':'surname','surname':'surname','last name':'surname','lastname':'surname',
  'username':'username','utilizador':'username','user name':'username',
  'sistema integrado':'integratedSystem','integrated system':'integratedSystem','integratedsystem':'integratedSystem',
  'id no sistema':'idOnIntegratedSystem','id on system':'idOnIntegratedSystem','idonsystem':'idOnIntegratedSystem'
}
const normalizeHeader = (h:any)=> (h ?? '').toString().trim().toLowerCase().replace(/\s+/g,' ')
const mapHeaders = (headerRow:any[])=>{
  const map:Record<number,string> = {}
  headerRow.forEach((h,idx)=>{
    const key = HEADER_MAP[normalizeHeader(h)]
    if (key) map[idx] = key
  })
  return map
}

async function handleFileUpload(selectedFile: File | null) {
  data.value = []
  if (!selectedFile) return
  try {
    loading.value = true

    // 1) Ler Excel
    const buf = await selectedFile.arrayBuffer()
    const wb = XLSX.read(buf, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const arr = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as any[][]

    if (!arr.length) {
      alertError('Ficheiro vazio.')
      return
    }

    // 2) Parse + validação local (formato/campos obrigatórios/duplicados no ficheiro)
    const headerMap = mapHeaders(arr[0])
    const seen = new Set<string>()

    const out: Row[] = arr.slice(1).map((r, i) => {
      const obj: Row = { rowId: i + 1, _errors: [], _valid: false }
      for (const idx in headerMap) {
        const k = headerMap[idx]
        const v = (r[idx] ?? '').toString().trim()
        if (k === 'integratedSystem') {
          obj._sysText = v
          obj.integratedSystemId = mapSysTextToId(v) // tenta mapear texto -> id
          obj.integratedSystemLabel = idToLabel.value.get(obj.integratedSystemId ?? '') || ''
        } else {
          obj[k] = v
        }
      }
      return validateRow(obj, seen) // marca _errors e _valid (local)
    }).filter(o =>
      o.name || o.surname || o.username || o._sysText || o.idOnIntegratedSystem
    )

    // 3) Chamar validação do SERVIDOR e fundir erros (index 0-based)
    const payloadForServer = out.map(r => ({
      name: r.name ?? '',
      surname: r.surname ?? '',
      username: r.username ?? '',
      // enviamos o TEXTO do excel para o backend validar (code/descr)
      integratedSystem: (r._sysText || '').trim() || null,
      idOnIntegratedSystem: r.idOnIntegratedSystem || null,
      email: null,
      phone: null
    }))

    try {
      const { errors } = await userStore.validateImport(payloadForServer)
      const errorMap = new Map<number, string[]>(
        (errors ?? []).map(e => [e.index as number, e.messages as string[]])
      )

      // Merge: junta mensagens do servidor às locais
      for (let i = 0; i < out.length; i++) {
        const serverMsgs = errorMap.get(i) || []
        if (serverMsgs.length) {
          out[i]._errors = [...(out[i]._errors || []), ...serverMsgs]
          out[i]._valid = out[i]._errors.length === 0
        }
      }
    } catch (srvErr) {
      // falha de validação no servidor não bloqueia a pré-visualização
      console.error('Falha ao validar no servidor:', srvErr)
      alertError('Não foi possível validar no servidor. Reveja os dados locais ou tente novamente.')
    }

    // 4) Atualiza a tabela/paginação + feedback
    data.value = out
    pagination.value.page = 1
    syncRowsNumber()

    if (!data.value.length) {
      alertError('Nenhuma linha válida ou preenchida foi encontrada.')
    } else {
      alertSucess('Ficheiro carregado e validado. Pode ajustar os dados antes de importar.')
    }
  } catch (e) {
    console.error(e)
    alertError('Erro ao ler o ficheiro. Verifique se é um Excel válido.')
  } finally {
    loading.value = false
  }
}


/* ---------------- Save (linha) ---------------- */
async function onSaveRow(row: Row) {
  // apenas refresca o label; valida será tratada pelo EditableTable via confirm-error
  row.integratedSystemLabel = idToLabel.value.get(row.integratedSystemId ?? '') || ''
  return { ...row }
}

/* ---------------- Import ---------------- */
async function importNow() {
  const payload = data.value
    .filter(r => r._valid)
    .map(r => ({
      name: r.name!,
      surname: r.surname!,
      username: r.username!,
      integratedSystem: r.integratedSystemId != null && r.integratedSystemId !== ''
        ? codeById.value.get(r.integratedSystemId) ?? null
        : null,
      idOnIntegratedSystem: r.idOnIntegratedSystem || null
    }))

  if (!payload.length) return

  Loading.show({ spinner: QSpinnerRings, message: 'A importar utilizadores…' })
  try {
    await userStore.importUsersBulk(payload)
    alertSucess(`Importação concluída: ${payload.length} registo(s).`)
    emit('imported', { imported: payload.length })
    emit('close')
  } catch (e) {
    alertError(userStore.error || 'Erro na importação')
  } finally {
    Loading.hide()
  }
}

/* ---------------- Template Excel ---------------- */
const allowedSystems = ref<string[]>([])
function downloadTemplate() {
  const suggest = (allowedSystems.value.find(s => s) || 'OPENMRS').toString()
  const ws = XLSX.utils.aoa_to_sheet([
    ['Nome', 'Apelido', 'Username', 'Sistema Integrado', 'ID no Sistema'],
    ['Ana', 'Silva', 'ana.silva', suggest, 'U123']
  ])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Utilizadores')
  XLSX.writeFile(wb, 'modelo-importacao-utilizadores.xlsx')
}
</script>
