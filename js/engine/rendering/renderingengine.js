class RenderingEngine
{
    constructor(engine)
    {
        this.engine = engine

        let params = { 
            alpha:false,
            depth:true,
            stencil:false,
            desynchronized:false,
            antialias:false,
            powerPreference:"low-power" 
        }
        
        this.canvas = document.getElementById('viewport')
        this.ui = document.getElementById('ui')
        this.gl = this.canvas.getContext("webgl2", params)
        this.gl.getExtension('EXT_color_buffer_float')
        this.gl.getExtension("EXT_texture_filter_anisotropic")
        this.gl.getExtension("MOZ_EXT_texture_filter_anisotropic")
        this.gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic")

        this.width = this.canvas.width
        this.height = this.canvas.height

        var timeout
        window.onresize = (e) => 
        { 
            clearTimeout(timeout)
            timeout = setTimeout(
                () => {
                    this.allocateRenderTargets()

                    log("RESIZE")
                    log(" window: " + this.canvas.clientWidth + "x" + this.canvas.clientHeight)
                    log(" render: " + this.canvas.width + "x" + this.canvas.height)
                }, 256)
        }

        this.BaseRenderPass
        this.ShadowRenderPass
        this.LightRenderPass
        this.TAARenderPass
        this.BlurRenderPass
        this.DepthOfFieldRenderPass
        this.TonemappingRenderPass
        this.VisualizeTexture
        this.passes
        this.NumHistorySamples
        this.LightingBuffers
        this.WorldPositionBuffers
        this.FrameBuffers
        this.FrameBuffersNoDepth
        this.ViewTransforms
        this.view

        this.allocateRenderTargets()
        this.settings

        // Textures
        this.WhiteNoiseTexture = loadTexture(this.gl, 'images/noise/halton-noise.png')
        this.STBNBlueNoiseTextures = []
        this.NBlueNoise = 32;
        for (var i = 0; i < this.NBlueNoise; ++i)
        {
            this.STBNBlueNoiseTextures.push(loadTexture(this.gl, 'images/noise/STBN/stbn_scalar_2Dx1Dx1D_128x128x64x1_' + i + '.png'))
        }

        // View
        this.Near = 0.1
        this.Far = 1000.0
        this.FOV = 45.0;

        this.frameID = 0
        
        this.GeometryPool = []

        this.ScreenPrimitive = new RenderComponent(this.createGeometry(QuadMesh))

        this.frametime = new RunningAverage()
    }


    allocateRenderTargets()
    {
        log("allocating render targets at " + Math.min(this.canvas.clientWidth, 1024) + "x" +  Math.min(this.canvas.clientHeight, 1024))
        this.canvas.width = Math.min(this.canvas.clientWidth, 1024)
        this.canvas.height = Math.min(this.canvas.clientHeight, 1024)

        this.width = this.canvas.width
        this.height = this.canvas.height

        this.BaseRenderPass         = new DeferredBasePass (this.gl, this.width, this.height)
        this.ShadowRenderPass       = new ShadowPass       (this.gl, 1600, 1600)
        this.LightRenderPass        = new LightPass        (this.gl, this.width, this.height)
        this.TAARenderPass          = new TAAPass          (this.gl, this.width, this.height)
        this.BlurRenderPass         = new BlurPass         (this.gl, this.width, this.height)
        this.DepthOfFieldRenderPass = new DepthOfFieldPass (this.gl, this.width, this.height)
        this.TonemappingRenderPass  = new TonemappingPass  (this.gl, this.width, this.height)
    
        this.VisualizeTexture = new VisualizationPass(this.gl, this.width, this.height)

        this.passes = [
            this.LightRenderPass       ,
            this.TAARenderPass         ,
            this.DepthOfFieldRenderPass,
            this.TonemappingRenderPass
        ]

        this.NumHistorySamples = 5;
        this.LightingBuffers = new Array(this.NumHistorySamples)
        for (var i = 0; i < this.NumHistorySamples; ++i)
            this.LightingBuffers[i] = createColourTexture(this.gl, 
                this.width, 
                this.height, 
                this.gl.RGBA, this.gl.UNSIGNED_BYTE)

        this.WorldPositionBuffers = new Array(this.NumHistorySamples)
        for (var i = 0; i < this.NumHistorySamples; ++i)
            this.WorldPositionBuffers[i] = createColourTexture(this.gl, 
                this.width, 
                this.height, 
                this.gl.RGBA32F, this.gl.FLOAT)
    
        this.FrameBuffers = new Array(this.NumHistorySamples)
        for (var i = 0; i < this.NumHistorySamples; ++i)
            this.FrameBuffers[i] = createFramebuffer(this.gl, 
                [this.gl.COLOR_ATTACHMENT0, this.gl.COLOR_ATTACHMENT1, this.gl.DEPTH_ATTACHMENT], 
                [this.LightingBuffers[i], this.WorldPositionBuffers[i], this.BaseRenderPass.depth])
            
        this.FrameBuffersNoDepth = new Array(this.NumHistorySamples)
        for (var i = 0; i < this.NumHistorySamples; ++i)
            this.FrameBuffersNoDepth[i] = createFramebuffer(this.gl, 
                [this.gl.COLOR_ATTACHMENT0, this.gl.COLOR_ATTACHMENT1], 
                [this.LightingBuffers[i], this.WorldPositionBuffers[i]])
    
        this.ViewTransforms = new Array(this.NumHistorySamples)
        for (var i = 0; i < this.NumHistorySamples; ++i)
            this.ViewTransforms[i] = identity()

        this.view = new View (
            vec4(0.0, 0.0, 0.0, 0.0), 
            vec4(0.0, 0.0, 0.0, 0.0), 
            this.width, 
            this.height,
            this.canvas.clientHeight / this.canvas.clientWidth,
            this.Near, 
            this.Far, 
            this.FOV,
            false)

        if (this.settings)
        {
            this.settings.generateHTML()
            this.settings.attachHandlers()
        }
    }

    createMaterial(albedo, diffuse, specular, albedoShader, normalShader, positionShader)
    {
        return new Material(this.gl, albedo, diffuse, specular, albedoShader, normalShader, positionShader)
    }

    createGeometry(mesh)
    {
        var index = this.GeometryPool.length
        this.GeometryPool.push(new Geometry(this.gl, mesh))
        return index
    }

    loadGeometry(path)
    {
        var index = this.GeometryPool.length
        this.GeometryPool.push(new Geometry(this.gl, ConeMesh))
        fetch("models/" + path + ".obj")
            .then((f) => { f.text()
            .then((t) => { 
                const mesh = objToMesh(t)
                this.GeometryPool[index] = new Geometry(this.gl, mesh);
                log("Extents" + mesh.extents)})})
        return index
    }

    setView (camera)
    {
        const cameraTransform = camera.getTransform()
        this.view = new View (
            cameraTransform.position, 
            cameraTransform.rotation, 
            this.width, 
            this.height,
            this.canvas.clientHeight / this.canvas.clientWidth,
            this.Near, 
            this.Far, 
            this.FOV,
            this.TAARenderPass.active())

        const LastView = this.ViewTransforms.pop();
        this.ViewTransforms.unshift(multiplym(this.view.projection, this.view.worldToView))

        const LastBuffer = this.LightingBuffers.pop();
        this.LightingBuffers.unshift(LastBuffer);

        const LastWorldBuffer = this.WorldPositionBuffers.pop();
        this.WorldPositionBuffers.unshift(LastWorldBuffer)

        const LastFrameBuffer = this.FrameBuffers.pop();
        this.FrameBuffers.unshift(LastFrameBuffer)

        const LastFrameBufferNoDepth = this.FrameBuffersNoDepth.pop();
        this.FrameBuffersNoDepth.unshift(LastFrameBufferNoDepth)

    }

    update()
    {
        let start = Date.now()

        this.setView(this.engine.scene.getCamera())

        var LastBuffer = null
        this.BaseRenderPass.Render(
            this,
            this.engine.scene,
            this.view,
            false)
        LastBuffer = this.BaseRenderPass.outputAlbedo;
        
        this.engine.events.addUnique(new Event(
            this.getMouseOverObjectID(this.engine.input.mouseX, this.engine.input.mouseY), 
            EVENT_TYPE_MOUSE_HOVER))

        if (this.LightRenderPass.active())
        {
            this.ShadowRenderPass.Render(this, this.engine.scene)
            this.LightRenderPass.Render(
                this,
                this.ScreenPrimitive,
                this.engine.scene,
                this.view,
                this.FrameBuffers[0],
                this.BaseRenderPass.outputAlbedo,
                this.BaseRenderPass.outputNormal,
                this.BaseRenderPass.outputPosition,
                this.STBNBlueNoiseTextures[this.frameID % this.NBlueNoise],
                this.ShadowRenderPass.output,
                this.BaseRenderPass.outputID,
                this.TAARenderPass.active()||
                this.DepthOfFieldRenderPass.active()||
                this.TonemappingRenderPass.active()?false:true)
            LastBuffer = this.LightingBuffers[0]
    
            if (this.TAARenderPass.active()) 
            {
                this.TAARenderPass.Render(
                    this,
                    this.ScreenPrimitive,
                    this.LightingBuffers,
                    this.WorldPositionBuffers,
                    this.ViewTransforms,
                    [ this.width, this.height ],
                    this.TonemappingRenderPass.active() ||
                    this.DepthOfFieldRenderPass.active()?false:true
                )
                LastBuffer = this.TAARenderPass.outputColour
            }
        }
    
        if (this.DepthOfFieldRenderPass.active())
        {
            this.BlurRenderPass.Render(
                this,
                this.ScreenPrimitive,
                LastBuffer,
                2.0)
            this.DepthOfFieldRenderPass.Render(
                this,
                this.ScreenPrimitive,
                LastBuffer,
                this.BlurRenderPass.output,
                this.WorldPositionBuffers[0],
                this.TonemappingRenderPass.active()?false:true
            )
            LastBuffer = this.DepthOfFieldRenderPass.output
        }
        
        if (this.TonemappingRenderPass.active())
        {
            this.TonemappingRenderPass.Render(
                this,
                this.ScreenPrimitive,
                LastBuffer
            )
        }

        //this.VisualizeTexture.Render(this, this.ScreenPrimitive, this.BaseRenderPass.outputNormal)

        this.frametime.add(Date.now() - start)

        ++this.frameID

        if (this.engine.input.SPressed && this.engine.input.CmdPressed)
        {
            this.engine.input.SPressed = false
            this.engine.input.CmdPressed = false
            this.saveScreenshot()
        }
    }

    getMouseOverObjectID (mouseX, mouseY)
    {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.BaseRenderPass.idFramebuffer)
        var pixels = new Uint8Array(4);
        this.gl.readPixels(
            Math.floor(mouseX), Math.floor(mouseY), 
            1, 1, 
            this.gl.RGBA, this.gl.UNSIGNED_BYTE, 
            pixels);
        return pixels[0]
    }

    saveScreenshot()
    {
        var image = document.createElement('a');        
        image.download = 'render.png';
        image.href = this.canvas.toDataURL();
        image.click();
    }
}