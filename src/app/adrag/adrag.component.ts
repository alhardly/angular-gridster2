// 大概是位置没算清楚
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, ɵɵresolveBody } from '@angular/core';
import {
  CompactType, GridsterConfig, GridsterItem, GridsterItemComponent, GridsterPush, GridType, GridsterComponentInterface,
  DisplayGrid,
} from 'angular-gridster2';

// import { GridsterDraggable } from 'angular-gridster2/lib/gridsterDraggable.service';
import { Map, is } from 'immutable';

@Component({
  selector: 'app-adrag',
  templateUrl: './adrag.component.html',
  encapsulation: ViewEncapsulation.None
})
export class AdragComponent implements OnInit {
  id = 3333;
  // 当前的控件元素
  currentDahsboard: any = null;
  options: GridsterConfig;
  dashboard: Array<GridsterItem>;

  // 拖拽的原节点对象
  dragSrcNode: any;
  // 拖拽时复制的节点
  dragCopyNode: any;

  // 光标与节点坐标的距离
  dragLeftDiff;
  dragTopDiff;

  // 新增的拖拽元素
  newDragItem;

  // 是否拖拽
  isDragging = false;

  // 新生成拖拽项目的实例
  dragItemComponent;

  // 拖拽的鼠标事件
  dragev;
  isFirstDragMove;

  gridsterComponent;

  constructor() {

  }

  ngOnInit() {
    // console.log(GridsterDraggable);

    this.dashboard = [
    ];

    const options = {
      gridType: GridType.VerticalFixed, //
      displayGrid: DisplayGrid.Always,
      compactType: CompactType.CompactUp,
      // // itemChangeCallback: that.itemResize,
      // // 每个item初始化时的回调
      // itemResizeCallback: that.resize,
      initCallback: this.gridInit.bind(this),
      minCols: 12,
      maxCols: 12,
      minRows: 1,
      maxItemCols: 12,
      minItemCols: 1,
      maxItemRows: 100,
      maxRows: 1000,
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
      disableAutoPositionOnConflict: false,
    };
    this.options = Map(options).toJS();
  }

  changedOptions() {
    if (this.options.api && this.options.api.optionsChanged) {
      this.options.api.optionsChanged();
    }
  }
  gridInit(grid: GridsterComponentInterface) {
    this.gridsterComponent = grid;
    console.log('gridInit', this.gridsterComponent);
  }
  // 这里监听的mouseDown事件，可能是双击也可能是拖拽，所以要判断，然后如果是拖拽才给isDragging置为true
  catchStart($event) {
    // 先确定是不是拖拽事件，还是点击或者双击，给他300毫秒的时间
    // 记录当前的时间
    const firstTime = new Date().getTime();
    const dragSetTimeout = setTimeout(() => {
      this.dragStart($event);
    }, 300);

    document.onmouseup = () => {
      const lastTime = new Date().getTime();
      // 如果在300毫秒内放开了鼠标，那就不算是拖拽事件
      if (lastTime - firstTime < 300) {
        clearTimeout(dragSetTimeout);
        document.onmousemove = null;
        document.onmouseup = null;
        this.isDragging = false;
      }
    };

    // 如果是按下了就马上移动，就马上执行拖拽事件,
    // 执行和延迟300毫秒执行的事情，所以把那个封装起来直接调用，如果实在300毫秒前，就执行这个函数，在300秒之后，这个onmousemove就被后面的替代了
    document.onmousemove = () => {
      const lastTime = new Date().getTime();
      if (lastTime - firstTime < 300) {
        clearTimeout(dragSetTimeout);
        this.dragStart($event);
      }
    };

  }

  dragStart($event) {
    // 设置生成控件的参数和拖拽的节点
    this.dragSrcNode = $event.target;
    this.isDragging = true;
    this.isFirstDragMove = true;

    // 监听鼠标移动
    document.onmousemove = (event) => {
      if (!this.isDragging) {
        return;
      }
      this.dragMouseMove(event);
    };

    // 监听鼠标松开动作
    document.onmouseup = (event) => {
      if (!this.isDragging) {
        return;
      }
      this.isDragging = false;
      this.dragMouseUp();
    };
  }


  // 按下鼠标，执行的操作
  dragMouseDown($event) {

    // 1.克隆临时节点，跟随鼠标进行移动
    this.dragCopyNode = this.dragSrcNode.cloneNode(true);

    // // 原生js获取 一个dom元素距离页面可视区域的位置值
    const rectObject = this.dragSrcNode.getBoundingClientRect();
    // // 修改这个拖拽节点的id
    this.dragCopyNode.id = 'dragNode';
    this.dragCopyNode.style.zIndex = -1;
    const parentEl: any = this.dragSrcNode.parentNode;
    parentEl.append(this.dragCopyNode);

    // 重新获取拖拽的节点，并且修改其样式,让其位置和原目标节点重合
    this.dragCopyNode = parentEl.querySelector("#dragNode");
    this.dragCopyNode.style.top = rectObject.y + 'px';
    this.dragCopyNode.style.left = rectObject.x + 'px';
    this.dragCopyNode.style.cursor = 'move';


    // 取得拖转元素和鼠标之前的位置差值
    this.dragLeftDiff = $event.clientX - rectObject.x;
    this.dragTopDiff = $event.clientY - rectObject.y;


  }

  dragMouseMove($event) {

    if (this.isFirstDragMove) {
      this.isFirstDragMove = false;
      // 复制节点并计算复制节点的位置
      this.dragMouseDown($event);
      // 将复制节点的层级往上提，之前在样式中设置为-1是为了在能触发双击事件
      this.dragCopyNode.style.zIndex = 999;
      // 让其他控件元素不可选中
      const gridsterItemContent = document.getElementsByClassName('gridster-item-content');
      if (gridsterItemContent[0] && !gridsterItemContent[0].classList.contains('dragging')) {
        for (let itemIndex = 0; itemIndex < gridsterItemContent.length; itemIndex++) {
          gridsterItemContent[itemIndex].classList.add('dragging');
        }
      }
      // 给body添加不允许选择文字的样式
      if (!document.body.classList.contains('dragging')) {
        document.body.classList.add('dragging');
      }
    }
    // 计算坐标，实现鼠标跟随
    this.dragCopyNode.style.top = $event.clientY - this.dragTopDiff + 'px';
    this.dragCopyNode.style.left = $event.clientX - this.dragLeftDiff + 'px';



    // 如果鼠标位置在这个gridster中
    const gridsterNode = document.getElementsByTagName('gridster')[0];
    console.log('当前的拖拽空间', gridsterNode);

    const gridsterNodeRectObject = gridsterNode.getBoundingClientRect();

    let margin: any = getComputedStyle(gridsterNode, null).padding ? getComputedStyle(gridsterNode, null).padding : '0px';
    margin = Number.parseInt(margin);

    if (gridsterNodeRectObject.left < $event.clientX - margin &&
      $event.clientX - margin < gridsterNodeRectObject.right &&
      gridsterNodeRectObject.top < $event.clientY - margin && $event.clientY - margin < gridsterNodeRectObject.bottom) {
      this.dragev = $event;
      // 如果在这个之中，则释放鼠标指针，
      console.log('我可以变身啦啦啦啦');

      // 调用添加拖拽控件函数
      this.addItemByDrag();
      document.onmousemove = null;

    }


  }

  addItemByDrag() {
    console.log('啦啦啦，我进来啦=====');
    document.body.classList.remove('dragging');
    const item: any = new Object();
    item.rows = 5;
    item.cols = 6;
    item.content = '我是拖拽添加的元素';
    item.id = this.id++;
    item.initCallback = this.initItem.bind(this);

    this.newDragItem = item;
    this.dashboard.push(this.newDragItem);
    this.changedOptions();
    console.log('this.dashboard', this.dashboard);
    // 并不是最后一个就是currentDahsboard!

  }

  initItem(item: GridsterItem, itemComponent: GridsterItemComponent) {
    console.log('当前的项目，', item);
    console.log('当前元素初始化完成后的this.dragev', this.dragev);
    console.log('当前元素的itemComponent', itemComponent);
    this.dragItemComponent = itemComponent;

    // TODO:明天试试有没有其他方法，没有的话，就在生成拖拽空间元素之后，计算当前鼠标对应的（x,y）坐标，
    // 然后和置顶一样移到这里即可，

    // 让新增的控件元素位置和鼠标位置重合--目前只会进入最外层，因为最外层有padding，后面如果去掉最外层的话，还需要做tab的push
    // 计算出当前鼠标的位置所在的坐标（x,y）,所以要先计算出鼠标和gridster的相对距离
    const gridster: any = this.dragItemComponent.gridster.el;

    const gridsterNodeRectObject = gridster.getBoundingClientRect();
    const gridsterLeft = gridsterNodeRectObject.left;
    const gridsterTop = gridsterNodeRectObject.top;
    // 得到鼠标距离拖拽区域gridster的左上距离-开始计算落在哪个（x,y）内，然后和置顶一样，移过来
    // y方向可能会有滚动条，所以要加上滚动的距离
    const diffTop = this.dragev.clientY - gridsterTop + this.dragItemComponent.gridster.el.scrollTop;
    const diffLeft = this.dragev.clientX - gridsterLeft;

    // 计算x轴，（本来是想计算12列的真实宽度和十三个边距的情况，如果鼠标刚好落在某个边距上面，应该怎么算）管他有没有边距呢，管他外边距和内边距相不相等呢，总体宽度均分！这样就没有偏差了，
    // 包括边距和列加起来均分，无论是落在边距还是列上，只要是这个范围内的，那就是你这个列的
    // x=MATH.ceil(diffLeft/均分宽度),但是是从0开始的，所以要 -1

    // 均分宽度=总宽度/列数
    const averageWidth = this.dragItemComponent.gridster.curWidth / this.dragItemComponent.gridster.columns;

    let x = Math.ceil(diffLeft / averageWidth) - 1;

    // 因为每一列的高度时固定的，但是列数不定，所以列数的算法和行数的算法不同，列高度+上边距=50 和curRowHeight相等，后期要改的话，这个就要改
    // y=Math.ceil(diffTop/（列高度+上边距）)
    const y = Math.ceil(diffTop / this.dragItemComponent.gridster.curRowHeight) - 1;

    // 判断是否x值加上元素的cols大于列数。大于的话，则要处理不越界
    if (x + item.cols + 1 > this.dragItemComponent.gridster.columns) {
      x = this.dragItemComponent.gridster.columns - item.cols;

    }

    console.log(x, y);
    // 好了！开始移动位置了
    // 先修改当前控件的x值，然后遍历其他元素的x值，如果大于等于x值，则x+=当前控件的所占行数


    // 完了，感觉这里要写一个递推！逐层往下往右推！,重新想一下思路哦！应该是在同一行同一列的就往右，否则其他的往下就行了！

    // 递推刻不容缓，递归什么递归，真的是傻逼，啥都没想清楚就递归了，还要想了一下，
    // 因为所有的拖拽空间，在跨列数，要么是一般，要么就是全部，所以，所以只需要将不让座的元素自动往后移就行了，y变，x不变
    const conflictItemArray: any = [];
    let MaxDiffY = item.rows;
    for (let index = 0; index < this.dashboard.length; index++) {
      const currentDahsboard = this.dashboard[index];
      if (currentDahsboard.id == item.id) {
        this.currentDahsboard = currentDahsboard;
        break;
      } else {
        // 如果位置重合了，那么对不住您了，您就往后挪一挪！那么，怎么所位置重合呢
        // 这里要分两种情况判断,一种是冲突,一种是不冲突,这里情况复杂,反正计算出要增加的最大Y值,然后冲突的和在后面的元素都加上Y值就行了

        // 判断元素冲突了或者在其后的情况(排除在外的情况是在其上，其左，其右)
        if ((currentDahsboard.y + currentDahsboard.rows < y) || (currentDahsboard.x + currentDahsboard.rols < x)
          || (currentDahsboard.x > item.rols + x)) {
          continue;
        } else {
          // 如果是在其后的元素或者冲突的元素，先把这些元素保存到conflictItemArray中
          conflictItemArray.push(currentDahsboard);
          // 如果是冲突的元素，需要计算y值
          if (currentDahsboard.y <= item.rows + y) {
            const diffY = item.rows + y - currentDahsboard.y;
            MaxDiffY = MaxDiffY > diffY ? MaxDiffY : diffY;
          }
        }
      }
    }
    this.options.compactType = 'none';
    this.currentDahsboard.x = x;
    this.currentDahsboard.y = y;
    for (const currentConflictDahsboard of conflictItemArray) {

      currentConflictDahsboard.y += MaxDiffY;

    }

    this.changedOptions();
    this.dragItemComponent.drag.makeDrag();
    this.dragItemComponent.drag.dragStart(this.dragev);
    this.options.compactType = 'compactUp';
    this.changedOptions();
    // this.dragItemComponent.drag.dragMove(this.dragev);
    // 拖拽的时候修改鼠标的样式，并且在拖拽结束的回调中清空这个样式设置
    const dragItemEl = this.dragItemComponent.el;
    // dragItemEl.style.setProperty('transform', `translate3d(${translateX}px, ${translateY}px, 0px)`, 'important');
    dragItemEl.style.setProperty('cursor', 'move', 'important');
    dragItemEl.classList.add('dragging');

    // this.dragItemComponent.drag.mouseup = () => {

    //   this.dragMouseUp();
    // };
    // this.dragItemComponent.drag.touchmove = () => {

    //   console.log('我开始移动了');
    // };
    // dragItemEl.style.setProperty('transform', `translate3d(${translateX}px, ${translateY}px, 0px)`, 'important');
    this.dragMouseUp();
  }



  // 松开鼠标处理。清除复制的节点
  dragMouseUp() {
    console.log('松开鼠标');
    this.dragCopyNode.remove();
    // const dragItemEl = this.dragItemComponent.el;
    if (this.dragItemComponent) {
      setTimeout(() => {
        this.dragItemComponent.el.style.setProperty('cursor', 'unset');
        this.dragItemComponent.el.classList.remove('dragging');
      }, 100);

    }
    // 让其他控件元素恢复可选状态
    const gridsterItemContent = document.getElementsByClassName('button-holder');
    if (gridsterItemContent[0] && gridsterItemContent[0].classList.contains('dragging')) {
      for (let itemIndex = 0; itemIndex < gridsterItemContent.length; itemIndex++) {
        gridsterItemContent[itemIndex].classList.remove('dragging');
      }
    }
    const selObj: any = window.getSelection();
    selObj.removeAllRanges();

    // 取消设置的样式
    document.body.classList.remove('dragging');
    // 取消监听
    document.onmousemove = null;
    document.onmouseup = null;


  }

  dbclick() {
    this.addItem();
  }

  addItem() {
    console.log('当前的this.gridsterComponent', this.gridsterComponent);
    const yofNewItem = this.gridsterComponent.rows;
    let board: any = {};
    board.x = 0;
    board.y = yofNewItem;
    board.cols = 12;
    board.rows = 6;
    if (this.isDragging) {
      board.initCallback = this.initItem.bind(this);
    }
    this.dashboard.push(board);

  }

}

