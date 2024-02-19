class RenderComponent extends Component
{
    constructor (geometry, material, shadows = true)
    {
        super()
        this.type = "RenderComponent"
        this.geometry = geometry
        this.material = material

        this.outline = false
        this.outlineColor = [1.0, 1.0, 1.0, 1.0]
        this.shadows = shadows
        this.visible = true
    }

    toString()
    {
        return this.material.toString()
    }
}