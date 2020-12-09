import {
  SCROLLER_SIZE,
  SCROLLER_TRACK_SIZE,
  SCROLLER_COLOR,
  SCROLLER_FOCUS_COLOR,
  HEADER_BG_COLOR
} from "./constants.js";

class Scroller {
  constructor(grid) {
    this.grid = grid;
    this.horizontalScroller = {
      x: 0, // 滚动条位移
      move: false, // 是否开始滚动中
      focus: false, // 是否获得焦点
      size: 0, // 滚动滑块的尺寸
      ratio: 1, // 画布实际滚动的位移和滚动条实际滚动的位移之比
      has: false // 是否有滚动条
    };
    this.verticalScroller = {
      y: 0,
      move: false,
      focus: false, // 是否获得焦点
      size: 0,
      ratio: 1,
      has: false
    };
  }
  /**
   * 初始化滚动条配置
   */
  reset() {
    const {
      width,
      height,
      tableWidth,
      tableHeight,
      tableHeaderHeight,
      verticalScrollerSize,
      horizontalScrollerSize
    } = this.grid;
    const viewWidth = width - verticalScrollerSize;
    const viewHeight = height - tableHeaderHeight - horizontalScrollerSize;
    const horizontalRatio = viewWidth / tableWidth;
    const verticalRatio = viewHeight / tableHeight;
    if (horizontalRatio >= 1) {
      this.horizontalScroller.size = 0;
    } else {
      this.horizontalScroller.size = parseInt(horizontalRatio * viewWidth);
    }
    if (verticalRatio >= 1) {
      this.verticalScroller.size = 0;
    } else {
      this.verticalScroller.size = parseInt(verticalRatio * viewHeight);
    }
    if (this.horizontalScroller.size < 30) {
      this.horizontalScroller.size = 30;
    }
    if (this.verticalScroller.size < 30) {
      this.verticalScroller.size = 30;
    }

    this.horizontalScroller.has = !(tableWidth <= width - SCROLLER_TRACK_SIZE);
    this.verticalScroller.has = !(tableHeight <= height - SCROLLER_TRACK_SIZE);

    // 计算滚动距离的比例
    this.horizontalScroller.ratio = this.horizontalScroller.has
      ? (width -
          SCROLLER_TRACK_SIZE -
          this.horizontalScroller.size -
          SCROLLER_SIZE) /
        (tableWidth + SCROLLER_TRACK_SIZE - width)
      : 0;
    this.verticalScroller.ratio = this.verticalScroller.has
      ? (height -
          tableHeaderHeight -
          SCROLLER_TRACK_SIZE -
          this.verticalScroller.size -
          SCROLLER_SIZE) /
        (tableHeight + SCROLLER_TRACK_SIZE - height)
      : 0;

    this.horizontalScroller.x = 0
    this.verticalScroller.y = 0
    this.grid.scrollX = 0
    this.grid.scrollY = 0
  }
  update(diff, dir) {
    if (dir === "HORIZONTAL") {
      this.grid.scrollX += diff;
    } else if (dir === "VERTICAL") {
      this.grid.scrollY += diff;
    }
    this.setPosition();
  }
  setPosition() {
    this.horizontalScroller.x = -parseInt(
      this.grid.scrollX * this.horizontalScroller.ratio
    );
    this.verticalScroller.y = -parseInt(
      this.grid.scrollY * this.verticalScroller.ratio
    );
  }
  // 鼠标位移是否在滚动轨道范围区域内
  isInsideHorizontalScroller(mouseX, mouseY) {
    return (
      mouseX >= 0 &&
      mouseX <= this.grid.width - SCROLLER_TRACK_SIZE &&
      mouseY > this.grid.height - SCROLLER_TRACK_SIZE &&
      mouseY < this.grid.height - (SCROLLER_TRACK_SIZE - SCROLLER_SIZE) / 2
    );
  }
  // 鼠标位移是否在滚动滑块范围区域内
  isInsideHorizontalScrollerBar(mouseX, mouseY) {
    return (
      this.horizontalScroller.has &&
      mouseX >= this.horizontalScroller.x &&
      mouseX <=
          this.horizontalScroller.x +
          this.horizontalScroller.size +
          SCROLLER_SIZE &&
      mouseY > this.grid.height - SCROLLER_TRACK_SIZE &&
      mouseY < this.grid.height
    );
  }
  isInsideVerticalScroller(mouseX, mouseY) {
    return (
      mouseX > this.grid.width - SCROLLER_TRACK_SIZE &&
      mouseX < this.grid.width - (SCROLLER_TRACK_SIZE - SCROLLER_SIZE) / 2 &&
      mouseY > this.grid.tableHeaderHeight &&
      mouseY < this.grid.height - SCROLLER_TRACK_SIZE
    );
  }
  isInsideVerticalScrollerBar(mouseX, mouseY) {
    return (
      this.verticalScroller.has &&
      mouseX > this.grid.width - SCROLLER_TRACK_SIZE &&
      mouseX < this.grid.width &&
      mouseY > this.grid.tableHeaderHeight + this.verticalScroller.y &&
      mouseY <
      this.grid.tableHeaderHeight +
          this.verticalScroller.y +
          this.verticalScroller.size +
          SCROLLER_SIZE
    );
  }
  mouseDown(x, y) {
    if (this.isInsideHorizontalScrollerBar(x, y)) {
      this.mouseOriginalX = x;
      this.horizontalScroller.move = true;
    } else if (this.isInsideVerticalScrollerBar(x, y)) {
      this.mouseOriginalY = y;
      this.verticalScroller.move = true;
    }
  }
  mouseMove(x, y) {
    this.horizontalScroller.focus = this.isInsideHorizontalScroller(x, y)
      ? true
      : false;
    this.verticalScroller.focus = this.isInsideVerticalScroller(x, y)
      ? true
      : false;
    if (this.horizontalScroller.move) {
      const diffX = x - this.mouseOriginalX;
      const movedX = this.horizontalScroller.x + diffX;
      const trachWidth =
        this.grid.width -
        this.horizontalScroller.size -
        SCROLLER_TRACK_SIZE -
        SCROLLER_SIZE;

      if (movedX > 0 && movedX < trachWidth) {
        this.horizontalScroller.x += diffX;
        this.grid.scrollX =
          -this.horizontalScroller.x / this.horizontalScroller.ratio;
      } else if (movedX <= 0) {
        this.horizontalScroller.x = 0;
        this.grid.scrollX = 0;
      } else {
        this.horizontalScroller.x = trachWidth;
        this.grid.scrollX =
          this.grid.width - this.grid.tableWidth - SCROLLER_TRACK_SIZE;
      }
      this.mouseOriginalX = x;
    } else if (this.verticalScroller.move) {
      const diffY = y - this.mouseOriginalY;
      const movedY = this.verticalScroller.y + diffY;
      const trackHeight =
        this.grid.height -
        this.grid.tableHeaderHeight -
        this.verticalScroller.size -
        SCROLLER_TRACK_SIZE -
        SCROLLER_SIZE;
      if (movedY > 0 && movedY < trackHeight) {
        this.verticalScroller.y = movedY;
        this.grid.scrollY =
          -this.verticalScroller.y / this.verticalScroller.ratio;
      } else if (movedY <= 0) {
        this.verticalScroller.y = 0;
        this.grid.scrollY = 0;
      } else {
        this.verticalScroller.y = trackHeight;
        this.grid.scrollY =
          this.grid.height - this.grid.tableHeight - SCROLLER_TRACK_SIZE;
      }
      this.mouseOriginalY = y;
    }
  }
  mouseUp() {
    this.horizontalScroller.move = false;
    this.verticalScroller.move = false;
  }
  draw() {
    const {
      border,
      borderColor,
      borderWidth,
      fillColor,
      width,
      height,
      tableHeaderHeight,
      painter
    } = this.grid
    const scrollerWidth = width - SCROLLER_TRACK_SIZE;
    const scrollerHeight = height - SCROLLER_TRACK_SIZE;
    const trackOffset = SCROLLER_TRACK_SIZE / 2;
    const thumbOffset = SCROLLER_SIZE / 2;

    // 横向滚动条
    // 轨道
    painter.drawRect(
      0,
      scrollerHeight,
      scrollerWidth + SCROLLER_TRACK_SIZE,
      SCROLLER_TRACK_SIZE,
      {
        fillColor,
        borderColor: border ? borderColor : undefined,
        borderWidth
      }
    );
    // 滑块结束位置线条
    border && painter.drawLine(
      [
        [scrollerWidth, scrollerHeight],
        [scrollerWidth, scrollerHeight + SCROLLER_TRACK_SIZE]
      ],
      {
        borderColor,
        borderWidth
      }
    );
    // 滑块
    if (this.horizontalScroller.has) {
      painter.drawLine(
        [
          [
              this.horizontalScroller.x +
              thumbOffset,
            scrollerHeight + trackOffset
          ],
          [
              this.horizontalScroller.x +
              thumbOffset +
              this.horizontalScroller.size,
            scrollerHeight + trackOffset
          ]
        ],
        {
          borderColor:
            this.horizontalScroller.move || this.horizontalScroller.focus
              ? SCROLLER_FOCUS_COLOR
              : SCROLLER_COLOR,
          borderWidth: SCROLLER_SIZE,
          lineCap: "round"
        }
      );
    }

    // 纵向滚动条
    painter.drawRect(
      scrollerWidth,
      0,
      SCROLLER_TRACK_SIZE,
      scrollerHeight,
      {
        fillColor,
        borderColor: border ? borderColor : undefined,
        borderWidth
      }
    );
    painter.drawRect(
      scrollerWidth,
      0,
      SCROLLER_TRACK_SIZE,
      tableHeaderHeight,
      {
        fillColor: HEADER_BG_COLOR,
        borderColor: border ? borderColor : undefined,
        borderWidth
      }
    );
    // 滑块起始位置线条
    // painter.drawLine(
    //   [
    //     [scrollerWidth, this.grid.tableHeaderHeight],
    //     [scrollerWidth + SCROLLER_TRACK_SIZE, this.grid.tableHeaderHeight]
    //   ],
    //   {
    //     borderColor: this.grid.borderColor,
    //     borderWidth: this.grid.borderWidth
    //   }
    // );
    // 滑块
    if (this.verticalScroller.has) {
      painter.drawLine(
        [
          [
            scrollerWidth + trackOffset,
            this.verticalScroller.y + thumbOffset + tableHeaderHeight
          ],
          [
            scrollerWidth + trackOffset,
            this.verticalScroller.y +
              thumbOffset +
              tableHeaderHeight +
              this.verticalScroller.size
          ]
        ],
        {
          borderColor:
            this.verticalScroller.move || this.verticalScroller.focus
              ? SCROLLER_FOCUS_COLOR
              : SCROLLER_COLOR,
          borderWidth: SCROLLER_SIZE,
          lineCap: "round"
        }
      );
    }
  }
}

export default Scroller;
