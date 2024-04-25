<template>
  <div id="butterFly" ref="butterFly"></div>
</template>

<script lang="ts" setup>
import $ from 'jquery'
import DagreCanvas from './dagresCanvas'
import RelationEdge from './edge'
import 'butterfly-dag/dist/index.css'
import { ref, watch } from 'vue'

let canvas: any = null
const butterFly = ref<HTMLElement>()

const props = defineProps<{
  canvasConf: any
  isFirstRender: boolean
}>()
const emit = defineEmits(['viewMonitor', 'viewStreamTask'])

watch(
  () => props.isFirstRender,
  () => {
    setTimeout(() => {
      initCanvas()
    }, 100)
  },
)

// onMounted(() => {
//   setTimeout(() => {
//     initCanvas()
//   })

// })

function initCanvas() {
  $('body').on('click', '#butterFly', function () {
    $('#butterFly .nodeBox img')
      .css({
        transform: 'scale(1, 1)',
      })
      .nextAll('.action')
      .hide()
  })
  canvas = new DagreCanvas({
    root: butterFly.value, // canvas的根节点(必传)
    ...props.canvasConf,
    theme: {
      edge: {
        // shapeType: 'Manhattan',
        shapeType: 'AdvancedBezier',
        arrow: true,
        arrowPosition: 0.5,
        Class: RelationEdge,
        defaultAnimate: true,
      },
    },
  })

  canvas.on('viewMonitor', (params: any) => {
    emit('viewMonitor', params)
  })

  canvas.on('viewStreamTask', (params: any) => {
    emit('viewStreamTask', params)
  })

  canvas.on('system.drag.start', (e: any) => {
    console.log(e)
  })
}

// function canvasDraw (data: any) {
//   canvas.draw({
//     ...data,
//   }, () => {
//     canvas.focusCenterWithAnimate()
//   })
// }
function canvasReDraw(data: any) {
  // setTimeout(() => {
  canvas.redraw(
    {
      ...data,
    },
    () => {
      canvas.focusCenterWithAnimate()
    },
  )
  // }, 1000)
}

// function genCanvasData () {
//   return canvas.getDataMap()
// }

// function filterNodeByKeyword (keyword: any) {
//   const { nodes } = genCanvasData()

//   const node = nodes.find((node: any) => {
//     const id = node.id || node?.options?.name || ''
//     const name = node?.options?.name || ''
//     const description = node?.options?.sourceData?.editableProperties?.description || ''

//     return description.indexOf(keyword) !== -1 || name.indexOf(keyword) !== -1 || id.indexOf(keyword) !== -1
//   })

//   return node
// }
// function fitNode (node: any) {
//   if (node) {
//     canvas.focusNodeWithAnimate(node.id, 'node')
//     node.dom.style.border = '1px dashed #ccc'
//   }
// }

function getCanvas() {
  return canvas
}

defineExpose({
  canvasReDraw,
  getCanvas,
})
</script>

<style lang="scss">
#butterFly {
  height: 100%;
  width: 100%;
  background-color: #f0f0f0;
  .butterflies-link {
    stroke: #d8d8d8;
    stroke-width: 1px;
    &.purple {
      stroke: #404554;
    }
  }
}
</style>
