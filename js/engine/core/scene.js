class SceneObject
{
    constructor (params)
    {
        this.engine = null
        this.name   = params.name
        this.id     = -1

        this.renderComponent    = params.render
        this.collisionComponent = params.collision
        this.physicsComponent   = params.physics
        
        this.root = new Component()
        this.root.transform = params.transform;

        this.hovered = false

        this.editor = params.editor

        if (this.renderComponent)    this.root.addChild(this.renderComponent)
        if (this.physicsComponent)   this.root.addChild(this.physicsComponent)
        if (this.collisionComponent) this.root.addChild(this.collisionComponent)

        this.children = []
        this.parent = null
        this.scene = null
    }

    addChild (child)
    {
        child.parent = this
        this.children.push(child)
    }

    /*
    attach (parent) 
    { 
        this.detach()
        this.parent = parent
        this.parent.children.push(this)
    }

    detach()
    {
        if (this.parent)
        {
            for (var i = 0; i < this.parent.children.length; ++i)
            {
                if (this.parent.children[i] == this)
                {
                    this.parent.children.splice(i, 1)
                }
            }
        }

        this.parent = null
    }
    */
   
    getTransform()
    {
        var trans = this.root.transform
        var par = this.parent
        while (par)
        {
            trans.position += par.root.transform.position
            par = par.parent
        }
        return trans
    }

    getTransformMatrix()
    {
        var trans = this.root.transform.matrix()
        var par = this.parent
        while (par)
        {
            trans = multiplym(par.getTransform(), trans)
            par = par.parent
        }
        return trans
    }

    onHoverStart () { }
    onHoverStop  () { }
    onClickStart () { }
    onClickStop  () { }

    onDrag () { }

    update ()
    {

    }
}

class Scene 
{
    constructor (engine)
    {
        this.objects = []
        this.engine = engine
    }

    add (object)
    {
        object.id = this.objects.length
        object.scene = this
        object.engine = this.engine
        this.objects.push(object)
    }

    find (name)
    {
        for (var i = 0; i < this.objects.length; ++i)
            if (this.objects[i].name == name)
                return this.objects[i]

        return null;
    }

    get (id)
    {
        return this.objects[id]
    }

    traverse (func)
    {
        for (var i = 0; i < this.objects.length; ++i)
        {
            func(this.objects[i])
            for (var j = 0; j < this.objects[i].children; ++j)
            {
                func(this.objects[i].children[j])
            }
        }
    }

    pairs (func)
    {
        for (var i = 0; i < this.objects.length; ++i)
        {
            for (var j = i + 1; j < this.objects.length; ++j)
            {
                func(this.objects[i], this.objects[j])
            }
        }
    }

    update ()
    {
        this.traverse((object) => 
        {
            object.update()
        })

        const hover = this.engine.events.findType(EVENT_TYPE_MOUSE_HOVER)
        if (hover)
        {
            this.traverse((object) => 
            {
                if (object.id == hover.objectID && !object.hovered)
                {
                    object.onHoverStart()
                    object.hovered = true
                }

                if (object.id != hover.objectID && object.hovered)
                {
                    object.onHoverStop()
                    object.hovered = false
                }
            })
        }

        const click = this.engine.events.findType(EVENT_TYPE_MOUSE_CLICK)
        if (click)
        {
            this.traverse((object) => 
            {
                if (object.hovered)
                {
                    object.onClickStart()
                }
            })
        }

        const drag = this.engine.events.findType(EVENT_TYPE_MOUSE_HOVER)
        if (drag)
        {
            this.traverse((object) => 
            {
    
            })
        }
    }

    getCamera () 
    {
        for (var i = 0; i < this.objects.length; ++i)
        {
            if (this.objects[i].name == "Camera")
            {
                return this.objects[i]
            }
        }
    }

    getDirectionalLight ()
    {        
        for (var i = 0; i < this.objects.length; ++i)
            if (this.objects[i] instanceof DirectionalLight)
                return this.objects[i]
    }

    getPointLights ()
    {
        var results = []
        for (var i = 0; i < this.objects.length; ++i)
            if (this.objects[i] instanceof PointLight)
                results.push(this.objects[i])

        return results
    }

    getSpotLights ()
    {
        var results = []
        for (var i = 0; i < this.objects.length; ++i)
            if (this.objects[i] instanceof SpotLight)
                results.push(this.objects[i])

        return results
    }
}