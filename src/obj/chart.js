/** 
 * @file Class definition for charts used in this project.
 * @author mikinty
 */

import *  as CONST from '../CONST.js';
import { is_valid_points } from '../lib/contract_lib.js';
import { Line, Curve } from './graph.js';

const CONTEXT_DEFAULT = 'default';

/**
 * Chart object to plot curves and keep track of plotting information.
 */
class Chart {
  constructor (width = CONST.CHART_WIDTH, height = CONST.CHART_HEIGHT, chart_class = CONST.CHART_WRAPPER_CLASS) {
    this.canvas_wrapper = document.createElement('div');
    this.canvas_wrapper.classList.add(chart_class);

    // Create chart canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.chart_padding = CONST.CHART_PADDING;
    this.font_style = 'Lucida Sans';
    this.font_size = 70;
    this.font_padding = this.font_size/2;
    this.axes_padding = 50;
    this.chart_padding_x_axis = this.font_size + this.axes_padding;
    this.chart_padding_y_axis = 50;
    this.chart_padding_y_axis_label = 450;

    /* Defines the bounds of this chart in terms of the data this chart
     * will be plotting. We do this so that we can operate on our data
     * the way it was originally defined, and let the chart automatically
     * decide how to plot the data.
     */
    this.context = new Map();
    this.context.set(
      CONTEXT_DEFAULT, 
      {
        x_low:  null,
        x_high: null,
        y_low:  null,
        y_high: null
      }
    );

    // Store curves
    this.curves = new Map();

    // Add canvas to wrapper div
    this.canvas_wrapper.appendChild(this.canvas);
  }

  clear_chart () {
    let canvas_context = this.canvas.getContext('2d');
    canvas_context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  draw_axes () {
    // Draw axes
    let ctx = this.canvas.getContext('2d');

    ctx.strokeStyle = CONST.WHITE;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(0, this.canvas.height-this.chart_padding_x_axis);
    ctx.lineTo(this.canvas.width - this.chart_padding_y_axis, this.canvas.height-this.chart_padding_x_axis);
    ctx.lineTo(this.canvas.width - this.chart_padding_y_axis, 0);
    ctx.stroke();
  }

  draw_axes_labels (context = this.context.get(CONTEXT_DEFAULT)) {
    if (context.x_low == null || context.x_high == null || 
        context.y_low == null || context.y_high == null) {
      throw new Error('Context not init');
    }

    let ctx = this.canvas.getContext('2d');

    ctx.strokeStyle = CONST.WHITE;
    ctx.fillStyle = CONST.WHITE;
    ctx.lineWidth = 1;
    ctx.font = `${this.font_size}px ${this.font_style}`;
    ctx.fillText(context.x_low, 0, this.canvas.height - this.font_padding);
    ctx.fillText(context.x_high, this.canvas.width - this.chart_padding_y_axis - 450, this.canvas.height - this.font_padding);
    ctx.fillText(context.y_high, this.canvas.width - this.chart_padding_y_axis_label + this.axes_padding, this.font_size);
    ctx.fillText(context.y_low, this.canvas.width - this.chart_padding_y_axis_label + this.axes_padding, this.canvas.height - 2*this.font_size);
  }

  get_context_x (context, x) {
    return ((x - context.x_low)/(context.x_high - context.x_low))*(this.canvas.width - this.chart_padding_y_axis);
  }

  get_context_y (context, y) {
    return this.canvas.height - ((y - context.y_low)/(context.y_high - context.y_low))*(this.canvas.height - this.chart_padding_x_axis) - this.chart_padding_x_axis;
  }

  set_context (context, name = CONTEXT_DEFAULT) {
    if (typeof context === 'undefined') {
      throw new Error('Invalid context passed into set_context');
    }

    if (this.context.has(name)) {
      let new_context = this.context.get(name);

      if (typeof context.x_low  !== 'undefined') {
        new_context.x_low = context.x_low;
      }
      if (typeof context.x_high  !== 'undefined') {
        new_context.x_high = context.x_high;
      }
      if (typeof context.y_low  !== 'undefined') {
        new_context.y_low = context.y_low;
      }
      if (typeof context.y_high  !== 'undefined') {
        new_context.y_high = context.y_high;
      }

      this.context.set(name, new_context);
      this.redraw_chart();
    } else {
      this.context.set(name, context);
    }

  }

  plot_line (line, name, color = CONST.WHITE, line_width = 3, context = this.context.get(CONTEXT_DEFAULT)) {
    this.curves.set(
      name,
      {
        'curve': line,
        'color': color,
        'line_width': line_width,
        'context': context 
      }
    );

    this.draw_line(line, color, line_width, context);
  }

  /** 
   * Draws specified points as a curve on a canvas
   * @param {Curve} curve Points of the curve
   * @param {string} name Label for the curve
   * @param {color hex} color Color to draw curve. Defaults to white.
   * @param {float} line_width Width of the line
   * @param {Context} context The Chart area to plot in
   * @param {float} padding_factor How much padding space to give to the curve
   */
  plot_curve (curve, name, color = CONST.WHITE, line_width = 1, padding_factor = 0, context = this.context.get(CONTEXT_DEFAULT)) {
    if (!(curve instanceof Curve)) {
      throw new Error('[Chart, plot_line] points not an instance of Curve');
    }

    // TODO: make this update context function
    // Don't have to update context all the time, 
    // make it a flag for the new update context function
    let x_low  = Math.min(...curve.x);
    let x_high = Math.max(...curve.x);
    let y_low  = Math.min(...curve.y);
    let y_high = Math.max(...curve.y);
    let pad_amount = padding_factor*(y_high - y_low);
    let needs_update = false;
      
    // We need to initialize the context
    // TODO: a better initialization check
    if (context.x_low == null || context.x_high == null || 
        context.y_low == null || context.y_high == null) {
      context.x_low  = x_low;
      context.x_high = x_high;
      context.y_low  = y_low  - pad_amount;
      context.y_high = y_high + pad_amount;
      this.draw_axes_labels();
      this.draw_axes();
    }
    // Change the range if necessary
    if (context.x_low > x_low) {
      context.x_low = x_low;
      needs_update = true;
    }
    if (context.x_high < x_high) {
      context.x_high = x_high;
      needs_update = true;
    }
    if (context.y_low > y_low) {
      context.y_low = y_low - pad_amount;
      needs_update = true;
    }
    if (context.y_high < y_high) {
      context.y_high = y_high + pad_amount;
      needs_update = true;
    }

    if (needs_update) {
      this.redraw_chart();
    }

    // Save this curve
    this.curves.set(
      name, 
      {
        'curve': curve,
        'color': color,
        'line_width': line_width,
        'context': context 
      }
    );

    this.draw_curve(curve, color, line_width, context);
  }

  draw_line (line, color, line_width, context) {
    // Make sure we don't plot below the axis
    let pt_1 = [context.x_low, line.compute_y(context.x_low)];
    if (pt_1[1] < context.y_low) {
      pt_1 = [line.compute_x(context.y_low), context.y_low];
    }

    let pt_2 = [context.x_high, line.compute_y(context.x_high)];
    if (pt_2[1] < context.y_low) {
      pt_2 = [line.compute_x(context.y_low), context.y_low];
    }

    let curve = new Curve (
      [pt_1[0], pt_2[0]],
      [pt_1[1], pt_2[1]]
    );

    this.draw_curve(curve, color, line_width, context);
  }

  draw_curve (curve, color = CONST.WHITE, line_width = 1, context) {
    // Plotting 
    let ctx = this.canvas.getContext('2d');

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = line_width;

    for (let idx = 0; idx < curve.num_points; idx++) {
      // Translate points to this chart object's context
      let curr_x = this.get_context_x(context, curve.x[idx]);
      let curr_y = this.get_context_y(context, curve.y[idx]);

      if (idx == 0) {
        ctx.moveTo(curr_x, curr_y);
      } else {
        ctx.lineTo(curr_x, curr_y);
      }
    }
    ctx.stroke();
  }

  redraw_chart () {
    // Redraw all the curves, even outside of context
    this.clear_chart();
    for (const [key, value] of this.curves.entries()) {
      if (value.curve instanceof Line) {
        this.draw_line(value.curve, value.color, value.line_width, value.context);
      } else if (value.curve instanceof Curve) {
        this.draw_curve(value.curve, value.color, value.line_width, value.context);
      }
    }

    this.draw_axes_labels();
    this.draw_axes();
  }
}

export { Chart };