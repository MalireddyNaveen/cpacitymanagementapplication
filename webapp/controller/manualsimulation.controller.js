sap.ui.define([
    "./BaseController",
    //"sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
  
  ], (BaseController, Filter, FilterOperator, MessageBox) => {
    "use strict";
  
    return BaseController.extend("com.app.capacitymanagement.controller.manualsimulation", {
      onInit() {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.attachRoutePatternMatched(this.onEmployeeDetailsLoad, this);
  
      },
  
      onEmployeeDetailsLoad: function (oEvent) {
        debugger
        const { id, simulationName } = oEvent.getParameter("arguments");
        this.oSimulationName = simulationName;
        this.ID = id;
        var oTable = this.byId("idProductTableinMS");
        var oBinding = oTable.getBinding("items");
        var oFilter = new Filter("simulationName_simulationName", FilterOperator.EQ, simulationName);
        oBinding.filter([oFilter]);
        this._init3DScene();
        //Applied the Background and Profile Images from the BaseController...
        this.applyStoredProfileImage();
        this.onLoadUserDetailsBasedOnUserID_CM();
      },
  
      //Avatar Press function from the Mannual Simulation...
      onAvatarPress_CM_MannualSimulationPage: function (oEvent) {
        var oComponent = this.getOwnerComponent();
        // Destroy the existing popover if it exists
        if (oComponent.getPopover()) {
          oComponent.getPopover().destroy();
          oComponent.setPopover(null);
        }
  
        // Call the reusable function from BaseController
        this.onPressAvatarPopOverBaseFunction(oEvent);
      },
      onPressNavBacktoMainPage_MannualSimulationPage: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("RouteMainPage", { id: this.ID });
      },
  
      /**Truck type selection based on click display details */
      onTruckTypeChangeMS: function (oEvent) {
        debugger
        var that = this
        let oSelectedItem = oEvent.getParameters().newValue;
  
        var oTable = this.byId("idProductTableinMS");
        var aItems = oTable.getItems();
        if (aItems.length == 0) {
          MessageBox.information("Please Add products or Upload excel file for Simulation and Save")
          return
        };
  
        let aSlectedObject = [];
  
        /***New Code For Volumes */
        aItems.forEach((item) => {
          let oRowContext = item.getBindingContext();
          let oRowObject = oRowContext.getObject("Productno");
          const { description, quantity, ...remainingProperties } = oRowObject;
          let oContextObject = oRowContext.getObject();
          const { ID, Productno, simulationName, ...sampleValues } = oContextObject;
          let oMergeObject = { ...sampleValues, ...remainingProperties }
          aSlectedObject.push(oMergeObject);
        })
        console.log('Sreedhar Items::', aSlectedObject);
        let oTotalProd = aSlectedObject.reduce((sum, Item) => {
          return sum + Number(Item.volume) * Number(Item.SelectedQuantity);
        }, 0)
        console.log("Total Product Volume", oTotalProd);
  
  
        // Fetch dimensions based on truck type
        const oModel = this.getOwnerComponent().getModel();
        const sPath = `/TruckTypes('${oSelectedItem}')`;
        let oRemainingVolume = 0;
  
        oModel.read(sPath, {
  
          success: function (odata) {
            if (odata.length > 0) {
              const numberOfTrucksNeeded = Math.ceil(Math.ceil(oTotalProd) / Number(odata.volume))
              const trucksToUse = numberOfTrucksNeeded > 0 ? numberOfTrucksNeeded : 1;
              oRemainingVolume = Number(odata.volume) - oTotalProd;
              //  this.byId("idPieChartThings").setVisible(true);
              const oDummyData = {
                totalProductsVolume: oTotalProd.toFixed(2),
                truckVolume: Number(odata.volume),
                requiredTrucks: numberOfTrucksNeeded,
                RemainingVolume: oRemainingVolume.toFixed(2)
              }
              this.getView().getModel().setProperty("/RequiredTruck", oDummyData);
              this.getView().getModel().refresh(true);
  
              if (numberOfTrucksNeeded > 1) {
                // MessageBox.information(`Total product volume exceeds the limit. You will need ${trucksToUse} trucks.`);
              } else {
                // MessageBox.information(`You will need ${trucksToUse} truck.`);
              }
  
              const height = parseFloat(odata.height);
              const length = parseFloat(odata.length);
              const width = parseFloat(odata.width);
              const capacity = parseFloat(odata.capacity);
              //   OTruckData = {
              //     height,
              //     length,
              //     width,
              //     capacity
              // };
  
              // Create a new container
              this._createContainer(height, length, width, capacity);
              var height1 = height - 0.01,
                width1 = width - 0.05,
                length1 = length - 0.05;
  
              this._createProducts(aSlectedObject, height1, length1, width1, capacity);
  
  
  
            } else {
              console.error("No data found for the selected truck type.");
            }
  
          }.bind(this),
          error: function (oError) {
            console.error("Error fetching truck type data:", oError);
          }
        });
  
      },
  
      _init3DScene: function () {
        debugger
        if (this.scene) {
          while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
          }
        } else {
          // this.scene = new THREE.Scene();
          // this.scene.background = new THREE.Color(0xFFA500); // Orange background
          this.scene = new THREE.Scene();
          this.scene.background = null; // Transparent background
        }
  
        if (this.renderer) {
          this.renderer.domElement.remove();
          this.renderer.dispose();
        }
  
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        const canvasContainer = document.getElementById("threejsCanvasNew");
        if (!canvasContainer) {
          console.error("Canvas container not found");
          return;
        }
        this.renderer.setSize(1920, 900);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.shadowMap.enabled = true;
        canvasContainer.appendChild(this.renderer.domElement);
  
        this.camera = new THREE.PerspectiveCamera(40, 1800 / 800, 0.1, 1000);
        this.camera.position.set(10, 10, 20);
  
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
  
        this._addLighting();
        this._createStaticBaseLayer();
  
        this._animate();
      },
  
      _createStaticBaseLayer: function () {
        const length = 20;
        const width = 20;
  
        const geometry = new THREE.PlaneGeometry(length, width);
        const material = new THREE.MeshStandardMaterial({
          color: 0x0000,
          metalness: 0.1,
          roughness: 0.8,
          side: THREE.DoubleSide
        });
  
        const baseLayer = new THREE.Mesh(geometry, material);
        baseLayer.rotation.x = -Math.PI / 2;
        baseLayer.position.set(0, -0.02, 0);
        baseLayer.receiveShadow = true;
  
        this.scene.add(baseLayer);
      },
  
      // _createContainer: function (height, length, width) {
      //   const geometry = new THREE.BoxGeometry(length, height, width);
      //   const material = new THREE.MeshPhysicalMaterial({
      //     color: 0xFFFFFFF,
      //     metalness: 0.8,
      //     roughness: 0.4,
      //     opacity: 0.5,
      //     transparent: true,
      //     side: THREE.DoubleSide,
      //   });
      _createContainer: function (height, length, width) {
        debugger
        if (this.container) {
          this.scene.remove(this.container);
          this.container.geometry.dispose();
          this.container.material.dispose();
        }
  
        const geometry = new THREE.BoxGeometry(length, height, width);
        const material = new THREE.MeshPhysicalMaterial({
          color: 0xFFFFFFF,
          metalness: 0.8,
          roughness: 0.4,
          opacity: 0.5,
          transparent: true,
          side: THREE.DoubleSide,
        });
  
        this.container = new THREE.Mesh(geometry, material);
        this.container.position.set(0, height / 2, 0);
        this.container.receiveShadow = true;
  
        this.scene.add(this.container);
  
      },
      _createProducts: function (dataArray, containerHeight, containerLength, containerWidth) {
        if (this.productsGroup) {
          this.scene.remove(this.productsGroup);
        }
  
        this.productsGroup = new THREE.Group();
        const placedProducts = [];
  
        let startX = -containerLength / 2 + 10;
        let startZ = -containerWidth / 2 + 10;
        let currentX = startX;
        let currentZ = startZ;
        let currentY = 0;
  
        const maxRowWidth = containerLength;  // Fill entire row
        const productSpacing = 0.1;
  
        dataArray.forEach((productData) => {
          const quantity = parseInt(productData.SelectedQuantity, 10);
          const productLength = parseFloat(productData.length);
          const productHeight = parseFloat(productData.height);
          const productWidth = parseFloat(productData.width);
  
          for (let i = 0; i < quantity; i++) {
            const geometry = new THREE.BoxGeometry(productLength, productHeight, productWidth);
            const material = new THREE.MeshStandardMaterial({
              color: productData.Color,
              metalness: 0.5,
              roughness: 0.5,
            });
  
            const mesh = new THREE.Mesh(geometry, material);
  
            // Place in rows within the container width
            mesh.position.set(currentX, currentY + productHeight / 2, currentZ);
            mesh.userData = { draggable: true, product: productData };
  
            this.productsGroup.add(mesh);
            placedProducts.push(mesh);
  
            // Update X for the next product
            currentX += productLength + productSpacing;
  
            // Move to the next row if width limit is exceeded
            if (currentX + productLength > startX + maxRowWidth) {
              currentX = startX;
              currentZ += productWidth + productSpacing;
  
              // Move to the next layer if width is exceeded
              if (currentZ + productWidth > startZ + containerWidth) {
                currentZ = startZ;
                currentY += productHeight;
              }
            }
          }
        });
  
        this.scene.add(this.productsGroup);
        this._enableHoverAndDrag(containerHeight, containerLength, containerWidth);
      },
  
      _checkCollision: function (x, y, z, length, height, width, placedProducts, containerLength, containerWidth) {
        for (const product of placedProducts) {
          const pX = product.position.x;
          const pY = product.position.y;
          const pZ = product.position.z;
          const pLength = product.geometry.parameters.width;
          const pHeight = product.geometry.parameters.height;
          const pWidth = product.geometry.parameters.depth;
  
          // Check if the new product overlaps an existing product
          const overlapX = Math.abs(x - pX) < (length / 2 + pLength / 2);
          const overlapY = Math.abs(y - pY) < (height / 2 + pHeight / 2);
          const overlapZ = Math.abs(z - pZ) < (width / 2 + pWidth / 2);
  
          if (overlapX && overlapY && overlapZ) {
            return true; // Collision detected
          }
        }
  
        // Check if the product is touching the container walls
        const touchingWall =
          x - length / 2 < -containerLength / 2 || x + length / 2 > containerLength / 2 ||
          z - width / 2 < -containerWidth / 2 || z + width / 2 > containerWidth / 2;
  
        return touchingWall;
      },
  
      _enableHoverAndDrag: function (containerHeight, containerLength, containerWidth) {
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        let selectedObject = null;
        let originalColor = null;
        const placedProducts = this.productsGroup.children;
  
        const onPointerDown = (event) => {
          const rect = this.renderer.domElement.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
          raycaster.setFromCamera(pointer, this.camera);
          const intersects = raycaster.intersectObjects(this.productsGroup.children, true);
  
          if (intersects.length > 0) {
            selectedObject = intersects[0].object;
            originalColor = selectedObject.material.color.getHex(); // Store original color
            selectedObject.material.color.set(0x00ff00); // Highlight selection
            this.controls.enabled = false;
          }
        };
  
        const onPointerMove = (event) => {
          if (!selectedObject) return;
  
          const rect = this.renderer.domElement.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
          raycaster.setFromCamera(pointer, this.camera);
          const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
          const intersects = raycaster.ray.intersectPlane(plane, new THREE.Vector3());
  
          if (intersects) {
            selectedObject.position.set(intersects.x, selectedObject.geometry.parameters.height / 2, intersects.z);
          }
        };
  
        const onPointerUp = () => {
          if (selectedObject) {
            selectedObject.material.color.set(originalColor); // Restore original color
            selectedObject = null;
            this.controls.enabled = true;
          }
        };
  
        const onKeyDown = (event) => {
          if (!selectedObject) return;
          const rotationStep = Math.PI / 2;
  
          switch (event.key) {
            case 'ArrowLeft':
              selectedObject.rotation.y -= rotationStep;
              break;
            case 'ArrowRight':
              selectedObject.rotation.y += rotationStep;
              break;
            case 'ArrowUp':
              selectedObject.rotation.x -= rotationStep;
              break;
            case 'ArrowDown':
              selectedObject.rotation.x += rotationStep;
              break;
          }
        };
  
        this.renderer.domElement.addEventListener('pointerdown', onPointerDown);
        this.renderer.domElement.addEventListener('pointermove', onPointerMove);
        this.renderer.domElement.addEventListener('pointerup', onPointerUp);
        window.addEventListener('keydown', onKeyDown);
      },
  
      _addLighting: function () {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);
  
        const lightPositions = [
          { x: 50, y: 50, z: 50 },
          { x: -50, y: 50, z: 50 },
          { x: 50, y: 50, z: -50 },
          { x: -50, y: 50, z: -50 }
        ];
  
        lightPositions.forEach((pos) => {
          const light = new THREE.DirectionalLight(0xffffff, 0.5);
          light.position.set(pos.x, pos.y, pos.z);
          this.scene.add(light);
        });
      },
  
  
      _animate: function () {
        const animate = () => {
          requestAnimationFrame(animate);
          this.controls.update();
          this.renderer.render(this.scene, this.camera);
        };
        animate();
      }
  
    });
  });