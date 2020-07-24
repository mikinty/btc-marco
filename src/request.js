/** 
 * @file Functions for requesting data from the Coinbase API
 * @author mikinty
 */

import *  as CONST from './CONST.js';

/**
 * Retrieves price data from the Coinbase API
 */
export async function get_past_prices (ticker) {
  let curr_time = new Date();
  let end_iso = curr_time.toISOString();
  curr_time.setHours(curr_time.getHours() - CONST.CHART_TIME_HRS);
  
  return $.ajax(
    CONST.REQUEST_CANDLE_URL(ticker),
    {
      'start': curr_time.toISOString(),
      'end': end_iso,
      'granularity': CONST.GRANULARITY
    }
  );
}

/**
 * Starts periodic request to update the price
 * @param {*} elem Price ticker object
 */
export function request_again (elem, ticker) {
  let prev_price = -1;

  setInterval (
    () => {
      $.ajax(
        CONST.REQUEST_TICKER_URL(ticker)
      ).then(data => {
        elem.innerHTML = `${ticker}: $${data.price}`;

        if (prev_price != -1) {
          let delta = data.price - prev_price;

          elem.classList.remove('update_green');
          elem.classList.remove('update_red');
          if (delta < 0) {
            elem.classList.add('update_red');
          } else if (delta > 0) {
            elem.classList.add('update_green');
          }
        }

        prev_price = data.price;
      }).catch(error => {
        console.log(error);
      });
    },
    CONST.REFRESH_RATE
  );
}