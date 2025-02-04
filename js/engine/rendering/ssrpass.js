class ScreenSpaceReflectionPass extends RenderPass
{
    constructor(context, width, height)
    {
        const VertexSource = 
           `#version 300 es
            precision lowp float;

            in vec3 vertex_position;
            in vec3 vertex_normal;
            in vec2 vertex_uvs;

            out vec2 frag_uvs;

            void main() 
            {
                gl_Position = vec4(vertex_position, 1.0);
                frag_uvs = vertex_uvs;
            }`
        
        const FragmentSource = 
           `#version 300 es
            precision lowp float;
            uniform sampler2D AlbedoTexture;
            uniform sampler2D NormalTexture;
            uniform sampler2D PositionTexture;
            uniform vec3 CameraPosition;

            in vec2 frag_uvs;

            layout (location = 0) out vec4 out_colour;

            void main ()
            {
                vec4 Albedo   = texture(AlbedoTexture,   frag_uvs);
                vec4 Normal   = texture(NormalTexture,   frag_uvs);
                vec4 Position = texture(PositionTexture, frag_uvs);

                vec3 IncomingDirectionWorldSpace = normalize(Position.xyz - CameraPosition.xyz);
                vec3 RayDirectionWorldSpace = reflect(IncomingDirectionWorldSpace, Normal.xyz);

                out_colour = vec4(RayDirectionWorldSpace, 1.0);
            }`

        super(context, width, height, VertexSource, FragmentSource)

        this.output = createColourTexture(
            this.gl,
            this.width,
            this.height,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE)

        this.Framebuffer =  createFramebuffer(this.gl, 
            [
                this.gl.COLOR_ATTACHMENT0
            ], 
            [
                this.output
            ])
    }

    Render (
        renderer,
        view,
        inAlbedoTexture,
        inNormalTexture,
        inPositionTexture)
    {
        this.gl.viewport(0, 0, this.width, this.height);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.Framebuffer);
        this.gl.drawBuffers([this.gl.COLOR_ATTACHMENT0]);

        this.gl.useProgram(this.ShaderProgram);

        this.gl.uniform1i(this.uniforms.get("AlbedoTexture").location, 0);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, inAlbedoTexture);

        this.gl.uniform1i(this.uniforms.get("NormalTexture").location, 1);
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, inNormalTexture);

        this.gl.uniform1i(this.uniforms.get("PositionTexture").location, 2);
        this.gl.activeTexture(this.gl.TEXTURE2);
        this.gl.bindTexture(this.gl.TEXTURE_2D, inPositionTexture);

        this.gl.uniform3fv(this.uniforms.get("CameraPosition").location, view.position)

renderer.screenPass()
    }
}