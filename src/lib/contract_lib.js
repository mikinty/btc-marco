/** 
 * @file Definitions for contract safety in this project.
 * @author mikinty
 */

export function is_valid_points (points) {
  if (points.length != 2) {
    throw new Error('points does not have x and y coordinates');
  }
  
  if (points[0].length != points[1].length) {
    throw new Error('points has unequal # of x and y coordinates');
  }
}