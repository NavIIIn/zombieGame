/*******************************************************************************
 * Test object
 */
define(['./constants', './geometry', './point', './line'], function(Constants, Geometry, Point, Line){
    function _geometry(){
        var flipCoin = Geometry.flipCoin;
        var normalize = Geometry.normalize;
        var distance = Geometry.distance;
        var intersects = Geometry.intersects;
        console.log("geometry test...");
        // flipCoin
        var heads = 0, tails = 0;
        for(var i  = 500; i--; ){
            if(flipCoin())
                heads++;
            else
                tails++;
        }
        if(heads < 10 || heads > 490 || tails < 10 || tails > 490)
            console.log("flipCoin test failed");
        // normalize
        if(normalize(0, 0) != 0)
            console.log("normalize test 1 failed");
        if(normalize(3, 4) != 1/5)
            console.log("normalize test 2 failed");
        if(normalize(-3, 4) != 1/5)
            console.log("normalize test 3 failed");
        if(normalize(0, 4) != 1/4)
            console.log("normalize test 4 failed");
        if(normalize(3, -4) != 1/5)
            console.log("normalize test 5 failed");
        if(normalize(3, 0) != 1/3)
            console.log("normalize test 6 failed");
        // distance
        if(distance(0,0,3,4) != 5)
            console.log("distance test 1 failed");
        if(distance(-1,-1,2,3) != 5)
            console.log("distance test 2 failed");
        if(distance(1,1,-2,-3) != 5)
            console.log("distance test 3 failed");
        //intersects
        function pt(x, y){return {x:x, y:y};}
        if(!intersects(pt(0,0), pt(1, 1), pt(1, 1), pt(0,1)))
            console.log("intersects test 1 failed");
        if(intersects(pt(0,0), pt(1,0), pt(0,1), pt(1,1)))
            console.log("intersects test 2 failed");
        if(!intersects(pt(0,0), pt(1,1), pt(1,1), pt(0,0)))
            console.log("intersects test 3 failed");
        if(!intersects(pt(0,0), pt(1,1), pt(0,1), pt(1,0)))
            console.log("intersects test 4 failed");
        console.log("test complete");
    }
    function _point(){
        var point = Point.Point;
        var copy = Point.copy;
        var distance = Point.distance;
        var isNear = Point.isNear;
        var equals = Point.equals;
        console.log("point test...");
        a = point(0,0);
        if(a.x != 0 && b.x != 0)
            console.log("point test failed");
        b = copy(a);
        if(!equals(a, b))
            console.log("equals test failed");
        b.x = 1;
        if(equals(a,b))
            console.log("copy test failed");
        if(!isNear(a,b))
            console.log("isNear test 1 failed");
        b.y = Constants.nearVal;
        if(isNear(a,b))
            console.log("isNear test 2 failed");
        if(!isNear(a,b,50))
            console.log("isNear test 3 failed");
        if(isNear(a,b,1))
            console.log("esNear test 4 failed");
        b = point(3,4);
        if(distance(a, b) != 5)
            console.log("distance test failed");
        console.log("test complete");
    }
    function _line(){
        var line = Line.Line;
        var pt = Point.Point;
        var equals = Point.equals;
        var copy = Line.copy;
        var intersects = Line.intersects;
        console.log("line test...");
        var a = line(pt(0,0), pt(0,2));
        var b = copy(a);
        if(!equals(a.p,b.p) || !equals(a.q,b.q))
            console.log("copy test failed");
        b = line(pt(-1,1), pt(1,1));
        if(!intersects(a,b.p,b.q))
            console.log("intersects test 1 failed");
        b = line(pt(1,1), (1,2))
        if(intersects(a,b.p,b.q))
            console.log("intersects test 2 failed");
        console.log("test complete");
        
    }
    return function(){
        _geometry();
        _point();
        _line();
    }
});
