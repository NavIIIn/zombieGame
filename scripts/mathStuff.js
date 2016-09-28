/*******************************************************************************
 * Functions for math 
 *   - flipCoin: 50% chance of returning true
 *   - normalize: Helper with math for movement components
 *   - withinRadius:
 *       Returns whether two circles overlap with centers at (x, y) with
 *       combined radius r
 *   - div: Helper for hash value, estimates relative location
 */
define(['./constants'], function(constants){
    return {
        flipCoin: function(){
            return Math.random()>0.5;
        },
        normalize: function(x, y){
            return y == 0 ? 1 : Math.abs(Math.sqrt(1/(Math.pow(x/y,2)+1))/y);
        },
        withinRadius: function(x1, y1, x2, y2, r){
            return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2)) < r;
        },
        div: function(n){
            return Math.round(n/(constants.zombieSize + constants.bulletSize)/2);
        }
    }
});
