/**
 * Logic for ticker
 */

import * as CONST from '../CONST.js';

/** 
 * Sets up the ticker popup
 */
export function init_ticker (
  name_text, 
  ticker_popup_wrapper, 
  ticker_popup
) {
  // Toggle ticker popup
  name_text.onclick = () => {
    if (ticker_popup_wrapper.style.display === 'none') {
      ticker_popup_wrapper.style.display = 'block';
    } else {
      ticker_popup_wrapper.style.display = 'none';
    }
  };

  // Add tickers
  for (let i = 0; i < CONST.TICKER_LIST.length; i++) {
    let curr_ticker_sel = document.createElement('div');

    curr_ticker_sel.innerHTML = 
    `
    <div>
      ${CONST.TICKER_LIST[i]}
    </div>
    `;

    curr_ticker_sel.classList.add('ticker_option');
    curr_ticker_sel.onclick = () => {
      ticker_popup_wrapper.style.display = 'none';
    };

    ticker_popup.appendChild(curr_ticker_sel);
  }
}