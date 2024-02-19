class DemoScene extends Scene
{
    constructor(engine)
    {
        super(engine)

        this.DarkMaterial  = engine.rendering.createMaterial([0.1, 0.1, 0.1])
        this.BlackMaterial = engine.rendering.createMaterial([0.0, 0.0, 0.0])
        this.GreyMaterial  = engine.rendering.createMaterial([0.5, 0.5, 0.5], 1.0, 0.0)
        this.ShinyMaterial = engine.rendering.createMaterial([0.0, 0.0, 0.0], 0.0, 0.32)

        this.SkyMaterial   = engine.rendering.createMaterial([1.0, 1.0, 1.0], 0.0, 0.0, `
            vec4 getMaterialAlbedo()
            {
                vec4  a = vec4(0.99607843, 0.99607843, 0.99607843, 0.0); 
                vec4  b = vec4(0.17647059, 0.29019608, 0.45882353, 0.0);
                float t = clamp((frag_worldpos.y / scale.y) * 0.5, 0.0, 1.0);
                return mix(a, b, 1.0 - t);
            }`)

        this.GridMaterial  = engine.rendering.createMaterial([0.5, 0.5, 0.5], 1.0, 0.1, `
            uniform sampler2D grid; // #texture path=images/grid.jpg

            vec4 getMaterialAlbedo() 
            { 
                vec2 gridScale = 
                    (abs(frag_normal.x) >= 0.99) ? scale.yz :
                    (abs(frag_normal.y) >= 0.99) ? scale.xz :
                    (abs(frag_normal.z) >= 0.99) ? scale.xy :
                    vec2(1.0, 1.0);
                vec4 a = texture(grid, frag_uvs * gridScale * 0.25);
                a.xyz = vec3(1.0, 1.0, 1.0) - a.xyz;
                a.xyz = a.xyz * 0.25;
                return a; 
            }`)

        this.BoxGeometry    = engine.rendering.createGeometry(BoxMesh)
        this.SphereGeometry = engine.rendering.createGeometry(SphereMesh)
        this.SkyGeometry    = engine.rendering.createGeometry(SkySphereMesh)
        this.DragonGeometry = engine.rendering.loadGeometry("Dragon")

        this.add(new DirectionalLight({
                 name : "DirectionalLight",
            transform : new Transform(Scale(1.0, 1.0, 1.0), Translation(0.0, 8.0, 0.0), Rotation(0.1, -0.2, 0.0)),
            intensity : 100.0 }))

        this.add(new PointLight({
                 name : "PointLight 1",
            transform : new Transform(Scale(1.0, 1.0, 1.0), Translation(4.0, 4.0, -4.0), Rotation(0.0, 0.0, 0.0)), 
                color : vec3(1.0, 0.756, 0.8),
            intensity : 2.0,
                range : 25.0 }))

        this.add(new SpotLight({
                 name : "SpotLight 1",
            transform : new Transform(Scale(1.0, 1.0, 1.0), Translation(12.0, 2.0, -4.0), Rotation(0.9, 0.25, 0.0)), 
                color : vec3(1.0, 0.0, 0.0),
            intensity : 3.0,
                range : 100.0,
                angle : 0.87 }))

        this.add(new SpotLight({
                 name : "SpotLight 2",
            transform : new Transform(Scale(1.0, 1.0, 1.0), Translation(-12.0, 2.0, -4.0), Rotation(0.9, -0.25, 0.0)), 
                color : vec3(1.0, 1.0, 1.0),
            intensity : 6.0,
                range : 300.0,
                angle : 0.9 }))

        this.add(new DemoCamera({
                 name : "Camera",
            transform : new Transform(Scale(1.0, 1.0, 1.0), Translation(0.0, 8.0, 14.0), Rotation(0.05, 0.0, 0.0))}))

        this.add(new SceneObject({
                 name : "Ground",
            transform : new Transform(Scale(512.0, 1.0, 512.0), Translation(0.0, 0.0, 0.0), Rotation(0.0, 0.0, 0.0)),
               render : new RenderComponent(this.BoxGeometry, this.GridMaterial),
            collision : new BoxCollisionComponent(512.0, 1.0, 512.0) }))

        this.add(new SceneObject({
                 name : "Sky",
            transform : new Transform(Scale(256.0, 256.0, 256.0), Translation(0.0, 0.0, 0.0), Rotation(0.0, 0.0, 0.0)),
               render : new RenderComponent(this.SkyGeometry, this.SkyMaterial, false) }))

        this.add(new SceneObject({
                 name : "Cornell Floor",
            transform : new Transform(Scale(4.0, 0.2, 4.0), Translation(0.0, 1.2, -12.0), Rotation(0.0, 0.0, 0.0)),
               render : new RenderComponent(this.BoxGeometry, this.GridMaterial),
            collision : new BoxCollisionComponent(4.0, 0.2, 4.0) }))

        this.add(new SceneObject({
                 name : "Cornell Roof",
            transform : new Transform(Scale(4.0, 0.2, 4.0), Translation(0.0, 8.2, -12.0), Rotation(0.0, 0.0, 0.0)),
               render : new RenderComponent(this.BoxGeometry, this.GridMaterial),
            collision : new BoxCollisionComponent(4.0, 0.2, 4.0) }))

        this.add(new SceneObject({
                 name : "Cornell Left Wall",
            transform : new Transform(Scale(0.2, 3.3, 4.0), Translation(3.8, 4.7, -12.0), Rotation(0.0, 0.0, 0.0)),
               render : new RenderComponent(this.BoxGeometry, this.GridMaterial),
            collision : new BoxCollisionComponent(0.2, 3.3, 4.0) }))

        this.add(new SceneObject({
                 name : "Cornell Right Wall",
            transform : new Transform(Scale(0.2, 3.3, 4.0), Translation(-3.8, 4.7, -12.0), Rotation(0.0, 0.0, 0.0)),
               render : new RenderComponent(this.BoxGeometry, this.GridMaterial),
            collision : new BoxCollisionComponent(0.2, 3.3, 4.0) }))

        this.add(new SceneObject({
                 name : "Cornell Ball Matte",
            transform : new Transform(Scale(0.5, 0.5, 0.5), Translation(1.2, 1.95, -9.0), Rotation(0.0, 0.0, 0.0)),
               render : new RenderComponent(this.SphereGeometry, this.ShinyMaterial),
            collision : new SphereCollisionComponent(0.5) }))

        this.add(new SceneObject({
                 name : "Cornell Ball Shiny",
            transform : new Transform(Scale(0.5, 0.5, 0.5), Translation(-1.2, 1.95, -9.0), Rotation(0.0, 0.0, 0.0)),
               render : new RenderComponent(this.SphereGeometry, this.BlackMaterial),
               collision : new SphereCollisionComponent(0.5) }))

        this.add(new SceneObject({
                 name : "Dragon",
            transform : new Transform(Scale(1.0, 1.0, 1.0), Translation(0.0, 1.4, -12.0), Rotation(0.0, 0.0, 0.0)),
               render : new RenderComponent(this.DragonGeometry, this.ShinyMaterial),
            collision : new BoxCollisionComponent(3.2, 8.6, 1.5)}))

        this.add(new SceneObject({
                 name : "Bouncing Ball 1",
            transform : new Transform(Scale(0.5, 0.5, 0.5), Translation(-5.0, 4.532, -4.0), Rotation(0.0, 0.0, 0.0)),
               render : new RenderComponent(this.SphereGeometry, this.BlackMaterial),
            collision : new SphereCollisionComponent(0.5),
              physics : new PhysicsComponent() }));

        this.add(new SceneObject({
                 name : "Bouncing Ball 2",
            transform : new Transform(Scale(0.5, 0.5, 0.5), Translation(-2.5, 4.423, -4.0), Rotation(0.0, 0.0, 0.0)),
               render : new RenderComponent(this.SphereGeometry, this.ShinyMaterial),
            collision : new SphereCollisionComponent(0.5),
              physics : new PhysicsComponent() }));

        this.add(new SceneObject({
                 name : "Bouncing Ball 3",
            transform : new Transform(Scale(0.5, 0.5, 0.5), Translation(0.0, 4.142, -4.0), Rotation(0.0, 0.0, 0.0)),
               render : new RenderComponent(this.SphereGeometry, this.BlackMaterial),
            collision : new SphereCollisionComponent(0.5),
              physics : new PhysicsComponent() }));

        this.add(new SceneObject({
                 name : "Bouncing Ball 4",
            transform : new Transform(Scale(0.5, 0.5, 0.5), Translation(-1.25, 5.142, -6.0), Rotation(0.0, 0.0, 0.0)),
               render : new RenderComponent(this.SphereGeometry, this.ShinyMaterial),
            collision : new SphereCollisionComponent(0.5),
              physics : new PhysicsComponent() }));

        this.add(new SceneObject({
                 name : "Bouncing Ball 5",
            transform : new Transform(Scale(0.5, 0.5, 0.5), Translation(-3.75, 4.842, -6.0), Rotation(0.0, 0.0, 0.0)),
               render : new RenderComponent(this.SphereGeometry, this.BlackMaterial),
            collision : new SphereCollisionComponent(0.5),
              physics : new PhysicsComponent() }));
              

              /*
        this.add(new SceneObject({
                 name : "Static Test Cube",
            transform : new Transform(Scale(2.0, 2.0, 2.0), Translation(0.0, 3.0, 0.0), Rotation(0.0, 0.0, 0.0)),
               render : new RenderComponent(this.BoxGeometry, this.GridMaterial),
            collision : new BoxCollisionComponent(2.0, 2.0, 2.0)}))
            */
    }

    update ()
    {
        super.update()

        const camera = super.find("Camera")
        if (this.engine.input.SpacePressed)
        {
            log ("fire!")
            this.engine.input.SpacePressed = false

            const projectile = new SceneObject({
                 name : "Bouncing Ball 5",
            transform : new Transform(Scale(0.5, 0.5, 0.5), camera.root.transform.position, Rotation(0.0, 0.0, 0.0)),
               render : new RenderComponent(this.SphereGeometry, this.BlackMaterial),
            collision : new SphereCollisionComponent(0.5),
              physics : new PhysicsComponent() })

            const f = this.engine.rendering.view.forward
            projectile.physicsComponent.vel = multiplys(vec3(f[0], f[1], f[2]), 0.01)

            this.add(projectile)

        }
    }
}