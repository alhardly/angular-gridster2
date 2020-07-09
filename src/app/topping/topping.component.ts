import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CompactType, GridsterConfig, GridsterItem, GridsterItemComponent, GridsterPush, GridType, DisplayGrid } from 'angular-gridster2';
import { Map, is } from 'immutable';

@Component({
  selector: 'app-topping',
  templateUrl: './topping.component.html',
  encapsulation: ViewEncapsulation.None
})

/* 
  思路：
  记录当前要置顶元素的y值=currentY值，然后将置顶元素的y值置为0 ，
  然后其他元素的y值，都加上currentY值，因为compactType 为Up，所以没有关系的，应该会自适应
*/
export class ToppingComponent implements OnInit {
  id = 3333;
  // 当前的控件元素
  currentDahsboard: any = null;
  options: GridsterConfig;
  options1: GridsterConfig;
  dashboard: Array<GridsterItem>;
  dashboard1: Array<GridsterItem>;

  ngOnInit() {

    this.dashboard = [

      { cols: 6, rows: 4, y: 0, x: 0, content: '我是a元素', id: '002' },
      { cols: 6, rows: 4, y: 0, x: 4, content: '我是b元素', id: '003' },
      { cols: 12, rows: 6, y: 4, x: 4, content: '我是c元素', id: '004' },
      { cols: 6, rows: 6, y: 100, x: 0, content: '我是将要置顶的元素', id: '001' },

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
      enableEmptyCellDrop: true,
      emptyCellDropCallback: this.emptyCellClick.bind(this.dashboard),
    };
    this.options1 = Map(options).toJS();
    this.options = Map(options).toJS();
    console.log(this.options);
    console.log(this.options1);
  }

  emptyCellClick(event: MouseEvent, item: GridsterItem) {
    console.log(this);
    console.log('empty cell click', event, item);
    // console.log('当前的全局环境', dashboard);
    const that: any = this;
    item.rows = 1;
    item.cols = 1;
    item.content = 'drag';
    that.push(item);
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
    this.currentDahsboard = this.dashboard[this.dashboard.length - 1];
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
    // 调换一下元素位置，以让程序无限启动
    const last: any = this.dashboard.pop();
    this.dashboard.unshift(last);

  }
  dragStartHandler(ev) {
    console.log('drag开始时的调用', ev);
    ev.dataTransfer.setData('text/plain', 'Drag Me Button');
    ev.dataTransfer.dropEffect = 'copy';
  }
  allowDrop(event) {
    // console.log('drag结束时的调用', event);
    // event.preventDefault();
  }
  save() {
    let aa = JSON.parse(JSON.stringify(this.options));
    console.log(aa);
  }
}
