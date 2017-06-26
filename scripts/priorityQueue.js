/*******************************************************************************
 * Priority Queue - Array with ordered data
 */
define([], function(){
    function PriorityQueue() {
        this.data = [];
    }
    PriorityQueue.prototype.push = function(element, priority) {
        priority = +priority;
        for (var i = 0; i < this.data.length && this.data[i][1] > priority; i++);
        this.data.splice(i, 0, [element, priority])
    }
    PriorityQueue.prototype.pop = function() {
        return this.data.pop()[0];
    }

    PriorityQueue.prototype.empty = function() {
        return this.data.length == 0;
    }
    PriorityQueue.prototype.includes = function(element) {
        return this.data.some(function(v){return v[0] == element;});
    }
    PriorityQueue.prototype.remove = function(element) {
        this.data = this.data.filter(function(v){
            return v[0] != element;
        });
    }
    return PriorityQueue;
});
