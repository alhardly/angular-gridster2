import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, ɵɵresolveBody } from '@angular/core';
import {
  CompactType, GridsterConfig, GridsterItem, GridsterItemComponent, GridsterPush, GridType,
  DisplayGrid,
} from 'angular-gridster2';

import { GridsterDraggable } from 'angular-gridster2/lib/gridsterDraggable.service';
import { Map, is } from 'immutable';

@Component({
  selector: 'app-mydrag',
  templateUrl: './mydrag.component.html',
  // 注意：在board中没有这项注解，现在注释掉，看看有没有影响
  // changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

// 这个和全局置顶的区别就是  不一定时置顶，置顶的时候时所有的元素都往下移动，这个是往上往下都有，所以要判断位置
export class MydragComponent implements OnInit {
  id = 3333;
  // 当前的控件元素
  currentDahsboard: any = null;
  options: GridsterConfig;
  dashboard: Array<GridsterItem>;
  // 当前通过拖拽生成的新元素
  newDragItem: any = null;
  dargItem: any = null;
  // GridsterItemComponentInterface 类型
  dragItemComponent: any = null;
  dragev: any;
  constructor() {

  }

  ngOnInit() {

    // document.body.onkeydown = this.aa;
    // this.fireKeyEvent(document.body, 'keydown', 27);
    // console.log(GridsterDraggable);
    window.onkeydown = this.aa;
    this.myfireKeyEvent('keydown', 27);

    this.dashboard = [
      { cols: 2, rows: 1, y: 2, x: 4, content: '我是拖拽元素', id: '001' },
      { cols: 2, rows: 2, y: 0, x: 2, content: '我是a元素', id: '002' },
      { cols: 1, rows: 1, y: 0, x: 4, content: '我是b元素', id: '003' },
      { cols: 3, rows: 2, y: 1, x: 4, content: '我是c元素', id: '004' },
    ];

    const options = {
      gridType: GridType.VerticalFixed, //
      displayGrid: DisplayGrid.Always,
      compactType: CompactType.CompactUp,
      // // itemChangeCallback: that.itemResize,
      // // 每个item初始化时的回调
      // itemResizeCallback: that.resize,
      minCols: 12,
      maxCols: 12,
      minRows: 1,
      maxItemCols: 12,
      minItemCols: 1,
      maxItemRows: 100,
      minItemRows: 1,
      fixedRowHeight: 40, // fixed row height for gridType: fixed
      keepFixedHeightInMobile: true, // keep the height from fixed gridType in mobile layout
      pushItems: true,
      swap: false, // 是否允许拖拽时两个元素交换位置
      draggable: {
        delayStart: 0,
        enabled: true,
        ignoreContentClass: 'ignore-darg',
        ignoreContent: false,
        // dragHandleClass: 'drag-handler',
        // stop: that.eventStop,
        // start: that.eventStart,
        dropOverItems: false,
        // dropOverItemsCallback: RoutesPcComponent.overlapEvent,
      },
      resizable: {
        delayStart: 0,
        enabled: true,
        // start: that.resizeStart,
        // stop: that.resizeStop, // resize item里面的内容，比如表格之类的
        handles: {
          s: true,
          e: true,
          n: true,
          w: true,
          se: true,
          ne: true,
          sw: true,
          nw: true,
        },
      },
      // enable/disable auto horizontal scrolling when on edge of grid -perfect!
      disableScrollHorizontal: true,
      // outerMargin: false,
      // 拖拽需要添加的属性
      // enableEmptyCellDrop: true,
      // emptyCellDropCallback: this.emptyCellClick.bind(this.dashboard),
    };
    this.options = Map(options).toJS();
  }

  emptyCellClick(event: MouseEvent, item: GridsterItem) {
    console.log(this);
    console.log('empty cell click', event, item);
    // console.log('当前的全局环境', dashboard);
    // const that: any = this;
    // item.rows = 6;
    // item.cols = 6;
    // item.content = '我是拖拽添加的元素';
    // that.push(item);
  }

  changedOptions() {
    if (this.options.api && this.options.api.optionsChanged) {
      this.options.api.optionsChanged();
    }
  }

  removeItem($event, item) {
    $event.preventDefault();
    $event.stopPropagation();
    this.dashboard.splice(this.dashboard.indexOf(item), 1);
  }

  addItem() {
    this.id++;
    this.dashboard.push({ x: 0, y: 0, cols: 1, rows: 1, content: '我是围观元素', id: this.id });
  }


  toppingItem() {
    // perfect!!!完美实现，只要将 要置顶的元素的y值置为0 ，将其他元素的y值自定添加 currentY值即可！
    this.currentDahsboard = this.dashboard[0];
    console.log('当前的控件元素', this.currentDahsboard);
    const currentY = this.currentDahsboard.y;
    console.log('当前的Y值', currentY);
    this.currentDahsboard.y = 0;
    for (const item of this.dashboard) {
      if (item.id != this.currentDahsboard.id) {
        item.y += currentY;
      }
    }
    this.changedOptions();
  }
  dragStartHandler(ev) {
    console.log('drag开始时的调用', ev);
    ev.dataTransfer.dropEffect = 'none';
    this.dragev = ev;
  }
  allowDrop(event) {
    // console.log('drag结束时的调用', event);
    // event.preventDefault();
  }

  dragenter($event?) {
    console.log('我进入了可拖拽区域了！');
    // $event.preventDefault();
    if (!this.newDragItem) {
      this.id++;
      const item: any = new Object();
      item.rows = 1;
      item.cols = 1;
      item.content = '我是拖拽添加的元素';
      item.id = this.id;
      item.initCallback = this.initItem.bind(this),
        this.newDragItem = item;

      this.dashboard.push(this.newDragItem);
    }
    console.log($event);
    // 疯狂操作DOM节点是不对的，所以这里只获取一次
    if (!this.dargItem) {
      this.dargItem = document.getElementById(`item${this.newDragItem.id}`);
    } else {
      // console.log(this.dargItem);
      // this.dargItem.classList.add('gridster-item-moving');
      // const style = `translate3d(${$event.offsetX}px, ${$event.offsetY}px, 0px)`;
      // // console.log(style);
      // // this.dargItem.style.transform = style;
      // this.dargItem.style.setProperty('transform', style, 'important');
    }


  }
  initItem(item: GridsterItem, itemComponent: GridsterItemComponent) {
    console.log('当前元素初始化完成之后输出的this', this);
    console.log('当前元素的itemComponent', itemComponent);
    // 获取到当前要自定义的控件元素的 itemcomponent

    // const myEvent = new Event('dragend');
    // let mynode: any = document.getElementById('aa');
    // node.dispatchEvent(myEvent);
    // document.body.onkeydown = this.aa;
    // this.fireKeyEvent(document.body, 'keydown', 27);

    // mynode.onkeydown = this.aa;
    // this.fireKeyEvent(mynode, 'keydown', 27);

    // this.fireKeyEvent(mynode, 'keydown', 27);
    // this.fireKeyEvent(window, 'keydown', 27);
    // console.log(window);
    // const myEvent = new Event('keydown');
    // myEvent.keyCode = 27;
    // window.dispatchEvent();

    window.onkeydown = this.bb;
    this.myfireKeyEvent('keydown', 27);


    // const eventUp = document.createEvent("MouseEvents");
    // const sx = window.innerWidth / 2;
    // const sy = window.innerHeight / 2;
    // const cx = sx;
    // const cy = sy;
    // eventUp.initMouseEvent("mouseup", true, true, window, 0, sx, sy, cx, cy, false, false, false, false, 0, null);
    // let node: any = document.getElementById('aa');
    // node.dispatchEvent(eventUp);

    this.dragItemComponent = itemComponent;
    this.dragItemComponent.drag.makeDrag();
    this.dragItemComponent.drag.dragStart(this.dragev);
  }

  // dragover($event?) {
  //   console.log('我在移动中。。。。。');
  // }
  dragEnd($event) {

    console.log('我宣布拖拽结束了', $event);
  }

  mouseup() {
    console.log('鼠标离开了！');
  }


  aa($event) {
    console.log($event);
    if ($event.keyCode == 27) {
      console.log('aaaa回车了回车了回车了');
    }

  }
  bb($event) {
    console.log($event);
    if ($event.keyCode == 27) {
      console.log('bbbbbbb');
    }

  }





  fireKeyEvent(el, evtType, keyCode) {
    const doc = el.ownerDocument;
    const win = doc.defaultView || doc.parentWindow;
    let evtObj;
    if (doc.createEvent) {
      if (win.KeyEvent) {
        evtObj = doc.createEvent('KeyEvents');
        evtObj.initKeyEvent(evtType, true, true, win, false, false, false, false, keyCode, 0);
      } else {
        evtObj = doc.createEvent('UIEvents');
        Object.defineProperty(evtObj, 'keyCode', {
          get: function () { return this.keyCodeVal; }
        });
        Object.defineProperty(evtObj, 'which', {
          get: function () { return this.keyCodeVal; }
        });
        evtObj.initUIEvent(evtType, true, true, win, 1);
        evtObj.keyCodeVal = keyCode;
        if (evtObj.keyCode !== keyCode) {
          console.log("keyCode " + evtObj.keyCode + " 和 (" + evtObj.which + ") 不匹配");
        }
      }
      el.dispatchEvent(evtObj);
    } else if (doc.createEventObject) {
      evtObj = doc.createEventObject();
      evtObj.keyCode = keyCode;
      el.fireEvent('on' + evtType, evtObj);
    }
  }
  myfireKeyEvent(evtType, keyCode) {
    const doc: any = document;
    const win: any = window;
    let evtObj;
    if (doc.createEvent) {
      if (win.KeyEvent) {
        evtObj = doc.createEvent('KeyEvents');
        evtObj.initKeyEvent(evtType, true, true, win, false, false, false, false, keyCode, 0);
      } else {
        evtObj = doc.createEvent('UIEvents');
        Object.defineProperty(evtObj, 'keyCode', {
          get: function () { return this.keyCodeVal; }
        });
        Object.defineProperty(evtObj, 'which', {
          get: function () { return this.keyCodeVal; }
        });
        evtObj.initUIEvent(evtType, true, true, win, 1);
        evtObj.keyCodeVal = keyCode;
        if (evtObj.keyCode !== keyCode) {
          console.log("keyCode " + evtObj.keyCode + " 和 (" + evtObj.which + ") 不匹配");
        }
      }
      doc.dispatchEvent(evtObj);
    } else if (doc.createEventObject) {
      evtObj = doc.createEventObject();
      evtObj.keyCode = keyCode;
      doc.fireEvent('on' + evtType, evtObj);
    }
  }
}
