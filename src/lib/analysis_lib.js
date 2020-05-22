/** 
 * @file Library functions for performing analysis.
 * @author mikinty
 */

export function slope (pts, idx1, idx2) {
  return (pts[1][idx2] - pts[1][idx1])/(pts[0][idx2] - pts[0][idx1]);
}

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

export function derivative (data_xy) {
  let dv = [[], []];

  for (let i = 1; i < data_xy[0].length; i++) {
    dv[0].push(
      (data_xy[0][i] + data_xy[0][i-1])/2
    );

    dv[1].push(
      (data_xy[1][i] - data_xy[1][i-1])/(data_xy[0][i] - data_xy[0][i-1])
    );
  }

  return dv;
}

export function local_optima (dv_xy) {
  let local_optima_pts = [[], []];
  
  for (let i = 1; i < dv_xy[0].length; i++) {
    if (dv_xy[1][i] > 0 && dv_xy[1][i-1] < 0) {
      local_optima_pts[0].push(
        (dv_xy[0][i] + dv_xy[0][i-1])/2
      );
    } else if (dv_xy[1][i] < 0 && dv_xy[1][i-1] > 0) {
      local_optima_pts[1].push(
        (dv_xy[0][i] + dv_xy[0][i-1])/2
      );
    }
  }

  return local_optima_pts;
}