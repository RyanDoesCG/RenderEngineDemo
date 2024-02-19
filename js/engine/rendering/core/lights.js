class DirectionalLight extends SceneObject
{
    constructor (params)
    {
        super (params)
        this.intensity = params.intensity

        this.transform = params.transform

        this.view       = new View(this.transform.position, this.transform.rotation)
        this.projection = orthographic(60.0, -128.0, 128.0)
    }

    update ()
    {
        super.update()

        this.view       = new View(this.transform.position, this.transform.rotation)
        this.projection = orthographic(60.0, -128.0, 128.0)
    }
}

class PointLight extends SceneObject
{
    constructor (params)
    {
        super (params)
        this.color = params.color
        this.intensity = params.intensity
        this.range = params.range

        this.transform = params.transform
    }
}

class SpotLight extends SceneObject
{
    constructor (params)
    {
        super (params)
        this.color = params.color
        this.intensity = params.intensity
        this.range = params.range
        this.angle = params.angle

        this.transform = params.transform

        this.view       = new View(this.transform.position, this.transform.rotation)
        this.projection = orthographic(30.0, 0.00, 64.0)
    }

    update ()
    {
        super.update()

        this.view       = new View(this.transform.position, this.transform.rotation)
        this.projection = orthographic(30.0, 0.00, 64.0)
    }
}