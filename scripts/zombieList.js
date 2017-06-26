/*******************************************************************************
 * ZombieList Object
 */
define(['./constants', './spacialHash', './zombie', './theta', './point', './nodeList'], function(Constants, SpacialHash, Zombie, Theta, Point, NodeList){
    function ZombieList(){
        this.hash = new SpacialHash();
        this.timer = 0;
        this.killed = 0;
    }
    ZombieList.prototype.getRandomSpeed = function(){
        var speed = Math.random()*Math.log(this.timer/100);
        if(speed < 1)
            speed = 1;
        if(speed > Constants.zombieSpeed)
            speed = Constants.zombieSpeed;
        return speed;
    }
    ZombieList.prototype.add = function(){
        if(Math.random() < Math.log(this.timer)*Constants.spawnRate &&
           this.hash.getSize() < Constants.maxZombies)
            this.hash.insert(new Zombie(this.getRandomSpeed()));
        this.timer++;
    };
    ZombieList.prototype.getPath = function(zombie, nodes){
        return Theta(new Point(zombie.x, zombie.y),
                     new Point(Constants.canvasWidth/2, Constants.canvasHeight/2),
                     nodes);
    };
    ZombieList.prototype.update = function(worldMovement, obsMap){
        var nodes = new NodeList(obsMap);
        for(let cur of this.hash){
            if(cur.path.length < 4 && cur.counter > 20){
                cur.path = this.getPath(cur, nodes);
                cur.counter = 0;
            }
            cur.counter++;
            cur.setDirection(cur);
            cur.adjustWorld(worldMovement.dx, worldMovement.dy);
            cur.move();
            if(cur.dead())
                this.killed++;
        }
    };
    ZombieList.prototype.remove = function(){
        this.hash.filter(function(v){
            return !v.dead() && v.inBounds();
        });
    };
    ZombieList.prototype.updateHash = function(){
        if(this.timer % Constants.hashRefresh == 0)
            this.hash.update();
    };
    ZombieList.prototype.collide = function(pt, rad){
        collidingZombies = this.hash.getCollidingItems(pt, rad)
        for(let cur of collidingZombies){
            cur.hit(pt);
            pt.hit(cur);
        }
    };
    ZombieList.prototype[Symbol.iterator] = function* (){
        for(let cur of this.hash)
            yield cur;
    };
    return ZombieList;
});
