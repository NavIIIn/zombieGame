/*******************************************************************************
 * KeyMap Object: keeps track of what keys are pressed
 */
define([], function(){
    function KeyMap(){
        this.arr = [false, false, false, false];
        this.paused = false;
    }
    KeyMap.prototype.arrowDown = function(e){
        switch(e.keyCode){
        case 87: case 38: this.arr[0] = true; break; //w and up
        case 65: case 37: this.arr[1] = true; break; //a and left
        case 83: case 40: this.arr[2] = true; break; //s and down
        case 68: case 39: this.arr[3] = true; break; //d and right
        case 80: this.paused = !this.paused; break; // pause key
        }
    };
    KeyMap.prototype.arrowUp = function(e){
        switch(e.keyCode){
        case 87: case 38: this.arr[0] = false; break; //w and up
        case 65: case 37: this.arr[1] = false; break; //a and left
        case 83: case 40: this.arr[2] = false; break; //s and down
        case 68: case 39: this.arr[3] = false; break; //d and right
        }
    };
    KeyMap.prototype.getHorizontalDir = function(){
        // returns 1 for left, -1 for right, 0 for no movement
        return (this.arr[1]?1:0) + (this.arr[3]?-1:0);
    }
    KeyMap.prototype.getVerticalDir = function(){
        // returns 1 for up, -1 for down, 0 for no movement
        return (this.arr[0]?1:0) + (this.arr[2]?-1:0);
    }
    return KeyMap;
});
