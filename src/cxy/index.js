
import * as THREE from './build/three.module.js';
import { OrbitControls } from './examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from './examples/jsm/loaders/FBXLoader.js';
// import { GUI } from './examples/jsm/libs/dat.gui.module.js';
import './index.less'


var switchMaterial,mapColor,initStandardMat

export default {
	init($el){

		var container, stats, controls;
		var camera, scene, renderer, light;
		var clock = new THREE.Clock();
		var mixer;
		var material
		var textureCube
		var scale
		var loader
		//currentDrawMode = drawMode.standard;

		// var side = THREE.FrontSide

		mapColor = (map)=>{
			var col = 0xffffff
			// console.log(map)
			if (map == null) col = 0xff00ff

			var mat = new THREE.MeshBasicMaterial({
				color: col,
				skinning: true,
				map: map,
				side: this.side
			})

			return mat;
		}
	

		initStandardMat =(oldMat)=>{
			// console.log(oldMat)
			
			var mat = new THREE.MeshStandardMaterial({

				color: 0xFFFFFF,
				roughness: 1.0,
				metalness: 0.0,

				alphaMap: oldMat.alphaMap,
				aoMap: oldMat.aoMap,
				bumpMap: oldMat.bumpMap,
				displacementMap: oldMat.displacementMap,
				emissiveMap: oldMat.emissiveMap,
				envMap: textureCube,
				lightMap: oldMat.lightMap,
				metalnessMap: oldMat.metalnessMap,
				roughnessMap: oldMat.roughnessMap,
				map: oldMat.map,
				//normalMap: oldMat.normalMap,

				// skinning: true,
				skinning: true,

				side: this.side,
			})

			return mat;
		}

		switchMaterial = function(oldMat){

			if (oldMat.map != null) oldMat.map.encoding = THREE.LinearEncoding;
			var mat;

			
			switch (this.currentDrawMode) {
				case this.drawMode.standard:
					mat = initStandardMat(oldMat)
					break;

				case this.drawMode.normal:

					// debugger
					mat = mapColor(oldMat.normalMap)
					break;

				case this.drawMode.alpha:
					var uniforms = {
						"texture": { value: oldMat.map }
					}

					mat = new THREE.ShaderMaterial({
						uniforms: uniforms,
						vertexShader: `
							varying vec2 vUv;
							void main()
							{
				
								vUv = uv;
								vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
								gl_Position = projectionMatrix * mvPosition;
							}
						`,
						fragmentShader:`
							uniform sampler2D texture;

							varying vec2 vUv;
				
							void main( void ) {
				
								vec4 col = texture2D( texture, vUv );
								gl_FragColor = vec4(vec3(col.a),1.0);
				
							}
						`,
						skinning: true,
						side: this.side
					});
					break;

				case this.drawMode.color:
					mat = mapColor(oldMat.map)
					break

				case this.drawMode.ao:
					mat = mapColor(oldMat.aoMap);
					break;

				case this.drawMode.bump:
					mat = mapColor(oldMat.bumpMap);
					break;

				case this.drawMode.metallic:
					mat = mapColor(oldMat.metalnessMap);
					break;

				case this.drawMode.emissive:
					mat = mapColor(oldMat.emissiveMap);
					break;

				case this.drawMode.lightmap:
					mat = mapColor(oldMat.lightMap);
					break;

				case this.drawMode.env:
					mat = mapColor(oldMat.envMap);
					break;

				case this.drawMode.wireframe:
					// mat = new THREE.MeshBasicMaterial({
					// 	color: this.color,
					// 	skinning: true,
					// 	side: this.side,
					// 	wireframe : true
					// })
					// break;

					mat = new THREE.MeshBasicMaterial({
						color: 0xB3BFBF,
						skinning: true,
						side: this.side
					})
					break;

				case this.drawMode.matcap:
					var texture = new THREE.TextureLoader().load( '//192.168.94.204:7878/models/cxy-model/matcap.jpeg' );
					mat = new THREE.MeshMatcapMaterial({
						matcap: texture,
						normalMap: oldMat.normalMap,
					})
					// var texture = new THREE.TextureLoader().load( '//192.168.94.204:7878/models/cxy-model/matcap.jpeg' )
					// mat = new THREE.MeshBasicMaterial({
					// 	matcap: texture
					// 	//normalMap: oldMat.normalMap,
					// })

					//debugger
					break;
				
				case this.drawMode.vertexNormal:
					mat = initStandardMat(oldMat);
					break;
				case this.drawMode.uv:

					
					var texture = new THREE.TextureLoader().load( '//192.168.94.204:7878/models/cxy-model/UVChecker.png' );
					mat = new THREE.MeshBasicMaterial({
						map: texture
					})
					break;
			}

			mat.transparent = oldMat.transparent;
			return mat;
		}


		function init() {
			container = $el

			this.$el = $el
			
			camera = new THREE.PerspectiveCamera(50, this.$el.offsetWidth / this.$el.offsetHeight, 1, 20000)
			camera.position.set(100, 200, 300)
			scene = new THREE.Scene()
			scene.background = new THREE.Color(0xa0a0a0)

			this.camera = camera
			this.scene = scene

			light = new THREE.DirectionalLight(0xffffff);
			light.position.set(100, 200, 200);
			light.castShadow = true;
			light.shadow.mapSize.width = 2048;
			light.shadow.mapSize.height = 2048;
			light.shadow.camera.top = 240;
			light.shadow.camera.bottom = - 100;
			light.shadow.camera.left = - 120;
			light.shadow.camera.right = 120;
			light.shadow.bias = -0.006;
			scene.add(light);

			light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1)
			scene.add(light)

			var loader = new THREE.CubeTextureLoader()

			loader.setPath('//192.168.94.204:7878/models/cxy-model/cubemap/')

			textureCube = loader.load( [
				'px.png', 'nx.png',
				'py.png', 'ny.png',
				'pz.png', 'nz.png'
			] )

			scene.background = textureCube

			this.textureCube = textureCube

			scene.add(new THREE.AmbientLight(0x222222))

			loader = new FBXLoader()
			loader.load('//192.168.94.204:7878/models/cxy-model/12312.FBX',  (object)=> {

				this.object = object

				this.drawMaterialMode('standard')

				scene.add(this.object)

				this.object.scale.set(this.scale, this.scale, this.scale)
			},
				function (xhr) {
					console.log((xhr.loaded / xhr.total * 100) + "% loaded")
				},
				function (error) {
					console.log(error)
				}
			)


			renderer = new THREE.WebGLRenderer({ antialias: true });
			renderer.setPixelRatio(window.devicePixelRatio);
			renderer.setSize($el.offsetWidth, $el.offsetHeight);
			renderer.shadowMap.enabled = true;
			renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			container.appendChild(renderer.domElement);

			Object.assign(renderer.domElement.style,{
				outline:'none'
			})

			controls = new OrbitControls(camera, renderer.domElement)
			controls.mouseButtons = {
				LEFT: THREE.MOUSE.ROTATE,
				MIDDLE: THREE.MOUSE.PAN,
				RIGHT: THREE.MOUSE.PAN
			}
			controls.screenSpacePanning = true;
			controls.target.set(0, 100, 0);
			controls.update();
			controls.saveState();
			window.addEventListener('resize', ()=>{
				this.resize()
			}, false)
			// stats
		//	stats = new Stats();
			//container.appendChild(stats.dom);
			this.renderer = renderer
			
			document.addEventListener("keydown", keyListen, false);
		}

		function keyListen(event) {
			var keyCode = event.which;
			if (keyCode == 87) {
				console.log("key down");
				controls.reset();
			}
		}

		//
		function animate() {
			requestAnimationFrame(animate)
			renderer.render(scene, camera)
			//stats.update()

		}

		init.call(this)
		animate();
	},
	drawMaterialMode(mode='standard'){

		this.mode = mode

		if(typeof this.drawMode[mode]==undefined){
			return alert(`不存在这个渲染模式-${mode}`)
		}

		this.helpers.forEach(helper=>{
			this.scene.remove(helper)
		})

		this.currentDrawMode =  this.drawMode[mode]

		// if(this.currentDrawMode == 10){
		// 	child.__wireframe__ = false
		// }else{
		// 	child.__wireframe__ = true
		// }

		console.log('currentDrawMode----------:', this.currentDrawMode,this.mode)
		// this.object.marterial = new THREE.MeshStandardMaterial({
		// 	color: 0xff00ff,
		// 	roughness: 1.0,
		// 	metalness: 0.0,

		// 	skinning: true,
		// 	side: THREE.DoubleSide
		// })

		var bbox = new THREE.Box3().setFromObject(this.object)
		bbox.max.sub(bbox.min)
		var maxLength = Math.max(bbox.max.x,bbox.max.y,bbox.max.z)
		this.scale = 200.0 / maxLength


		//this.object_b = this.object.clone()

	//	console.log(this.object,this.object_b)


		
		this.wireframes = []
		this.object.traverse( (child)=> {

			if (child.isMesh) {

				if(child.__wireframe__){
					child.remove(child.__wireframe__)
				}

				if(this.currentDrawMode == this.drawMode.vertexNormal){

					//console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
					child.scale.set(this.scale,this.scale,this.scale)
					var helper = new THREE.VertexNormalsHelper(child)
					this.scene.add(helper)
					this.helpers.push(helper)
					child.scale.set(1,1,1)
				}

				if(this.currentDrawMode == this.drawMode.wireframe) {
					let geo = new THREE.EdgesGeometry(child.geometry) // or WireframeGeometry
					let mat = new THREE.LineBasicMaterial({ color: this.color, linewidth: 2 })
					let wireframe = new THREE.LineSegments(geo, mat)
					child.__wireframe__ = wireframe
					
					child.add(wireframe)

					// {
					//   //1.1.1.1:4234/file/project/xxx.fbx
					// 	"//abc.com/xxx.fbx":"/file/xxx/sss",
					// }
					
				}


				child.castShadow = true;
				child.receiveShadow = true;
		
				///////////////////
				if(!this.material_map[child.name]){
					this.material_map[child.name] = []
					this.material_map[child.name] = child.material.map(mat=>mat.clone())
				}
				//////////////////
				

				this.generateTextureMap()

				// 每个child中含有多个贴图，获取每个materail对象中的 map,normalMap, aoMap各个贴图
				for (var i = 0; i < child.material.length; i++) {
					//let oldMat = child.material[i]
					let oldMat = this.material_map[child.name][i].clone()
					//console.log('oldMat:', oldMat)
					if (oldMat != null) child.material[i] = switchMaterial.call(this, oldMat)
				}
			
			}

		})

	},
	generateTextureMap(){

		// console.log('mateiral_map:',this.material_map)
		// CMan0002-M3-Body: (3) [MeshPhongMaterial, MeshPhongMaterial, MeshPhongMaterial]
		// CMan0002-M3-Hair: (3) [MeshPhongMaterial, MeshPhongMaterial, MeshPhongMaterial]

		Object.keys(this.material_map).forEach(k=>{
			//console.log(this.material_map[k])
			this.material_map[k].forEach(material=>{

				if(material.map){	
					this.textures['standard'][material.map.uuid] = material.map
					this.textures['color'][material.map.uuid] = material.map
				}

				if(material.normalMap){
					this.textures['normal'][material.normalMap.uuid] = material.normalMap
					// new THREE.MeshBasicMaterial({
					// 	color: col,
					// 	skinning: true,
					// 	map: map,
					// 	side: side,
					// })

					// let plane = new THREE.Mesh(
					// 	new THREE.PlaneGeometry(80,80),
					// 	new THREE.MeshBasicMaterial({
					// 		//skinning: true,
					// 		map: material.normalMap,
					// 		side: THREE.DoubleSide
					// 	})
					// )
					// this.scene.add(plane)
				}

				if(material.alphaMap){
					this.textures['alpha'][material.alphaMap.uuid] = material.alphaMap
				}
				if(material.aoMap){
					this.textures['ao'][material.aoMap.uuid] = material.aoMap
				}

				if(material.bumpMap){
					this.textures['bump'][material.bumpMap.uuid] = material.bumpMap
				}
		
				if(material.metalnessMap){
					this.textures['metallic'][material.metalnessMap.uuid] = material.metalnessMap
				}

				if(material.emissiveMap){
					this.textures['emissive'][material.emissiveMap.uuid] = material.emissiveMap
				}

				if(material.lightMap){
					this.textures['lightmap'][material.lightMap.uuid] = material.lightMap
				}
				// this.textures['matcap']['aabbbccc'] = new THREE.MeshMatcapMaterial({
				// 	matcap: new THREE.TextureLoader().load('//192.168.94.204:7878/models/cxy-model/matcap.jpeg'),
				// 	normalMap: material.normalMap
				// })

				// this.textures['matcap']['aabbbccc'] = new THREE.TextureLoader().load('//192.168.94.204:7878/models/cxy-model/matcap.jpeg')

				this.textures['uv']['aabbbccc'] = new THREE.TextureLoader().load( '//192.168.94.204:7878/models/cxy-model/UVChecker.png' )
			})

		})
		//console.log('textures:', this.textures)
		
	},
	resize(){

		this.camera.aspect = this.$el.offsetWidth / this.$el.offsetHeight
		this.camera.updateProjectionMatrix()
		this.renderer.setSize(this.$el.offsetWidth, this.$el.offsetHeight)
	},
	setMaterialSide(v){
		// setMaterialSide
		this.side = v?THREE.FrontSide:THREE.DoubleSide

		this.drawMaterialMode(this.mode)
		
	
	},
	setColor(v){

		this.color = new THREE.Color(v)
		console.log(v, this.color)
		this.drawMaterialMode(this.mode)
	},
	switchSkyBox(v){
		//console.log(v)

		//return
		this.scene.background = !v?new THREE.Color(0xa0a0a0): this.textureCube
	},

	drawMode:{
		standard: 0,  // final  render     MeshStandardMaterial
		normal: 1, // normal
		alpha: 2, //alpha
		color: 3, // basic color
		ao: 4,  // Ao map
		bump: 5,  //  Bump Map
		metallic: 6,  // matalness
		emissive: 7,// emissive
		lightmap: 8,  // 
		env: 9, // env map
		wireframe: 10, // wireframe
		matcap: 11, //  matcap
		vertexNormal:12, // vertexnormal       MeshStandardMaterial
		uv: 13 // 
	},
	scale:1,  // vertexNormal缩放
	camera:null,
	renderer:null,
	scene:null,
	currentDrawMode:'standard',
	mode:'standard',
	object:null,
	object_b:null,
	helpers:[],
	material_map:{},
	matcap:	null,
	textureCube:null,

	side:THREE.DoubleSide,
	color:0xffffff,

	textures:{
		standard:{},
		normal:{},
		alpha:{},
		color:{},
		ao:{},
		bump:{},
		metallic:{},
		emissive:{},
		lightmap:{},
		env:{},
		wireframe:{},
		matcap:{},
		uv:{}
	}
}