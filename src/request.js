/** 
 * @file Functions for requesting data from the Coinbase API
 * @author mikinty
 */

import *  as CONST from './CONST.js';

/**
 * Retrieves price data from the Coinbase API
 * 
 * @param ticker Ticker to get prices of
 * @param timescale Timescale object to calculate timeframe
 */
export async function get_past_prices (ticker, timescale) {
  let curr_time = new Date();
  
  return $.ajax(
    CONST.REQUEST_CANDLE_URL(ticker),
    {
      'start': timescale.start_time(curr_time),
      'end': curr_time.toISOString(),
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

  return setInterval (
    () => {
      $.ajax(
        CONST.REQUEST_TICKER_URL(ticker)
      ).then(data => {
        elem.innerHTML = `${ticker}: $${Number(data.price).toFixed(2)}`;

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