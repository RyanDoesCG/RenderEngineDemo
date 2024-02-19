const BaseVertexSourceHead = 
   `#version 300 es
    precision lowp float;
    precision highp int;
    uniform mat4  proj;
    uniform mat4  view;
    uniform mat4  transform;
    uniform vec3  scale;
    uniform float Time;
    uniform int  ID;
    in vec3 vertex_position;
    in vec3 vertex_normal;
    in vec2 vertex_uv;
    out vec4 frag_worldpos;
    out vec3 frag_normal;
    out vec2 frag_uvs;`
const BaseVertexWorldPositionOffsetSourceMaterial =
   `vec3 getMaterialWPO ()
    {
        return vec3(0.0, 0.0, 0.0);
    }`
const BaseVertexSourceFoot =
   `void main() 
    {
        frag_worldpos = transform * vec4(vertex_position.xyz + getMaterialWPO(), 1.0);
        frag_normal = normalize((transform * vec4(vertex_normal.xyz, 0.0)).xyz);
        frag_uvs = vertex_uv;
        gl_Position = proj * view * frag_worldpos;
    }`
const BaseFragmentSourceHead = 
   `#version 300 es
    precision lowp float;
    precision highp int;
    uniform vec4 CameraPosition;
    uniform mat4 transform;
    uniform vec3 scale;
    layout (location = 0) out vec4 out_albedo;
    layout (location = 1) out vec4 out_normal;
    layout (location = 2) out vec4 out_position;
    layout (location = 3) out vec4 out_id;
    uniform vec4      Albedo;
    uniform vec4      Lighting;
    uniform float     Time;
    uniform int       ID;
    in vec4 frag_worldpos;
    in vec3 frag_normal;
    in vec2 frag_uvs;`
const BaseFragmentAlbedoSourceMaterial = `
    vec4 getMaterialAlbedo ()
    {
        return Albedo;
    }`
const BaseFragmentNormalSourceMaterial = 
   `vec3 getMaterialNormal()
    {
        return frag_normal;
    }`
const BaseFragmentSourceFoot =
   `void main ()
    {
        out_albedo = getMaterialAlbedo();
        out_normal = vec4((getMaterialNormal() + vec3(1.0)) * 0.5, 1.0);
        out_position = vec4(frag_worldpos.xyz, distance(CameraPosition.xyz, frag_worldpos.xyz));
        out_id = vec4(float(ID) / 255.0, Lighting.x, Lighting.y, 1.0);
    }`

const ShadowVertexSourceHead = 
   `#version 300 es
    precision lowp float;
    uniform mat4  Projection;
    uniform mat4  View;
    uniform mat4  Transform;
    uniform float Time;
    uniform int   ID;
    in vec3 vertex_position;
    in vec3 vertex_normal;
    in vec2 vertex_uv;`
const ShadowVertexSourceFoot = 
   `void main ()
    {
        gl_Position = 
            Projection * 
            View * 
            Transform * 
            vec4(vertex_position + getMaterialWPO(), 1.0);
    }`
const ShadowFragmentSource =
   `#version 300 es
   precision lowp float;
   void main()
   {

   }`

class Material
{
    constructor(gl, albedo, diffuse = 1.0, specular = 0.0, fragmentAlbedoCode = BaseFragmentAlbedoSourceMaterial, fragmentNormalCode = BaseFragmentNormalSourceMaterial, vertexWorldPositionOffsetCode = BaseVertexWorldPositionOffsetSourceMaterial)
    {
        this.albedo = [...albedo, 1.0]
        this.lighting = [diffuse, specular, 0.0, 0.0]

        this.vertexWorldPositionOffsetCode = vertexWorldPositionOffsetCode
        this.fragmentAlbedoCode = fragmentAlbedoCode
        this.fragmentNormalCode = fragmentNormalCode

        this.BasePassVertexCode = BaseVertexSourceHead + this.vertexWorldPositionOffsetCode + BaseVertexSourceFoot
        this.BasePassFragmentCode = BaseFragmentSourceHead + this.fragmentAlbedoCode + this.fragmentNormalCode + BaseFragmentSourceFoot
        this.BasePassShaderProgram = createProgram(gl,
            createShader(gl, gl.VERTEX_SHADER,   this.BasePassVertexCode),
            createShader(gl, gl.FRAGMENT_SHADER, this.BasePassFragmentCode))
        this.BasePassUniforms = extractUniforms(gl, this.BasePassVertexCode, this.BasePassFragmentCode)
        for (const [name, uniform] of this.BasePassUniforms.entries())
        {
            uniform.location = gl.getUniformLocation(this.BasePassShaderProgram, name)
        }

        this.ShadowPassVertexCode = ShadowVertexSourceHead + this.vertexWorldPositionOffsetCode + ShadowVertexSourceFoot
        this.ShadowPassFragmentCode = ShadowFragmentSource
        this.ShadowPassShaderProgram = createProgram(gl, 
            createShader(gl, gl.VERTEX_SHADER, this.ShadowPassVertexCode),
            createShader(gl, gl.FRAGMENT_SHADER, this.ShadowPassFragmentCode))
        this.ShadowPassUniforms = extractUniforms(gl, this.ShadowPassVertexCode, this.ShadowPassFragmentCode)
        for (const [name, uniform] of this.ShadowPassUniforms.entries())
        {
            uniform.location = gl.getUniformLocation(this.ShadowPassShaderProgram, name)
        }
    }

    allLinesStartWithTab(lines)
    {
        for (var i = 0; i < lines.length; ++i)
        {
            if (lines[i].length > 0)
            {
                if (/^\s/.test(lines[i]))
                {
                    return false
                }
                else
                {
                    log ("tab found")
                }
            }
        }

        return true
    }

    toString()
    {
        var code = this.fragmentAlbedoCode
        /*
        var split = code.split('\n')
        while (this.allLinesStartWithTab(split))
        {
            log ("removing tabs")
            for (var i = 0; i < split.length; ++i)
            {
                split[i] = split[i].substring(0)
            }
        }
        code = split.join('\n')
        */

        return "</br><p>Shader</p><textarea class=\"shaderCode\">" + code + "</textarea>"
    }
}