import {Injectable} from '@angular/core';
import {GridsterComponent} from './gridster.component';
import {GridsterUtils} from './gridsterUtils.service';
import {GridsterItem} from './gridsterItem.interface';

@Injectable()
export class GridsterEmptyCell {
  initialItem: GridsterItem;
  emptyCellClick: Function;
  emptyCellDrop: Function;
  emptyCellDrag: Function;
  emptyCellMMove: Function;
  emptyCellUp: Function;
  emptyCellMove: Function;

  constructor(private gridster: GridsterComponent) {
  }

  updateOptions(): void {
    if (this.gridster.$options.enableEmptyCellClick && !this.emptyCellClick && this.gridster.$options.emptyCellClickCallback) {
      this.emptyCellClick = this.gridster.renderer.listen(this.gridster.el, 'click', this.emptyCellClickCb.bind(this));
    } else if (!this.gridster.$options.enableEmptyCellClick && this.emptyCellClick) {
      this.emptyCellClick();
      this.emptyCellClick = null;
    }
    if (this.gridster.$options.enableEmptyCellDrop && !this.emptyCellDrop && this.gridster.$options.emptyCellDropCallback) {
      this.emptyCellDrop = this.gridster.renderer.listen(this.gridster.el, 'drop', this.emptyCellDragDrop.bind(this));
      this.emptyCellMove = this.gridster.renderer.listen(this.gridster.el, 'dragover', this.emptyCellDragOver.bind(this));
    } else if (!this.gridster.$options.enableEmptyCellDrop && this.emptyCellDrop) {
      this.emptyCellDrop();
      this.emptyCellMove();
      this.emptyCellMove = null;
      this.emptyCellDrop = null;
    }
    if (this.gridster.$options.enableEmptyCellDrag && !this.emptyCellDrag && this.gridster.$options.emptyCellDragCallback) {
      this.emptyCellDrag = this.gridster.renderer.listen(this.gridster.el, 'mousedown', this.emptyCellMouseDown.bind(this));
    } else if (!this.gridster.$options.enableEmptyCellDrag && this.emptyCellDrag) {
      this.emptyCellDrag();
      this.emptyCellDrag = null;
    }
  }

  emptyCellClickCb(e): void {
    if (GridsterUtils.checkContentClassForEvent(this.gridster, e)) {
      return;
    }
    const item = this.getValidItemFromEvent(e);
    if (!item || this.gridster.movingItem) {
      return;
    }
    this.gridster.$options.emptyCellClickCallback(event, item);
    this.gridster.cdRef.markForCheck();
  }

  emptyCellDragDrop(e): void {
    const item = this.getValidItemFromEvent(e);
    if (!item) {
      return;
    }
    this.gridster.$options.emptyCellDropCallback(event, item);
    this.gridster.cdRef.markForCheck();
  }

  emptyCellDragOver(e): void {
    e.preventDefault();
    e.stopPropagation();
    if (this.getValidItemFromEvent(e)) {
      e.dataTransfer.dropEffect = 'move';
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  }

  emptyCellMouseDown(e): void {
    if (GridsterUtils.checkContentClassForEvent(this.gridster, e)) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const item = this.getValidItemFromEvent(e);
    if (!item) {
      return;
    }
    this.initialItem = item;
    this.gridster.movingItem = item;
    this.gridster.previewStyle();
    this.emptyCellMMove = this.gridster.renderer.listen('window', 'mousemove', this.emptyCellMouseMove.bind(this));
    this.emptyCellUp = this.gridster.renderer.listen('window', 'mouseup', this.emptyCellMouseUp.bind(this));
  }

  emptyCellMouseMove(e): void {
    e.preventDefault();
    e.stopPropagation();
    const item = this.getValidItemFromEvent(e, this.initialItem);
    if (!item) {
      return;
    }

    this.gridster.movingItem = item;
    this.gridster.previewStyle();
  }

  emptyCellMouseUp(e): void {
    this.emptyCellMMove();
    this.emptyCellUp();
    const item = this.getValidItemFromEvent(e, this.initialItem);
    if (!item) {
      return;
    }
    this.gridster.movingItem = item;
    this.gridster.$options.emptyCellDragCallback(e, this.gridster.movingItem);
    setTimeout(function () {
      this.initialItem = null;
      this.gridster.movingItem = null;
      this.gridster.previewStyle();
    }.bind(this));
    this.gridster.cdRef.markForCheck();
  }

  getValidItemFromEvent(e, oldItem?: GridsterItem): GridsterItem | undefined {
    e.preventDefault();
    e.stopPropagation();
    GridsterUtils.checkTouchEvent(e);
    const rect = this.gridster.el.getBoundingClientRect();
    const x = e.clientX + this.gridster.el.scrollLeft - rect.left;
    const y = e.clientY + this.gridster.el.scrollTop - rect.top;
    const item: GridsterItem = {
      x: this.gridster.pixelsToPositionX(x, Math.floor),
      y: this.gridster.pixelsToPositionY(y, Math.floor),
      cols: this.gridster.$options.defaultItemCols,
      rows: this.gridster.$options.defaultItemRows
    };
    if (oldItem) {
      item.cols = Math.min(Math.abs(oldItem.x - item.x) + 1, this.gridster.$options.emptyCellDragMaxCols);
      item.rows = Math.min(Math.abs(oldItem.y - item.y) + 1, this.gridster.$options.emptyCellDragMaxRows);
      if (oldItem.x < item.x) {
        item.x = oldItem.x;
      } else if (oldItem.x - item.x > this.gridster.$options.emptyCellDragMaxCols - 1) {
        item.x = this.gridster.movingItem.x;
      }
      if (oldItem.y < item.y) {
        item.y = oldItem.y;
      } else if (oldItem.y - item.y > this.gridster.$options.emptyCellDragMaxRows - 1) {
        item.y = this.gridster.movingItem.y;
      }
    }
    if (this.gridster.checkCollision(item)) {
      return;
    }
    return item;
  }
}