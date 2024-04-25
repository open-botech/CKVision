<template>
  <div id="graph-3d" v-loading="loading"></div>

  <Detail v-if="showDetail" :detail-data="detailData" @close-detail="closeDetail"></Detail>

  <Relations :type-list="typeList" @update-graph="updateGraph" />
</template>

<script lang="ts" setup>
import ForceGraph3D from '3d-force-graph'
import { ForceGraph3DInstance } from '3d-force-graph'
import { CSS2DRenderer } from 'three-css2drender'
import randomColor from 'randomcolor'
import { computed, onMounted, toRaw } from 'vue'
import { query } from '@/utils/http'
import SpriteText from 'three-spritetext'
import Detail from '@/components/graph/Detail.vue'
import Relations from '@/components/graph/Relations.vue'

import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
const showDetail = ref(false)
const loading = ref(true)
const route = useRoute()

const excludeKey = ['x', 'y', 'z', 'vx', 'vy', 'vz', 'id', '_id', '_label', 'ref_', '__threeObj']

const detailData = reactive({
  nodeInfo: {},
})

interface typeListType {
  Tables: { name: string; color: string; count: number }[]
  RelationShips: { name: string; color: string; count: number; linkWidth?: number }[]
}

const graphObj = ref<ForceGraph3DInstance | null>(null)
const activeTypes = ref<string[]>([])

const typeList = reactive<typeListType>({
  Tables: [],
  RelationShips: [],
})

const currentId = computed(() => {
  return route.query.id
})

const updateGraph = (active: string[]) => {
  console.log(toRaw(active))
  activeTypes.value = toRaw(active)
  graphObj.value?.nodeColor(graphObj.value.nodeColor()).linkColor(graphObj.value.linkColor())
}

onMounted(async () => {
  loading.value = true
  const graph = await query(`SELECT  * FROM clickcat.GRAPH_TASK where ID = '${currentId.value}'`)
  const jobDetail = JSON.parse(graph.data[0].JOB_DETAIL)

  let nodes: any = []
  for (const detailItem of jobDetail.nodes) {
    const node = await query(
      "SELECT  *, '" +
        detailItem.table +
        "' as _label, '" +
        detailItem.table +
        "'||" +
        detailItem.primary +
        " as _id, '" +
        detailItem.display_field +
        "' as display_field FROM " +
        detailItem.database +
        '.' +
        detailItem.table +
        ' where ' +
        detailItem.primary +
        ' is not null',
    )
    nodes = nodes.concat(
      node.data.map((item: any) => {
        return {
          ...item,
          label: item._label,
          id: item._id,
        }
      }),
    )
  }

  nodes.forEach((node: any) => {
    const label: string = node.label || node._label || ''

    const labelIndex = typeList?.Tables?.findIndex((typeItem) => typeItem?.name === label)
    const rgbArr = randomColor({
      luminosity: 'dark',
      seed: label,
      format: 'rgbArray',
    })

    if (labelIndex === -1) {
      typeList.Tables.push({
        name: label,
        color: `rgb(${rgbArr.join(',')})`,
        count: 1,
      })
    } else {
      typeList.Tables[labelIndex].count++
    }
  })

  let links: any[] = []
  for (const item of jobDetail.links) {
    const link = await query(
      "SELECT   '" +
        item.source_node +
        "'||toString(t1." +
        item.source_primary +
        `) as source,
        '` +
        item.target_node +
        "'||toString(t2." +
        item.target_primary +
        `) as target,
        '` +
        item.relationship +
        `' as label
     FROM ` +
        item.database +
        '.' +
        item.source_node +
        ' t1 join ' +
        item.database +
        '.' +
        item.target_node +
        ` t2
    on toString(t1.` +
        item.source_link_field +
        ') = toString(t2.' +
        item.target_link_field +
        ')',
    )
    links = links.concat(link.data)
  }

  links.forEach((link) => {
    const label: string = link.label || link._label || ''

    const labelIndex = typeList?.RelationShips?.findIndex((typeItem) => typeItem?.name === label)
    const rgbArr = randomColor({
      luminosity: 'dark',
      seed: label,
      format: 'rgbArray',
    })

    if (labelIndex === -1) {
      typeList.RelationShips.push({
        name: label,
        color: `rgb(${rgbArr.join(',')})`,
        count: 1,
        linkWidth: 80 * (typeList.RelationShips.length + 1),
      })
    } else {
      typeList.RelationShips[labelIndex].count++
    }
  })

  // Random tree
  const gData = {
    nodes: nodes,
    links: links,
  }

  graphObj.value = ForceGraph3D({
    extraRenderers: [new CSS2DRenderer()],
  } as any)(document.getElementById('graph-3d') as HTMLElement)
    .graphData(gData)
    .backgroundColor('#fff')
    .linkColor((linkObj: any) => {
      const label = linkObj.label

      const rgbArr = randomColor({
        luminosity: 'dark',
        seed: label,
        format: 'rgbArray',
      })

      if (activeTypes.value.length && activeTypes.value.indexOf(label) === -1) {
        return `rgba(${rgbArr.join(',')},0.3)`
      } else {
        return `rgb(${rgbArr.join(',')})`
      }
    })
    //.linkOpacity(0.1)
    //.nodeOpacity(0.3)
    .linkWidth(0.4)
    .linkLabel('label')
    .nodeColor((obj: any) => {
      const label = obj.label

      const rgbArr = randomColor({
        luminosity: 'dark',
        seed: label,
        format: 'rgbArray',
      })

      if (activeTypes.value.length && activeTypes.value.indexOf(label) === -1) {
        return `rgba(${rgbArr.join(',')},0.3)`
      } else {
        return `rgb(${rgbArr.join(',')})`
      }
    })
    .onNodeClick((node: any) => {
      const nodeInfo = {
        ...node,
      }

      // 处理无用字段
      excludeKey.forEach((key) => {
        key in nodeInfo && delete nodeInfo[key]
      })

      // 弹出右侧窗口
      detailData.nodeInfo = nodeInfo
      showDetail.value = true
    })
    .nodeThreeObject((node: any) => {
      const label = node.label
      const display_field = node.display_field
      const sprite: any = new SpriteText(node[display_field])
      sprite.material.depthWrite = false // make sprite background transparent
      const rgbArr = randomColor({
        luminosity: 'dark',
        seed: label,
        format: 'rgbArray',
      })

      if (activeTypes.value.indexOf(label) === -1) {
        sprite.color = `rgba(${rgbArr.join(',')},0.3)`
      } else {
        sprite.color = `rgb(${rgbArr.join(',')})`
      }

      sprite.textHeight = 5
      return sprite.translateY(10).translateX(10).translateZ(10)
    })
    // .nodeThreeObject((node:any) => {
    //   const label = node.label
    //   const nodeEl = document.createElement('div')
    //   const display_field = node.display_field

    //   for(let key in node) {
    //     if(excludeKey.indexOf(key) === -1) {
    //       const infoDiv = document.createElement('div')
    //       if(node[display_field]) {
    //         infoDiv.textContent = `${node[display_field]}`
    //       }else {
    //         infoDiv.textContent = `${node[key]}`
    //       }

    //       nodeEl.appendChild(infoDiv)
    //       break
    //     }
    //   }
    //   nodeEl.style.color = randomColor({
    //     luminosity: 'dark',
    //     seed: label
    //   })
    //   nodeEl.className = 'node-label'

    //   nodeEl.onclick = (el) => {
    //     const nodeInfo = {
    //       ...node
    //     }

    //     // 处理无用字段
    //     excludeKey.forEach(key => {
    //       key in nodeInfo && delete nodeInfo[key]
    //     })

    //     // 弹出右侧窗口
    //     detailData.nodeInfo = nodeInfo
    //     showDetail.value = true
    //   }

    //   return new THREE.CSS2DObject(nodeEl)
    // })
    .nodeThreeObjectExtend(true)
    .linkDirectionalArrowLength(3)
    .linkDirectionalArrowRelPos(1)
    .cameraPosition({
      z: 200,
    })

  loading.value = false
})

const closeDetail = () => {
  showDetail.value = false
}
</script>
<style>
#graph-3d {
  height: 100%;
  overflow: hidden;
}
.scene-tooltip {
  color: black;
  font-size: 15px;
}
.node-label {
  pointer-events: auto;
  height: 20px;
  max-width: 100px;
  overflow: hidden;
  position: relative;
  left: 80px;
  text-align: left;
}
</style>
