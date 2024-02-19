class LightPass extends RenderPass
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
            uniform sampler2D BlueNoise;
            uniform sampler2D ShadowTexture;
            uniform sampler2D IDTexture;

            uniform sampler2D sky; // #texture path=images/sky.jpg

            uniform float     Time;

            uniform vec3 DirectionalLightDirection;
            uniform mat4 DirectionalLightProjection;
            uniform mat4 DirectionalLightView;

            #define MAX_POINT_LIGHTS 4
            uniform vec3  PointLightPositions[MAX_POINT_LIGHTS];
            uniform vec3  PointLightColors[MAX_POINT_LIGHTS];
            uniform float PointLightRanges[MAX_POINT_LIGHTS];
            uniform float PointLightIntensities[MAX_POINT_LIGHTS];

            #define MAX_SPOT_LIGHTS 4
            uniform vec3  SpotLightPositions[MAX_SPOT_LIGHTS];
            uniform vec4  SpotLightDirections[MAX_SPOT_LIGHTS];
            uniform vec3  SpotLightColors[MAX_SPOT_LIGHTS];
            uniform float SpotLightRanges[MAX_SPOT_LIGHTS];
            uniform float SpotLightIntensities[MAX_SPOT_LIGHTS];
            uniform float SpotLightAngles[MAX_SPOT_LIGHTS];

            uniform vec3 CameraPosition;
            uniform float ShadowBiasMin;    // #expose min=-0.1 max=0.1  step=0.0001 default=-0.01
            uniform float ShadowBiasFactor; // #expose min=-0.1 max=0.1  step=0.0001 default=0.0001
            uniform float ShadowSoftness;   // #expose min=0.0  max=2.0 step=0.01    default=0.001

            uniform float Fog;         // #expose min=0 max=1 step=1 default=1
            uniform float FogDistance; // #expose min=0.0  max=1000.0 step=1.0   default=110.0
            uniform float FogFalloff;  // #expose min=0.01 max=20.0   step=0.001 default=0.832
            uniform float FogMax;      // #expose min=0.0  max=1.0    step=0.01  default=1.0

            uniform float BounceLightHardness; // #expose min=0.0 max=10.0  step=0.0001 default=0.94
            
            uniform float Ambient; // #expose min=0.0 max=1.0 step=0.001 default=0.1

            #define FOG_COLOUR vec4(0.3, 0.3, 0.3, 1.0)

            in vec2 frag_uvs;
            
            layout (location = 0) out vec4 out_colour;
            layout (location = 1) out vec4 out_position;

            float seed = 0.0;
            float random ()
            {
                seed += 0.01;
                return -1.0 + texture(BlueNoise, (frag_uvs.xy + vec2(seed, seed))).x * 2.0;
            }

            float ShadowmapLookup (vec4 position, vec4 normal)
            {
                vec4 fragPosLightSpace = DirectionalLightProjection * DirectionalLightView * (vec4(position.xyz, 1.0));
                vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
                projCoords = projCoords * 0.5 + 0.5;

                vec2 shadowUV = projCoords.xy;
                if (shadowUV.y > 0.9) return 1.0;
                
                float closestDepth = texture(ShadowTexture, shadowUV).r; 
                float currentDepth = projCoords.z;

                float bias = max(ShadowBiasFactor * (1.0 - dot(normal.xyz, DirectionalLightDirection)), ShadowBiasMin);  
                float shadow = currentDepth - bias > closestDepth  ? 0.0 : 1.0;
                return shadow;
                
            } 

            float getDirectionalDiffuse (vec3 n)
            {
                vec3 l = normalize(-DirectionalLightDirection);
                return max(0.0, dot(l, n) * BounceLightHardness + 1.0 - BounceLightHardness);
            }

            float getDirectionalSpecular (vec3 n, vec3 p)
            {
                vec3 l = normalize(-DirectionalLightDirection);
                vec3 v = normalize(CameraPosition.xyz - p.xyz);
                vec3 h = normalize(l + v);
                return pow(max(dot(n, h), 0.0), 16.0);
            }

            vec3 getPointLightDiffuse (vec3 n, vec3 p)
            {
                vec3 result = vec3(0.0);

                for (int i = 0; i < MAX_POINT_LIGHTS; ++i)
                {
                    vec3  l = normalize(PointLightPositions[i] - p);
                    float d = clamp(length(l), 0.0, PointLightRanges[i]) / PointLightRanges[i];

                    result += max(0.0, dot(n, l) * (1.0 - d)) * PointLightIntensities[i] * PointLightColors[i];
                }

                return result;
            }

            vec3 getPointLightSpecular (vec3 n, vec3 p)
            {
                vec3 result = vec3(0.0);

                for (int i = 0; i < MAX_POINT_LIGHTS; ++i)
                {
                    vec3 l = normalize(PointLightPositions[i] - p);
                    vec3 v = normalize(CameraPosition.xyz - p.xyz);
                    vec3 h = normalize(l + v);
                    result += pow(max(dot(n, h), 0.0), 16.0) * PointLightColors[i];
                }

                return result;
            }

            vec3 getSpotLightDiffuse (vec3 n, vec3 p)
            {
                vec3 result = vec3(0.0);

                for (int i = 0; i < MAX_SPOT_LIGHTS; ++i)
                {
                    vec3  l = normalize(SpotLightPositions[i] - p);
                    float d = clamp(length(SpotLightPositions[i] - p), 0.0, SpotLightRanges[i]) / SpotLightRanges[i];
                    float a = clamp(dot(SpotLightDirections[i].xyz, -l), 0.0, 1.0);

                    if (a < SpotLightAngles[i]) a = 0.0; else a = 1.0;

                    result += max(0.0, dot(n, l) * (1.0 - d) * a) * SpotLightIntensities[i] * SpotLightColors[i];
                }

                return result;
            }

            void main ()
            {
                vec4 Albedo = texture(AlbedoTexture, frag_uvs);
                vec4 Normal = vec4(-1.0) + texture(NormalTexture, frag_uvs) * 2.0;
                vec4 Position = texture(PositionTexture, frag_uvs);
                vec4 Lighting = texture(IDTexture, frag_uvs);

                vec4 ShadingResult = Albedo;
                
                if (Albedo.a > 0.0)
                {
                    vec3 n = Normal.xyz;
                    vec3 p = Position.xyz;

                    vec3 diffuse  = (getDirectionalDiffuse(n) + getPointLightDiffuse(n, p) + getSpotLightDiffuse(n, p)) * Lighting.y;
                    vec3 specular = (getDirectionalSpecular(n, p) + getPointLightSpecular(n, p)) * Lighting.z;

                    float shadow   = ShadowmapLookup(Position + vec4(random(), random(), random(), 0.0) * ShadowSoftness, Normal) * 0.5;

                    ShadingResult += 0.1 + (vec4(diffuse.xyz, 1.0) + vec4(specular.xyz, 1.0)) * shadow;
                }

                if (Fog > 0.0)
                {
                    float fog = (Position.w > 0.0) ? Position.w : FogDistance;
                    fog = clamp(0.0, FogDistance, fog) / FogDistance;
                    fog = min(pow(fog, FogFalloff), FogMax);
                    fog = fog + texture(BlueNoise, frag_uvs * 2.0).r * 0.1;
                    ShadingResult = mix(ShadingResult, FOG_COLOUR, clamp(fog, 0.0, 1.0));
                }    

                out_colour = ShadingResult;
                out_position = texture(PositionTexture, frag_uvs);
            }`

        super(context, width, height, VertexSource, FragmentSource)
    }

    Render (
        renderer, 
        ScreenPrimitive, 
        scene, 
        view, 
        framebuffer, 
        inAlbedoTexture, 
        inNormalTexture, 
        inPositionTexture, 
        inBlueNoise,
        inShadows, 
        inID,
        toScreen)
    {
        if (toScreen)
        {
            this.gl.viewport(0, 0, this.width, this.height);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        }
        else
        {
            this.gl.viewport(0, 0, this.width, this.height);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
            this.gl.drawBuffers([
                this.gl.COLOR_ATTACHMENT0, 
                this.gl.COLOR_ATTACHMENT1 ]);
        }

        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
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

        this.gl.activeTexture(this.gl.TEXTURE3);
        this.gl.bindTexture(this.gl.TEXTURE_2D, inBlueNoise);
        this.gl.uniform1i(this.uniforms.get("BlueNoise").location, 3);

        this.gl.uniform1i(this.uniforms.get("ShadowTexture").location, 4);
        this.gl.activeTexture(this.gl.TEXTURE4);
        this.gl.bindTexture(this.gl.TEXTURE_2D, inShadows);

        this.gl.uniform1i(this.uniforms.get("IDTexture").location, 5);
        this.gl.activeTexture(this.gl.TEXTURE5);
        this.gl.bindTexture(this.gl.TEXTURE_2D, inID);

        var u = 6
        for (const [name, uniform] of this.uniforms.entries())
        {
            if (uniform.type == "sampler2D")
            {
                var texture = TexturePool.get(uniform.name)
                if (texture)
                {
                    this.gl.uniform1i(uniform.location, u);
                    this.gl.activeTexture(getTextureEnum(this.gl, u));
                    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                }
                ++u
            }
        }

        const directionalLight = scene.getDirectionalLight()
        if (directionalLight)
        {
            this.gl.uniform3fv(this.uniforms.get("DirectionalLightDirection").location, [directionalLight.view.forward[0], directionalLight.view.forward[1], directionalLight.view.forward[2]])
            this.gl.uniformMatrix4fv(this.uniforms.get("DirectionalLightProjection").location, false, directionalLight.projection)
            this.gl.uniformMatrix4fv(this.uniforms.get("DirectionalLightView").location, false, directionalLight.view.worldToView)
        }

        const pointLights = scene.getPointLights()
        const MAX_POINT_LIGHTS = 4
        if (pointLights)
        {
            var positions   = []
            var colors      = []
            var ranges      = []
            var intensities = []

            for (var i = 0; i < Math.min(pointLights.length, MAX_POINT_LIGHTS); ++i)
            {
                positions.push(...pointLights[i].transform.position)
                colors.push(...pointLights[i].color)
                ranges.push(pointLights[i].range)
                intensities.push(pointLights[i].intensity)
            }

            this.gl.uniform3fv(this.uniforms.get("PointLightPositions").location, positions) 
            this.gl.uniform3fv(this.uniforms.get("PointLightColors").location, colors) 
            this.gl.uniform1fv(this.uniforms.get("PointLightRanges").location, ranges)
            this.gl.uniform1fv(this.uniforms.get("PointLightIntensities").location, intensities)
        }

        const spotLights = scene.getSpotLights()
        const MAX_SPOT_LIGHTS = 4
        if (spotLights)
        {
            var positions   = []
            var directions  = []
            var colors      = []
            var ranges      = []
            var intensities = []
            var angles      = []

            for (var i = 0; i < Math.min(spotLights.length, MAX_SPOT_LIGHTS); ++i)
            {
                positions.push(...spotLights[i].transform.position)
                directions.push(...spotLights[i].view.forward)
                colors.push(...spotLights[i].color)
                ranges.push(spotLights[i].range)
                intensities.push(spotLights[i].intensity)
                angles.push(spotLights[i].angle)
            }

            this.gl.uniform3fv(this.uniforms.get("SpotLightPositions").location, positions) 
            this.gl.uniform4fv(this.uniforms.get("SpotLightDirections").location, directions) 
            this.gl.uniform3fv(this.uniforms.get("SpotLightColors").location, colors) 
            this.gl.uniform1fv(this.uniforms.get("SpotLightRanges").location, ranges)
            this.gl.uniform1fv(this.uniforms.get("SpotLightIntensities").location, intensities)
            this.gl.uniform1fv(this.uniforms.get("SpotLightAngles").location, angles)
        }

        this.gl.uniform3fv(this.uniforms.get("CameraPosition").location, view.position)

        this.gl.uniform1f(this.uniforms.get("Fog").location, this.uniforms.get("Fog").value);

        this.gl.uniform1f(this.uniforms.get("ShadowBiasMin").location, this.uniforms.get("ShadowBiasMin").value)
        this.gl.uniform1f(this.uniforms.get("ShadowBiasFactor").location, this.uniforms.get("ShadowBiasFactor").value)
        this.gl.uniform1f(this.uniforms.get("ShadowSoftness").location, this.uniforms.get("ShadowSoftness").value)

        this.gl.uniform1f(this.uniforms.get("FogDistance").location, this.uniforms.get("FogDistance").value)
        this.gl.uniform1f(this.uniforms.get("FogFalloff").location, this.uniforms.get("FogFalloff").value)
        this.gl.uniform1f(this.uniforms.get("FogMax").location, this.uniforms.get("FogMax").value)


        this.gl.uniform1f(this.uniforms.get("Ambient").location, this.uniforms.get("Ambient").value)
        this.gl.uniform1f(this.uniforms.get("BounceLightHardness").location, this.uniforms.get("BounceLightHardness").value)

        renderer.GeometryPool[ScreenPrimitive.geometry].draw()
    }
}