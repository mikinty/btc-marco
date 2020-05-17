/** 
 * @file Library functions for performing technical analysis.
 * @author mikinty
 */

export function moving_average (data, window_size) {
  let ma = [];

  for (let i = 0; i < data.length; i++) {
    let curr_sum = 0;

    for (let j = 0; j < window_size; j++) {
      if (i - j < 0) {
        break;
      }
      
      curr_sum += data[i - j];
    }

    let divide = Math.min(window_size, i+1);

    ma.push(
      curr_sum/divide
    );
  }

  return ma;
}

export function exp_moving_average (data, window_size) {
  let ma = [];
  let k = 2/(window_size + 1);

  let curr_sum = data[0];
  for (let i = 0; i < data.length; i++) {
    curr_sum = k*data[i] + (1-k)*curr_sum;

    ma.push(
      curr_sum
    );
  }

  return ma;
}