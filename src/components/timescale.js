/**
 * Controls the timescale of the charts
 */

import *  as CONST from '../CONST.js';
import { plot_ticker, INDEX_STATE } from '../index.js';

/**
 * Initializes the timescale buttons, and equips 
 * them with the ability to change the chart timescales.
 */
export function init_timescale (
  timescale_wrapper,
  name_text,
  chart_price, 
  chart_indicator_top, 
  chart_indicator_bot
) {
  for (let i = 0; i < CONST.TIMESCALE_LIST.length; i++) {
    let curr_ts = document.createElement('div');
    curr_ts.classList.add('timescale_icon');
    curr_ts.innerHTML = 
    `
    <div>
    ${CONST.TIMESCALE_LIST[i].name}
    </div>
    `;

    // Highlight the initially selected time frame
    if (CONST.TIMESCALE_LIST[i] == CONST.DEFAULT_TIMESCALE) {
      curr_ts.classList.add('timescale_select');
    }

    curr_ts.onclick = () => {
      if (INDEX_STATE.curr_timescale != CONST.TIMESCALE_LIST[i]) {
        // Remove select from others, then select the current
        $('.timescale_select').removeClass('timescale_select');
        curr_ts.classList.add('timescale_select');

        // Reset the plots
        chart_price.reset();
        chart_indicator_bot.reset();
        chart_indicator_top.reset();

        // Set the new timescale
        INDEX_STATE.curr_timescale = CONST.TIMESCALE_LIST[i];

        // Plot the new ticker
        plot_ticker (
          INDEX_STATE.curr_ticker,
          CONST.TIMESCALE_LIST[i],
          name_text,
          chart_price, 
          chart_indicator_top, 
          chart_indicator_bot
        );
      }
    };

    timescale_wrapper.appendChild(curr_ts);
  }
}