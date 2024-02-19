class DeferredBasePass extends BasePass
{
    constructor(context, width, height)
    {
        super (context, width, height)

        this.outputAlbedo    = createColourTexture (this.gl, this.width, this.height, this.gl.RGBA,    this.gl.UNSIGNED_BYTE)
        this.outputNormal    = createColourTexture (this.gl, this.width, this.height, this.gl.RGBA,    this.gl.UNSIGNED_BYTE)
        this.outputPosition  = createColourTexture (this.gl, this.width, this.height, this.gl.RGBA32F, this.gl.FLOAT)
        this.outputID        = createColourTexture (this.gl, this.width, this.height, this.gl.RGBA,    this.gl.UNSIGNED_BYTE)
        this.depth           = createDepthTexture  (this.gl, this.width, this.height)

        this.framebuffer = createFramebuffer(this.gl, 
            [
                this.gl.COLOR_ATTACHMENT0, 
                this.gl.COLOR_ATTACHMENT1, 
                this.gl.COLOR_ATTACHMENT2, 
                this.gl.COLOR_ATTACHMENT3,
                this.gl.DEPTH_ATTACHMENT
            ], 
            [
                this.outputAlbedo, 
                this.outputNormal, 
                this.outputPosition, 
                this.outputID,
                this.depth
            ])

        this.idFramebuffer = createFramebuffer(this.gl, 
            [ this.gl.COLOR_ATTACHMENT0 ], 
            [ this.outputID ])
    }

    Render(renderer, scene, view, toScreen)
    {
        if (toScreen)
        {
            this.gl.viewport(0, 0, this.width, this.height);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        }
        else
        {
            this.gl.viewport(0, 0, this.width, this.height);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
            this.gl.drawBuffers([
                this.gl.COLOR_ATTACHMENT0, 
                this.gl.COLOR_ATTACHMENT1,
                this.gl.COLOR_ATTACHMENT2,
                this.gl.COLOR_ATTACHMENT3 ]);
        }

        this.gl.clearColor(0.0, 0.0, 0.0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.enable(this.gl.DEPTH_TEST)
        this.gl.enable(this.gl.CULL_FACE)
        this.gl.cullFace(this.gl.BACK);

        scene.traverse((object) => 
        {
            let component = object.renderComponent
            if (component && component.visible)
            {
                this.gl.useProgram       (component.material.BasePassShaderProgram);
                this.gl.uniformMatrix4fv (component.material.BasePassUniforms.get("proj").location, false, view.projection)
                this.gl.uniformMatrix4fv (component.material.BasePassUniforms.get("view").location, false, view.worldToView)
                this.gl.uniform4fv       (component.material.BasePassUniforms.get("CameraPosition").location, [view.position[0], view.position[1], view.position[2], 1.0])            
                this.gl.uniform1i        (component.material.BasePassUniforms.get("ID").location, object.id)
                this.gl.uniform4fv       (component.material.BasePassUniforms.get("Albedo").location, component.material.albedo)
                this.gl.uniform1f        (component.material.BasePassUniforms.get("Time").location, renderer.frameID)
                this.gl.uniform4fv       (component.material.BasePassUniforms.get("Lighting").location, component.material.lighting)
                this.gl.uniformMatrix4fv (component.material.BasePassUniforms.get("transform").location, false, object.getTransformMatrix())
                this.gl.uniform3fv       (component.material.BasePassUniforms.get("scale").location, object.root.transform.scale)

                var u = 0
                for (const [name, uniform] of component.material.BasePassUniforms.entries())
                {
                    if (uniform.type == "sampler2D")
                    {
                        var texture = TexturePool.get(uniform.name)
                        if (texture)
                        {
                            this.gl.activeTexture(getTextureEnum(this.gl, u));
                            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                            this.gl.uniform1i(uniform.location, u);
                        }
                        ++u
                    }
                }

                renderer.GeometryPool[component.geometry].draw()
            }
        })

        this.gl.disable(this.gl.DEPTH_TEST)
        this.gl.disable(this.gl.CULL_FACE)
    }
}
