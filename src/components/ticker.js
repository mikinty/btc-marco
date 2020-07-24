/**
 * Logic for ticker
 */

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
}