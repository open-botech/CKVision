<template>
  <div class="nodeBox">
    <el-tooltip class="box-item" effect="dark" :content="opts.name" placement="top">
      <div>
        {{ opts.name }}
      </div>
    </el-tooltip>
  </div>
</template>

<script lang="ts" setup>
// import $ from 'jquery'
// const props =
import { ElTooltip } from 'element-plus'

withDefaults(
  defineProps<{
    opts: any
  }>(),
  {
    opts: () => ({}),
  },
)

// const emit = defineEmits(['viewMonitor', 'viewStreamTask'])

// function viewMonitor () {
//   const name = props.opts.name
//   const type = props.opts.type

//   emit('viewMonitor', {
//     name,
//     type
//   })
// }

// function viewStreamTask () {
//   const name = props.opts.name
//   const type = props.opts.type

//   if (type === 'flink') {
//     emit('viewStreamTask', {
//       name,
//       type
//     })
//   }
// }

// function alertAction (e: any) {
//   $('#butterFly .nodeBox img').css({
//     transform: 'scale(1, 1)'
//   })
//   $('#butterFly .nodeBox .action').hide()
//   if (props.opts.type == 'flink' || props.opts.type == 'kafka') {
//     $(e.target).css({
//       transform: 'scale(.7, .7)'
//     })
//     $(e.target).nextAll('.action').show()
//   }
// }
</script>

<style lang="scss" scoped>
.nodeBox {
  position: relative;
  font-size: 14px;
  display: block;
  width: 260px;
  height: 76px;
  padding-left: 58px;
  padding-right: 18px;
  color: rgba(0, 0, 0, 0.85);
  line-height: 76px;
  text-align: left;
  background-color: #fff;
  box-shadow: 0px 0px 6px 0px rgba(223, 223, 223, 0.3);
  border-radius: 4px;
  box-sizing: border-box;
  div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .rate {
    color: #474ae1;
    margin-top: 10px;
  }
  img {
    cursor: pointer;
    width: 90px;
    height: 90px;
  }
  .action {
    z-index: 1000;
    display: none;
    position: absolute;
    width: 80px;
    height: 80px;
    background: url('../../../assets/images/dass/ope-bg.png') no-repeat;
    background-size: 100% 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    span {
      cursor: pointer;
    }
    .detail {
      width: 50px;
      height: 50px;
      position: absolute;
      background: url('../../../assets/images/topo/detail.png') no-repeat;
      background-size: 100% 100%;
      top: 34px;
      left: -18px;
      z-index: 10000;
      &._disabled {
        background: url('../../../assets/images/topo/detail-disabled.png') no-repeat;
      }
    }
    .monitor {
      width: 50px;
      height: 50px;
      z-index: 10000;
      position: absolute;
      background: url('../../../assets/images/topo/monitor.png') no-repeat;
      background-size: 100% 100%;
      top: 34px;
      right: -18px;
      &._disabled {
        background: url('../../../assets/images/topo/monitor-disabled.png') no-repeat;
      }
    }
    .ope1_disabled {
      width: 50px;
      height: 50px;
      z-index: 10000;
      position: absolute;
      background: url('../../../assets/images/topo/ope1-disabled.png') no-repeat;
      background-size: 100% 100%;
      top: -21px;
      right: 13px;
    }
  }
  .name {
    margin-top: -7px;
    color: #ffffffd2;
    width: 250px;
  }
  .description {
    margin-top: 5px;
    color: #ffffffd2;
    width: 250px;
  }
}
</style>
