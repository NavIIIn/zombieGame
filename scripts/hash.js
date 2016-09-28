/*******************************************************************************
 * Hash Constructor
 *   - addAll: places objects into table
 *   - collideAll: Checks arr for collisions and responds with fun
 */
define(['./mathStuff'], function(Maths){
    var values = [];
    var addGrid = function(x,y,o){
        if(typeof values[x] == 'undefined'){
            values[x] = [];
            values[x][y] = [o];
        }
        else if(typeof values[x][y] == 'undefined')
            values[x][y] = [o];
        else{
            values[x][y].push(o);
        }
    };
    var add = function(o){
        var x = Maths.div(o.x);
        var y = Maths.div(o.y);
        addGrid(x, y, o);
        addGrid(x-1, y, o);
        addGrid(x+1, y, o);
        addGrid(x, y-1, o);
        addGrid(x, y+1, o);
    };
    var collidesWith = function(o){
        var x = Maths.div(o.x);
        var y = Maths.div(o.y);
        if(typeof values[x] != 'undefined' && typeof values[x][y] != 'undefined')
            return values[x][y].slice();
        else
            return [];
    };
    return {
        addAll: function(arr){
            values = [];
            if(arr.length > 0)
                for(var i = 0; i < arr.length; i++)
                    add(arr[i]);
        },
        collideAll: function(arr, fun){
            if(arr.length > 0)
                for(var i = 0; i < arr.length; i++)
                    fun(arr[i], collidesWith(arr[i]));
        }
    };
});
