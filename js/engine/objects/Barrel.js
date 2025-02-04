class Barrel extends SceneObject
{
    constructor (engine, transform)
    {
        super ({
            name      : "Barrel",
            transform : transform,
            render    : new RenderComponent(
                engine.rendering.requestGeometry("Barrel"), 
                engine.rendering.GridMaterial),
            collision : new CylinderCollisionComponent(
                1.0,
                0.5)
        })
    }
}