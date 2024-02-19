class Component
{
    constructor()
    {
        this.transform = new Transform(
            Scale       (1.0, 1.0, 1.0),
            Translation (0.0, 0.0, 0.0),
            Rotation    (0.0, 0.0, 0.0))
        
        this.owner = null
        this.children = []
        this.type = "Component"
    }

    addChild(component)
    {
        component.owner = this
        this.children.push(component)
        component.transform = this.transform
    }
}