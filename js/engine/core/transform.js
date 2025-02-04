class Transform 
{
    constructor (scaling, position, rotation)
    {
        this.scale    = scaling
        this.position = position
        this.rotation = rotation

        this.parent   = null
        this.children = [] // breaks serialization

        this.dirty = true
        this.rotationDirty = true
        this.m = identity()
    }

    getParentPosition ()
    {
        if (this.parent)
        {
            return this.parent.position
        }
        else
        {
            return this.position
        }
    }

    getWorldPosition ()
    { 
        if (this.parent != null)
        {
            const pos = vec4(this.position[0], this.position[1], this.position[2], 1.0)
            const res = multiplyvm(pos, this.parent.matrix())
            return vec3(res[0], res[1], res[2])
        }

        return this.position
    }

    getWorldRotation ()
    {
        if (this.parent)
        {
            return addv(this.rotation, this.parent.getWorldRotation())
        }

        return this.rotation  
    }

    getWorldScale ()
    {
        if (this.parent)
        {
            return multiplyv(this.scale, this.parent.getWorldScale())
        }

        return this.scale  
    }

    update ()
    {
        if (this.dirty)
        {
            this.m = identity()
            this.m = multiplym(scale(this.scale[0], this.scale[1], this.scale[2]), this.m)
            if (this.parent) 
            {
                this.m = multiplym(scale(this.parent.scale[0], this.parent.scale[1], this.parent.scale[2]), this.m)
                if (this.parent.parent)
                {
                    this.m = multiplym(scale(this.parent.parent.scale[0], this.parent.parent.scale[1], this.parent.parent.scale[2]), this.m)
                } 
            }
    
            if (this.rotationDirty)
            {
                this.m = multiplym(rotate(this.rotation[0], this.rotation[1], this.rotation[2]), this.m)
                if (this.parent) 
                {
                    this.m = multiplym(rotate(this.parent.rotation[0], this.parent.rotation[1], this.parent.rotation[2]), this.m)
                    if (this.parent.parent) 
                    {
                        this.m = multiplym(rotate(this.parent.parent.rotation[0], this.parent.parent.rotation[1], this.parent.parent.rotation[2]), this.m)
                    }
                }
            }
    
            this.m = multiplym(translate(this.position[0], this.position[1], this.position[2]), this.m)
            if (this.parent)       
            {
                this.m = multiplym(translate(this.parent.position[0], this.parent.position[1], this.parent.position[2]), this.m)
                if (this.parent.parent)       
                {
                    this.m = multiplym(translate(this.parent.parent.position[0], this.parent.parent.position[1], this.parent.parent.position[2]), this.m)
                }
            }

            for (var i = 0; i < this.children.length; ++i)
            {
                this.children[i].rotationDirty = this.rotationDirty
                this.children[i].dirty = true
                this.children[i].update()
            }
            
            this.rotationDirty = false
            this.dirty = false
        }
    }

    matrix ()
    {
        return this.m
    }

    inverse ()
    {
        var inv = identity()
        inv = multiplym(translate(-this.position[0], -this.position[1], -this.position[2]), inv)
        inv = multiplym(rotateRev(-this.rotation[0], -this.rotation[1], -this.rotation[2]), inv)
        inv = multiplym(scale(-this.scale[0], -this.scale[1], -this.scale[2]), inv)
        return inv
    }

    toString()
    {
        return "<p>Position</p>" + "<textarea class=\"vectorComponent\">" + this.position[0].toFixed(2) + "</textarea><textarea class=\"vectorComponent\">" + this.position[1].toFixed(2) + "</textarea><textarea class=\"vectorComponent\">" + this.position[2].toFixed(2) + "</textarea></br>" +
               "<p>Rotation</p>" + "<textarea class=\"vectorComponent\">" + this.rotation[0].toFixed(2) + "</textarea><textarea class=\"vectorComponent\">" + this.rotation[1].toFixed(2) + "</textarea><textarea class=\"vectorComponent\">" + this.rotation[2].toFixed(2) + "</textarea></br>" +
               "<p>Scale</p>" + "<textarea class=\"vectorComponent\">" + this.scale[0].toFixed(2) + "</textarea><textarea class=\"vectorComponent\">" + this.scale[1].toFixed(2) + "</textarea><textarea class=\"vectorComponent\">" + this.scale[2].toFixed(2) + "</textarea></br>"
    }
}

function Scale       (x, y, z) { return [x, y, z] }
function Translation (x, y, z) { return [x, y, z] }
function Rotation    (x, y, z) { return [x*3.14195, y*3.14195, z*3.14195] } // 1 == 180deg