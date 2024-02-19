class ShadowPass extends BasePass
{
    constructor(context, width, height)
    {
        super(context, width, height)

        this.output = createDepthTexture(this.gl, this.width, this.height)
        this.framebuffer = createFramebuffer(this.gl, [ this.gl.DEPTH_ATTACHMENT ], [ this.output ])
    }

    Render(renderer, scene)
    {
        this.gl.viewport(0, 0, this.width, this.height);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);

        this.gl.clearColor(0.0, 0.0, 0.0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.enable(this.gl.DEPTH_TEST)
        this.gl.enable(this.gl.CULL_FACE)
        this.gl.cullFace(this.gl.FRONT)

        scene.traverse((object) => 
        {
            let component = object.renderComponent
            if (component && component.visible && component.shadows)
            {
                this.gl.useProgram       (component.material.ShadowPassShaderProgram);
                this.gl.uniform1f        (component.material.ShadowPassUniforms.get("Time").location, renderer.frameID)
                this.gl.uniform1i        (component.material.ShadowPassUniforms.get("ID").location, object.id)
                this.gl.uniformMatrix4fv (component.material.ShadowPassUniforms.get("Transform").location, false, object.getTransformMatrix())
                const directionalLight = scene.getDirectionalLight()
                if (directionalLight)
                {
                    this.gl.uniformMatrix4fv(component.material.ShadowPassUniforms.get("Projection").location, false, directionalLight.projection)
                    this.gl.uniformMatrix4fv(component.material.ShadowPassUniforms.get("View").location, false, directionalLight.view.worldToView)
                }
                renderer.GeometryPool[component.geometry].draw()
            }
        })

        this.gl.disable(this.gl.DEPTH_TEST)
        this.gl.disable(this.gl.CULL_FACE)
    }

    Clear ()
    {
        this.gl.viewport(0, 0, this.width, this.height);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
    }
}