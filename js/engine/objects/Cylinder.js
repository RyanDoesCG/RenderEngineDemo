class Cylinder extends SceneObject
{
    constructor (engine, transform)
    {
        super ({
            name      : "Cylinder",
            transform : transform,
            render    : new RenderComponent(
                engine.rendering.requestGeometry("Cylinder"), 
                engine.rendering.GridMaterial),
            collision : new CylinderCollisionComponent(
                2.0,
                1.0)
        })
    }
}