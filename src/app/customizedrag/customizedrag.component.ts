import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';

import { DisplayGrid, GridsterConfig, GridsterItem, GridType, CompactType } from 'angular-gridster2';

@Component({
  selector: 'app-customizedrag',
  templateUrl: './customizedrag.component.html',
  styleUrls: ['./customizedrag.component.css'],
  // 注意：在board中没有这项注解，现在注释掉，看看有没有影响
  // changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class CustomizedragComponent implements OnInit {
  options: GridsterConfig;
  dashboard: Array<GridsterItem>;

  ngOnInit() {
    this.dashboard = [
      { cols: 2, rows: 1, y: 0, x: 0 },
      { cols: 2, rows: 2, y: 0, x: 2 },
      { cols: 1, rows: 1, y: 0, x: 4 },
      { cols: 3, rows: 2, y: 1, x: 4 },
      { cols: 1, rows: 1, y: 4, x: 5 },
      { cols: 1, rows: 1, y: 2, x: 1 },
      { cols: 2, rows: 2, y: 5, x: 5 },
      { cols: 2, rows: 2, y: 3, x: 2 },
      { cols: 2, rows: 1, y: 2, x: 2 },
      { cols: 1, rows: 1, y: 3, x: 4 },
      { cols: 1, rows: 1, y: 0, x: 6 }
    ];

    this.options = {
      gridType: GridType.VerticalFixed,
      // displayGrid: DisplayGrid.Always,
      displayGrid: DisplayGrid.None,
      compactType: CompactType.CompactUp,
      // itemChangeCallback: that.itemResize,
      // 每个item初始化时的回调
      // itemResizeCallback: that.resize,
      minCols: 12,
      maxCols: 12,
      minRows: 1,
      // 最大行数，默认值是100，这里改成999
      maxRows: 999,
      maxItemCols: 100,
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
        ignoreContentClass: 'ignore-drag',
        ignoreContent: false,
        // dragHandleClass: 'drag-handler',
        // stop: that.eventStop.bind(this),
        // start: that.eventStart.bind(this),
        dropOverItems: false,
        // dropOverItemsCallback: RoutesPcComponent.overlapEvent,
      },
      resizable: {
        delayStart: 0,
        enabled: true,
        // start: that.resizeStart,
        // 使用bind，修改resizeStop中的this指向
        // stop: that.resizeStop.bind(this), // resize item里面的内容，比如表格之类的
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
      scrollToNewItems: true
    };
  }


  changedOptions() {
    if (this.options.api && this.options.api.optionsChanged) {
      this.options.api.optionsChanged();
    }
  }


  // 通过bind改变this的指向，在不同的地方，将不同的dashboar的或者不同tab中content（dashbaord）传进来
  // 这样就能给不同的dashboard push不同的值了

  emptyCellClick(flag, event: MouseEvent, item: GridsterItem) {
    console.log('ggggggggggggg', flag);
    console.log(event);
    console.log(this);
    console.log('empty cell click', event, item);
    // console.log('当前的全局环境', dashboard);
    const that: any = this;
    item.rows = 6;
    item.cols = 6;
    item.content = '我是拖拽添加的元素';
    that.push(item);
  }

  dragStartHandler(ev) {
    console.log('drag开始时的调用', ev);
    ev.dataTransfer.setData('text/plain', 'Drag Me Button');
    ev.dataTransfer.dropEffect = 'copy';
    ev.aaa = 'wwww';
  }
  allowDrop(event) {
    // console.log('drag结束时的调用', event);
    // event.preventDefault();
  }
}
