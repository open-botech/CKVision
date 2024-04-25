<script lang="ts" setup>
import { onBeforeMount, reactive, ref, watch } from 'vue'
import ButterFlyVue from './butterFlyVue.vue'
import { queryLineage } from './query'
import nodeRender from './node'
import { TabItem } from '@/store/modules/sql/types'
// import { LineageDataItem } from './types'

const props = defineProps<{
  isFirstRender: boolean
  tab: TabItem
}>()

const nodesForAdd: any[] = []
const edgesForAdd: any[] = []
const nodes = reactive<any[]>([
  {
    id: props.tab.node?.database + '_' + props.tab.node?.name,
    name: props.tab.node?.name,
    Class: nodeRender,
    className: 'nodeBackground-color',
    type: 'clickhouse', // 类型
    sourceData: props.tab.node, // 源数据
  },
])
const edges = reactive<any[]>([])
const butterflyVue = ref<any>(null)
const loading = ref<boolean>(false)
const options = {
  layout: {
    type: 'dagreLayout',
    options: {
      rankdir: 'BT',
      nodesep: 80,
      ranksep: 60,
      controlPoints: false,
    },
  },
  disLinkable: false, // 可删除连线
  linkable: false, // 可连线
  draggable: true, // 可拖动
  zoomable: true, // 可放大
  moveable: true, // 可平移
  theme: {
    edge: {
      defaultAnimate: true,
    },
  },
}

watch(
  () => props.isFirstRender,
  () => {
    loading.value = true
    setTimeout(() => {
      redraw({
        nodes: nodes,
        edges: edges,
      })
      loading.value = false
    }, 200)
  },
)

onBeforeMount(async () => {
  const { database, name, engine } = props.tab.node || {}
  await getNodeData({ database, name, engine })
  nodes.push(...nodesForAdd)
  edges.push(...edgesForAdd)
})

function redraw(data: any) {
  butterflyVue.value.canvasReDraw(data)
}

async function getNodeData({ database, name, engine }: any) {
  const res = await queryLineage({ database, name })
  if (!res) return

  for (let item of res.data) {
    const sourceId = item.source_schema + '_' + item.source_table
    const tergetId = item.target_schema + '_' + item.target_table
    nodesForAdd.push({
      id: sourceId,
      name: item.source_table,
      Class: nodeRender,
      className: 'nodeBackground-color',
      type: 'clickhouse', // 类型
      sourceData: {
        database: item.source_schema,
        name: item.source_table,
      }, // 源数据
    })
    edgesForAdd.push({
      source: sourceId,
      target: tergetId,
    })
    // await getNodeData({database: item.source_schema, table: item.source_table, engine })
  }
}

// async function datahubChange () {
//   await bfsTreeEach(`urn:li:dataset:(urn:li:dataPlatform:clickhouse,${props.tab.node?.database}.${props.tab.node?.name},PROD)`, 'downstream')
//   // eslint-disable-next-line no-undef
//   await bfsTreeEach(`urn:li:dataset:(urn:li:dataPlatform:clickhouse,${props.tab.node?.database}.${props.tab.node?.name},PROD)`, 'upstream')
//   // eslint-disable-next-line no-undef
//   redraw({
//     nodes: nodes,
//     edges: edges
//   })
//   loading.value = false
// }

/**
 * 动态遍历所有节点
 */
// async function bfsTreeEach (urn: string, type: string) {
//   const root = await getNode(urn)
//   let nodes = [root]
//   let node

//   // eslint-disable-next-line no-cond-assign
//   while (node = nodes.shift()) {
//     const streamNode = await getStreamNodes(node.urn, type)

//     genTopoData(node, streamNode.map((item: any) => item.entity), type)

//     if (streamNode.length) {
//       nodes.push(...streamNode.map((item: any) => item.entity))
//     }
//   }
// }
// async function getNode (urn: string) {
//   const resPromise = await getEntityLineage({
//     urn: urn
//   })

//   const res = await resPromise.json()

//   const node = res?.data?.entity || {}

//   return node
// }
/**
 * 获取上下游节点
 */
// async function getStreamNodes (urn: string, type: string) {
//   if (queryNode.has(urn)) return []
//   queryNode.add(urn)

//   const resPromise = await getEntityLineage({
//     urn: urn
//   })
//   const res = await resPromise.json()

//   const upstream = res?.data?.entity?.upstream?.relationships || []
//   const downstream = res?.data?.entity?.downstream?.relationships || []

//   if (type === 'downstream') {
//     if (upstream.length) {
//       for (let i = 0; i < upstream.length; i++) {
//         const item = upstream[i]
//         const urn = item.entity.urn

//         await bfsTreeEach(urn, 'downstream')
//         await bfsTreeEach(urn, 'upstream')
//       }
//     }

//     return downstream
//   } else if (type === 'upstream') {
//     if (downstream.length) {
//       for (let i = 0; i < downstream.length; i++) {
//         const item = downstream[i]
//         const urn = item.entity.urn

//         await bfsTreeEach(urn, 'downstream')
//         await bfsTreeEach(urn, 'upstream')
//       }
//     }

//     return upstream
//   } else {
//     return []
//   }
// }

/**
 * 生成拓扑关系
 */
// function genTopoData (node: any, streamNode: any, type: string) {
//   const index = nodes.findIndex((item: any) => item.id === node.urn)

//   // 当前处理节点记录
//   const platform = node?.platform?.name || node?.dataFlow?.platform?.name || '' // kafka | flink | haikang | elasticsearch | clickhouse
//   index === -1 && nodes.push({
//     id: node.urn,
//     name: node.name || node.jobId || 'defaultName',
//     Class: nodeRender,
//     className: 'nodeBackground-color',
//     type: platform, // 类型
//     sourceData: node // 源数据
//   })

//   streamNode?.forEach((stream: any) => {
//     const index = edges.findIndex((item: any) => item.source === (type === 'downstream' ? node.urn : stream.urn) && item.target === (type === 'downstream' ? stream.urn : node.urn))

//     index === -1 && edges.push({
//       source: type === 'downstream' ? node.urn : stream.urn,
//       target: type === 'downstream' ? stream.urn : node.urn,
//     })
//   })
// }
</script>
<template>
  <section v-loading="loading" class="table-pane-lineage-container">
    <ButterFlyVue ref="butterflyVue" :canvas-conf="options" :is-first-render="isFirstRender" />
  </section>
</template>
<style lang="scss" scoped>
.table-pane-lineage-container {
  width: 100%;
  height: 100%;
}
</style>
