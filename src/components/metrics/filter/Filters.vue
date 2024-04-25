<script lang="ts" setup>
import { onBeforeMount, reactive, ref } from 'vue'
import { Clock } from '@element-plus/icons-vue'
import { getTimeFilterList, queryListWithKey } from './utils'
import { CommonObj } from '../types'
import dayjs from 'dayjs'

type Option = {
  name: string
  value: string
}

const emit = defineEmits(['change'])

const props = withDefaults(
  defineProps<{
    selectType?: ('database' | 'table' | 'type' | 'queryKind' | 'user')[]
  }>(),
  {
    selectType: () => ['database', 'table'],
  },
)

const databaseList = ref<Option[]>([])
const tableList = ref<Option[]>([])
const queryKindList = ref<Option[]>([])
const typeList = ref<Option[]>([])
const initialUserList = ref<Option[]>([])

const keyList = {
  database: databaseList,
  table: tableList,
  queryKind: queryKindList,
  type: typeList,
  user: initialUserList,
}

const defaultValue = reactive({
  database: 'All',
  table: 'All',
  queryKind: 'All',
  user: 'All',
  type: 'All',
  time: dayjs.duration(24, 'hours').asMilliseconds(),
})

const timeFilterList = getTimeFilterList()

const getTablesByDatabase = (val: string) => {
  queryListWithKey.table(val).then((res) => {
    tableList.value = [{ name: 'All' }, ...res.data.map((item: CommonObj) => ({ name: item.name }))]
  })
}

onBeforeMount(() => {
  const { selectType } = props
  Promise.all(
    selectType.map((type) => {
      return queryListWithKey[type]()
    }),
  ).then((res) => {
    selectType.forEach((type, i) => {
      const data = [
        { name: 'All' },
        ...res[i].data.map((item: CommonObj) => {
          const { type, query_kind, initial_user, name } = item
          return {
            name: name || type || query_kind || initial_user,
          }
        }),
      ]
      keyList[type].value = data
    })
  })
})
</script>
<template>
  <section class="filter-container">
    <template v-if="selectType.includes('database')">
      <span class="filter-tip">{{ $t('Database') }}</span>
      <el-select
        v-model="defaultValue.database"
        class="m-2"
        placeholder="Select"
        size="small"
        @change="
          (val: string) => {
            getTablesByDatabase(val)
            emit('change', { database: val })
          }
        "
      >
        <el-option
          v-for="item in databaseList"
          :key="item.name"
          :label="item.name"
          :value="item.name"
        />
      </el-select>
      <el-divider direction="vertical" />
    </template>
    <template v-if="selectType.includes('table')">
      <span class="filter-tip">{{ $t('Table') }}</span>
      <el-select
        v-model="defaultValue.table"
        class="m-2"
        placeholder="Select"
        size="small"
        @change="
          (val: string) => {
            emit('change', { table: val })
          }
        "
      >
        <el-option
          v-for="item in tableList"
          :key="item.name"
          :label="item.name"
          :value="item.name"
        />
      </el-select>
      <el-divider direction="vertical" />
    </template>
    <template v-if="selectType.includes('queryKind')">
      <span class="filter-tip">{{ $t('Query kind') }}</span>
      <el-select
        v-model="defaultValue.queryKind"
        class="m-2"
        placeholder="Select"
        size="small"
        @change="
          (val: string) => {
            emit('change', { queryKind: val })
          }
        "
      >
        <el-option
          v-for="item in queryKindList"
          :key="item.name"
          :label="item.name"
          :value="item.name"
        />
      </el-select>
      <el-divider direction="vertical" />
    </template>
    <template v-if="selectType.includes('type')">
      <span class="filter-tip">{{ $t('Query status') }}</span>
      <el-select
        v-model="defaultValue.type"
        class="m-2"
        placeholder="Select"
        size="small"
        @change="
          (val: string) => {
            emit('change', { type: val })
          }
        "
      >
        <el-option
          v-for="item in typeList"
          :key="item.name"
          :label="item.name"
          :value="item.name"
        />
      </el-select>
      <el-divider direction="vertical" />
    </template>
    <template v-if="selectType.includes('user')">
      <span class="filter-tip">{{ $t('User') }}</span>
      <el-select
        v-model="defaultValue.user"
        class="m-2"
        placeholder="Select"
        size="small"
        @change="
          (val: string) => {
            emit('change', { user: val })
          }
        "
      >
        <el-option
          v-for="item in initialUserList"
          :key="item.name"
          :label="item.name"
          :value="item.name"
        />
      </el-select>
      <el-divider direction="vertical" />
    </template>
    <el-icon><Clock /></el-icon>
    <el-select
      v-model="defaultValue.time"
      class="m-2"
      placeholder="Select"
      size="small"
      @change="
        (val: string | number) => {
          emit('change', {
            time: val,
            option: timeFilterList.find((item) => item.value === val),
          })
        }
      "
    >
      <el-option
        v-for="item in timeFilterList"
        :key="item.name"
        :label="item.name"
        :value="item.value"
      />
    </el-select>
  </section>
</template>
<style lang="scss" scoped>
.filter-container {
  display: flex;
  justify-content: right;
  align-items: center;
  width: 100%;
  height: 36px;
  padding-right: 10px;
  margin-bottom: 10px;
  background-color: #f0f0f0;
  border: 1px solid #e2e2e2;
  box-sizing: border-box;

  .el-select {
    margin-left: 10px;
  }
}
.filter-tip {
  color: rgba(62, 62, 69, 0.45);
}
</style>
