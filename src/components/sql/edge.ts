import $ from 'jquery'
import { Edge } from 'butterfly-dag'

class RelationEdge extends Edge {
  [x: string]: any
  draw(obj: any) {
    const path = super.draw(obj)
    if (this.options.color) {
      $(path).addClass(this.options.color)
    }
    return path
  }
  drawArrow() {
    const dom = super.drawArrow(false)
    if (this.options.color) {
      $(dom).addClass(this.options.color)
    }
    return dom
  }
  addAnimate() {
    setTimeout(() => {
      super.addAnimate({
        num: 1,
        radius: 2,
        dur: '5s',
        repeatCount: 'indefinite',
      })
    }, 100)
  }

  drawLabel(text: string) {
    let dom = null
    if (text) {
      dom = $(`<span class="butterflies-label">${text}</span>`)[0]
    }
    return dom
  }
}

export default RelationEdge
