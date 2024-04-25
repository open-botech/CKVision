import $ from 'jquery'
import { Node } from 'butterfly-dag'
import { createApp } from 'vue'
import './base_node.scss'
// import NodeTemp from './nodeTemplate.vue'
import NodeRender from './Node.vue'

class BaseNode extends Node {
  [x: string]: any
  options: null
  constructor(opts: any) {
    super(opts)
    this.options = opts
  }

  draw(opts: any) {
    // let that = this
    const css = {
      position: 'absolute',
      top: opts.top,
      left: opts.left,
    }
    const content = createApp(NodeRender, {
      opts,
      css,
      node: this,
    })

    const divEle = document.createElement('div')

    const component = content.mount(divEle)

    const container = $(component.$el).css('top', opts.top).css('left', opts.left)
    // return component
    return container[0]
  }
}

export default BaseNode
