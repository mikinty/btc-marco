/** 
 * @file Class definition for charts used in this project.
 * @author mikinty
 */

import *  as CONST from '../CONST.js';
import { Line, Curve } from './graph.js';

/**
 * Chart object to plot curves and keep track of plotting information.
 */
class Chart {
  constructor (
    width = CONST.CHART_WIDTH, 
    height = CONST.CHART_HEIGHT, 
    chart_class = CONST.CHART_WRAPPER_CLASS,
    show_axes = false
  ) {
    this.chart_wrapper = document.createElement('div');
    this.chart_wrapper.classList.add(chart_class);

    // Chart layout
    this.chart_width = width;
    this.chart_height = height;
    this.chart_padding = CONST.CHART_PADDING;
    this.font_style = 'Lucida Sans';
    this.font_size = 70;
    this.font_padding = this.font_size/2;
    this.axes_padding = 50;
    this.chart_padding_x_axis = this.font_size + this.axes_padding;
    this.chart_padding_y_axis = 50;
    this.chart_padding_y_axis_label = 450;

    // Chart flags
    this.show_axes = show_axes;

    /* Defines the bounds of this chart in terms of the data this chart
     * will be plotting. We do this so that we can operate on our data
     * the way it was originally defined, and let the chart automatically
     * decide how to plot the data.
     */
    this.context = new Map();
    this.context.set(
      CONST.CHART_CONTEXT_DEFAULT, 
      {
        x_low:  null,
        x_high: null,
        y_low:  null,
        y_high: null
      }
    );

    /* Store curves, in the format
     * fd
     */
    this.curves = new Map();

    /** Store the various layers this chart has.
     *  The main layer will be drawn on by default.
     */
    this.layers = new Map();

    // Every chart has an underlying layer for axes and
    // a layer for the main data.
    this.add_layer(CONST.CHART_LAYER_AXES);
    this.add_layer(CONST.CHART_LAYER_DEFAULT);
  }

  /**
   * Creates an additional layer on the canvas
   * @param {string} name Label for chart layer 
   */
  add_layer(name = CONST.CHART_LAYER_DEFAULT) {
    if (typeof this.layers === 'undefined') {
      throw new Error('[chart.js] layers has not bee initialized yet.');
    }

    if (this.layers.has(name)) {
      console.log(`[chart.js] The layer "${name}" already exists.`);
      return;
    }
    
    // Create chart canvas
    let canvas_wrapper = document.createElement('div');
    let canvas = document.createElement('canvas');
    canvas.id = name;
    canvas.width = this.chart_width;
    canvas.height = this.chart_height;

    // Keep track of canvas
    this.layers.set(name, canvas);

    // Add canvas to wrapper div
    // canvas_wrapper.appendChild(canvas);
    this.chart_wrapper.appendChild(canvas);
  }

  /**
   * Clears a chart layer
   * @param {string} name Label of chart layer to clear.
   */
  clear_chart (name = CONST.CHART_LAYER_DEFAULT) {
    let canvas = this.layers.get(name);
    let canvas_context = canvas.getContext('2d');
    canvas_context.clearRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Draws the axes on the chart, on the bottom and to the right.
   *
   * TODO: Different axes styles, i.e. x=0, y=0, right, left
   */
  draw_axes () {
    let canvas = this.layers.get(CONST.CHART_LAYER_AXES);

    // Draw axes
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = CONST.WHITE;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(0, canvas.height-this.chart_padding_x_axis);
    ctx.lineTo(canvas.width - this.chart_padding_y_axis, canvas.height-this.chart_padding_x_axis);
    ctx.lineTo(canvas.width - this.chart_padding_y_axis, 0);
    ctx.stroke();

    this.draw_axes_labels();
  }

  /**
   * Draws axes labels.
   * @param {Context} context The data size limits to use for the axes labels.
   */
  draw_axes_labels (context = this.context.get(CONST.CHART_CONTEXT_DEFAULT)) {
    if (context.x_low == null || context.x_high == null || 
        context.y_low == null || context.y_high == null) {
      throw new Error('Context not init');
    }

    let canvas = this.layers.get(CONST.CHART_LAYER_AXES);
    let ctx = canvas.getContext('2d');

    ctx.strokeStyle = CONST.WHITE;
    ctx.fillStyle = CONST.WHITE;
    ctx.lineWidth = 1;
    ctx.font = `${this.font_size}px ${this.font_style}`;

    /**
     * Converts a raw UTC seconds to a date in hours:minutes format
     * @param {int} utc Seconds in UTC 
     */
    let convert_UTC_to_HM = (utc) => {
      let date = new Date(0);
      date.setUTCSeconds(utc);

      let pad_front = (num) => (num < 10) ? `0${num}` : `${num}`;

      return `${pad_front(date.getHours())}:${pad_front(date.getMinutes())}`;
    };

    // X-axis
    ctx.fillText (
      convert_UTC_to_HM(context.x_low),
      0, 
      canvas.height - this.font_padding
    );
    
    ctx.fillText (
      convert_UTC_to_HM(context.x_high),
      canvas.width - this.chart_padding_y_axis - 200, 
      canvas.height - this.font_padding
    );

    // Y-axis
    ctx.fillText (
      Math.round(context.y_low), 
      canvas.width - this.chart_padding_y_axis_label + 4*this.axes_padding, 
      canvas.height - 2*this.font_size
    );
    
    ctx.fillText (
      Math.round(context.y_high), 
      canvas.width - this.chart_padding_y_axis_label + 4*this.axes_padding, 
      this.font_size
    );
  }

  get_context_x (context, x, canvas) {
    return ((x - context.x_low)/(context.x_high - context.x_low))*(canvas.width - this.chart_padding_y_axis);
  }

  get_context_y (context, y, canvas) {
    return canvas.height - ((y - context.y_low)/(context.y_high - context.y_low))*(canvas.height - this.chart_padding_x_axis) - this.chart_padding_x_axis;
  }

  /**
   * Sets or creates a new context for the chart.
   * Accepts partial contexts if the context is already defined, 
   * which will only modified the specified context fields. And leave 
   * the rest undefined.
   *
   * @param {Context} context Defines the context, x and y ranges
   * @param {string} name Label for context
   */
  set_context (context, name = CONST.CHART_CONTEXT_DEFAULT) {
    if (typeof context === 'undefined') {
      throw new Error('Invalid context passed into set_context');
    }

    /* 
     * Modifying an existing context. Only modifying the parts of
     * the context that are specified for change.
     */
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

  /*** PUBLIC PLOTTING FUNCTIONS. ***/
  /**
   * Plots a line on the chart.
   *
   * @param {Line} line Line object
   * @param {string} name Label for the line
   * @param {color hex} color Color to draw curve, defaults to white. 
   * @param {float} line_width Width of the line
   * @param {string} context_name Label of the chart context to plot in
   */
  plot_line (
    line, 
    name, 
    color = CONST.WHITE, 
    line_width = 3, 
    context_name = CONST.CHART_CONTEXT_DEFAULT,
    layer_name = CONST.CHART_LAYER_DEFAULT
  ) {
    let context = this.context.get(context_name);

    this.curves.set(
      name,
      {
        'curve': line,
        'color': color,
        'line_width': line_width,
        'context': context ,
        'chart_style': CONST.CHART_STYLE_LINE,
        'layer_name': layer_name
      }
    );

    this.draw_line(line, color, line_width, context, layer_name);
  }

  /** 
   * Draws specified points as a curve on a canvas
   * @param {Curve} curve Points of the curve
   * @param {string} name Label for the curve
   * @param {color hex} color Color to draw curve. Defaults to white.
   * @param {float} line_width Width of the line. Defaults to 1.
   * @param {float} padding_factor How much padding space to give to the curve. Defaults to 0.
   * @param {string} context_name Label of the chart context to plot in
   * @param {string} chart_style The style to draw the chart, as a line, bar, etc. Defaults to a line.
   * 
   */
  plot_curve (
    curve, 
    name, 
    color = CONST.WHITE, 
    line_width = 1, 
    padding_factor = 0, 
    context_name = CONST.CHART_CONTEXT_DEFAULT, 
    layer_name = CONST.CHART_LAYER_DEFAULT,
    chart_style = CONST.CHART_STYLE_LINE
  ) {
    if (!(curve instanceof Curve)) {
      throw new Error('[Chart, plot_line] points not an instance of Curve');
    }

    let context = this.context.get(context_name);

    if (typeof context === 'undefined') {
      throw new Error(`[chart.js] Context "${context_name} not defined yet`);
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
    if (context.x_low == null) {
      context.x_low  = x_low;
      context.x_high = x_high;
      context.y_low  = y_low  - pad_amount;
      context.y_high = y_high + pad_amount;

      if (this.show_axes) {
        this.draw_axes();
      }
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
        'context': context,
        'chart_style': chart_style,
        'layer_name': layer_name
      }
    );

    if (chart_style == CONST.CHART_STYLE_BAR) {
      this.draw_bar(curve, color, line_width, context, layer_name);
    } else {
      this.draw_curve(curve, color, line_width, context, layer_name);
    }
  }

  highlight_curve (
    curve_bot,
    curve_top, 
    name, 
    color = CONST.YELLOW_LIGHT, 
    opacity = 0.3,
    context_name = CONST.CHART_CONTEXT_DEFAULT, 
    layer_name = CONST.CHART_LAYER_OVERLAY
  ) {
    if (curve_bot.num_points != curve_top.num_points) {
      throw new Error('[chart.js] Cannot highlight between curves of unequal length.');
    }

    let context = this.context.get(context_name);
    let canvas = this.layers.get(layer_name);
    
    // Plotting 
    let ctx = canvas.getContext('2d');

    ctx.strokeStyle = color;
    ctx.globalAlpha = opacity;
    ctx.lineWidth = 10; // Thick enough to cover gaps

    ctx.beginPath();
    for (let idx = 0; idx < curve_bot.num_points; idx++) {
      // Translate points to this chart object's context
      let curr_x = this.get_context_x(context, curve_bot.x[idx], canvas);
      let curr_y_bot = this.get_context_y(context, curve_bot.y[idx], canvas);
      let curr_y_top = this.get_context_y(context, curve_top.y[idx], canvas);

      if (idx == 0) {
        ctx.moveTo(curr_x, curr_y_bot);
        ctx.lineTo(curr_x, curr_y_top);
      } else {
        ctx.lineTo(curr_x, curr_y_bot);
        ctx.lineTo(curr_x, curr_y_top);
      }
      
    }
    ctx.stroke();

    if (name != null) {
      this.curves.set(
        name, 
        {
          'curve': curve_bot,
          'curve_top': curve_top,
          'color': color,
          'opacity': opacity,
          'context_name': context_name,
          'chart_style': CONST.CHART_STYLE_HIGHLIGHT,
          'layer_name': layer_name
        }
      );
    }
  }

  /*** LOWER LEVEL PLOTTING FUNCTIONS. Not intended for use by outside user. ***/
  draw_line (line, color, line_width, context, layer_name) {
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

    this.draw_curve(curve, color, line_width, context, layer_name);
  }

  draw_curve (curve, color = CONST.WHITE, line_width = 1, context, layer_name) {
    let canvas = this.layers.get(layer_name);

    // Plotting 
    let ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = line_width;

    for (let idx = 0; idx < curve.num_points; idx++) {
      // Translate points to this chart object's context
      let curr_x = this.get_context_x(context, curve.x[idx], canvas);
      let curr_y = this.get_context_y(context, curve.y[idx], canvas);

      if (idx == 0) {
        ctx.moveTo(curr_x, curr_y);
      } else {
        ctx.lineTo(curr_x, curr_y);
      }
    }
    ctx.stroke();
  }

  draw_bar (curve, color = CONST.WHITE, width = 1, context, layer_name, filled = true) {
    let canvas = this.layers.get(layer_name);
    
    // Plotting 
    let ctx = canvas.getContext('2d');

    ctx.fillStyle = color;

    for (let idx = 0; idx < curve.num_points; idx++) {
      // Translate points to this chart object's context
      let top_corner = [
        this.get_context_x(context, curve.x[idx], canvas) - width,
        this.get_context_y(context, Math.max(0, curve.y[idx]), canvas)
      ];

      let width_height = [
        width*2,
        this.get_context_y(context, 0, canvas) - this.get_context_y(context, Math.abs(curve.y[idx]), canvas)
      ];

      if (filled) {
        ctx.fillRect(top_corner[0], top_corner[1], width_height[0], width_height[1]);
      } else {
        ctx.rect(top_corner[0], top_corner[1], width_height[0], width_height[1]);
      }
    }
  }

  redraw_chart () {
    // Redraw all the curves, even outside of context
    for (const [key, value] of this.layers) {
      this.clear_chart(key);
    }

    if (this.show_axes) {
      this.draw_axes();
    }

    for (const [key, value] of this.curves.entries()) {
      if (value.curve instanceof Line) {
        this.draw_line(value.curve, value.color, value.line_width, value.context, value.layer_name);
      } else if (value.curve instanceof Curve) {
        if (value.chart_style == CONST.CHART_STYLE_BAR) {
          this.draw_bar(value.curve, value.color, value.line_width, value.context, value.layer_name);
        } else if (value.chart_style == CONST.CHART_STYLE_HIGHLIGHT) {
          console.log('redraw highlightS');
          this.highlight_curve(value.curve, value.curve_top, null, value.color, value.opacity, value.context_name, value.layer_name);
        } else {
          this.draw_curve(value.curve, value.color, value.line_width, value.context, value.layer_name);
        }
      }
    }    
  }
}

export { Chart };