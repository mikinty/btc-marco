/** 
 * @file Class definition for charts used in this project.
 * @author mikinty
 */

import *  as CONST from './CONST.js';

/**
 * Chart object to plot curves and keep track of plotting information.
 */
class Chart {
  constructor (width = CONST.CHART_WIDTH, height = CONST.CHART_HEIGHT) {
    this.canvas_wrapper = document.createElement('div');
    this.canvas_wrapper.classList.add(CONST.CHART_WRAPPER_CLASS);

    // Create chart canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.chart_padding = CONST.CHART_PADDING;

    /* Defines the bounds of this chart in terms of the data this chart
     * will be plotting. We do this so that we can operate on our data
     * the way it was originally defined, and let the chart automatically
     * decide how to plot the data.
     */
    this.context = {
      x_low:  null,
      x_high: null,
      y_low:  null,
      y_high: null
    };

    // Store curves
    this.curves = new Map();

    // Add canvas to wrapper div
    this.canvas_wrapper.appendChild(this.canvas);
  }

  /**
   * Sets the data context for this chart so the plotting
   * function knows how to plot points properly. 
   * 
   * @param {float[]} x_list x values of context 
   * @param {float[]} y_list y values of context
   */
  set_context (x_list, y_list) {
    let y_low = Math.min(...y_list);
    let y_high = Math.max(...y_list);
    let padding = this.chart_padding*(y_high - y_low);

    this.context.x_low  = Math.min(...x_list);
    this.context.x_high = Math.max(...x_list);
    this.context.y_low  = y_low - padding;
    this.context.y_high = y_high + padding;
  }

  get_context_x (x) {
    return ((x - this.context.x_low)/(this.context.x_high - this.context.x_low))*this.canvas.width;
  }

  get_context_y (y) {
    return this.canvas.height - ((y - this.context.y_low)/(this.context.y_high - this.context.y_low))*this.canvas.height;
  }

  /** Draws specified points as a curve on a canvas
   * 
   *  @param {float[][]} points Points of the curve
   *  @param {float} start_x x-coordinate of the canvas to start at
   *  @param {float} end_x x-coordinate of the canvas to end at
   *  @param {color hex} color Color to draw curve. Defaults to white.
   */
  plot_curve (points, name, color=CONST.WHITE, line_width = 1) {
    if (this.context.x_low == null || this.context.x_high == null || 
        this.context.y_low == null || this.context.y_high == null) {
      throw new Error('Context not init');
    }

    if (points.length != 2) {
      throw new Error('points does not have x and y coordinates');
    }

    if (points[0].length != points[1].length) {
      throw new Error('points has unequal # of x and y coordinates');
    }

    // Save these set of points
    this.curves.set(name, points);

    // Plotting 
    let ctx = this.canvas.getContext('2d');

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = line_width;

    for (let idx = 0; idx < points[0].length; idx++) {
      // Translate points to this chart object's context
      let curr_x = this.get_context_x(points[0][idx]);
      let curr_y = this.get_context_y(points[1][idx]);

      if (idx == 0) {
        ctx.moveTo(curr_x, curr_y);
      } else {
        ctx.lineTo(curr_x, curr_y);
      }
    }
    ctx.stroke();
  }
}

export { Chart };