/*******************************************************************************
 * Theta* Test
o
     |
  ---|
     |
 |
 |---
 |
      x
 */
define(['./theta'], function(Theta){
    console.log('testing');
    function pt(x, y){ return {x:x, y:y};}
    function ln(p, q){ return {p:p, q:q};}
    var start = pt(0,0);
    var goal = pt(100, 100);
    var nodes = [pt(75, 9),
                 pt(24, 30),
                 pt(75, 51),
                 pt(25, 49),
                 pt(76, 70),
                 pt(25, 91)];
    var lines = [ln(pt(75, 10), pt(75, 50)),
                 ln(pt(25, 30), pt(75, 30)),
                 ln(pt(25, 50), pt(25, 90)),
                 ln(pt(25, 70), pt(75, 70))];
    return function(){
        console.log(Theta(start, goal, nodes, lines));
    };
});
