sap.ui.define(
  [
    "./BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/GenericTile",
    "sap/m/TileContent",
    "sap/m/ImageContent",
  ],
  function (
    BaseController,
    MessageBox,
    MessageToast,
    JSONModel,
    Filter,
    FilterOperator,
    GenericTile,
    TileContent,
    ImageContent
  ) {
    "use strict";

    return BaseController.extend(
      "com.app.capacitymanagement.controller.MainPage",
      {
        _iCarouselTimeout: 0,
        _iCarouselLoopTime: 5000,
        onInit() {
          // var oUserInfo = sap.ushell.Container.getService("UserInfo");
          //   var userName = oUserInfo.getUser().getFullName(); // You can also use getId() for the user ID
          //   console.log("Current User: ", oUserInfo);
          var sUrl = sap.ui.require.toUrl(
            "com/app/capacitymanagement/model/data.json"
          );
          console.log("Resolved URL:", sUrl); // Debugging

          // Create and set the JSON model
          var oModel = new JSONModel(sUrl);
          console.log(oModel);
          this.getView().setModel(oModel, "NamedModel");
          //   const oRouter = this.getOwnerComponent().getRouter();
          //   oRouter.attachRoutePatternMatched(this.onUserDetailsLoadCapacityManagement, this);
          /**Combined Model for Model and Containers */

          const oCombinedModel = new JSONModel({
            Product: {
              Model: "",
              Length: "",
              Width: "",
              Height: "",
              Volume: "",
              Mcategory: "",
              Description: "",
              Netweight: "",
              Grossweight: "",
              Stack: "",
              Bearingcapacity: "",
            },
            Vehicle: {
              Trucktype: "",
              Length: "",
              Width: "",
              Height: "",
              Volume: "",
              Capacity: "",
            },
            RequiredTruck: {
              totalProductsVolume: "",
              truckVolume: "",
              requiredTrucks: "",
            },
          });
          // Set the combined model to the view
          this.getView().setModel(oCombinedModel, "CombinedModel");

          // // Material upload
          this.MaterialModel = new JSONModel();
          this.getView().setModel(this.MaterialModel, "MaterialModel");

          // Container upload
          this.ContainerModel = new JSONModel();
          this.getView().setModel(this.ContainerModel, "ContainerModel");

          // ***JSON Model for Charts*/
          const oJsonModelCal = new JSONModel({
            TotalQuantity: "",
            TotalVolume: "",
            TotalWeight: "",
            RemainingCapacity: "",
          });
          this.getView().setModel(oJsonModelCal, "Calculation");
          const chartDataModel = new JSONModel({ chartData: [] });
          const calculationModel = new JSONModel();
          this.getView().setModel(chartDataModel, "ChartData");
        },

        onItemSelect: async function (oEvent) {
          var oSelectedItem = oEvent.getParameter("selectedItem"),
            selectedText = oSelectedItem.getText(),
            oView = this.getView(),
            that = this;
          const isSimulationUIVisible = oView
            .byId("id_Simulation_UI")
            .getVisible();
          console.log("Selected Text:", selectedText);
          if (selectedText === "Simulation" && !isSimulationUIVisible) {
            this._openCreateSimulationFragment();
          } else if (selectedText === "Simulation" && isSimulationUIVisible) {
            sap.m.MessageBox.show(
              "Are you sure you want to proceed with new simulation?",
              sap.m.MessageBox.Icon.INFORMATION,
              "Confirmation",
              [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
              function (oAction) {
                if (oAction === sap.m.MessageBox.Action.YES) {
                  //               if (oAction === sap.m.MessageBox.Action.OK) {
                  //                 oView.byId("_IDGenText2").setVisible(false);
                  that._openCreateSimulationFragment();
                  oView.byId("id_Simulation_UI").setVisible(false);
                  oView.byId("VBoxForTrucks").setVisible(false);
                  oView.byId("idList4").setVisible(true);
                  oView.byId("idPieChartThings").setVisible(false);
                  var oComboBox = that.byId("id_combobox_for_truckType");
                  oComboBox.setSelectedKey("");
                  oComboBox.setValue("");
                  if (that.renderer) {
                    that.renderer.domElement.remove();
                    that.renderer.dispose();
                  }
                } else {
                }
              }
            );
          }
          var oItem = oEvent.getParameter("item");
          this.byId("pageContainer").to(
            this.getView().createId(oItem.getKey())
          );
        },

        onAfterRendering: function () {
          // GSAP animation for hover on vbox1, vbox2, and vbox3
          // var vbox1 = this.byId("vbox1");
          // var vbox2 = this.byId("vbox2");
          var ofirstCardsubTextContainer = this.byId(
            "id_firstCardsubTextContainer"
          );

          var imageCard = this.byId("id_firstCardImageContainer");

          gsap.fromTo(
            imageCard.getDomRef(),
            {
              opacity: 0, // Start with 0 opacity (invisible)
              x: -100, // Start off the screen (downward)
            },
            {
              opacity: 1, // End with full opacity (visible)
              x: 0, // End at original position
              duration: 2, // Duration of the animation
              ease: "power1.in", // Easing for a smooth animation
            }
          );
          gsap.fromTo(
            ofirstCardsubTextContainer.getDomRef(),
            {
              opacity: 0, // Start with 0 opacity (invisible)
              x: -100, // Start off the screen (downward)
            },
            {
              delay: 2,
              opacity: 1, // End with full opacity (visible)
              x: 0, // End at original position
              duration: 2, // Duration of the animation
              ease: "power1.in", // Easing for a smooth animation
            }
          );

          // // Hover animation for vbox3
          gsap.fromTo(
            ofirstCardsubTextContainer.getDomRef(),
            {
              scale: 1,
            },
            {
              scale: 1.1,
              stagger: 1,
              duration: 0.3,
              ease: "power1.out",
              paused: true,
              repeat: 0,
              reversed: true,
            }
          );

          ofirstCardsubTextContainer
            .getDomRef()
            .addEventListener("mouseenter", function () {
              gsap.to(ofirstCardsubTextContainer.getDomRef(), {
                scale: 1.1,
                ease: "bounce",
                boxShadow: "15px 0px 15px rgba(46, 139, 87, 0.6)",
                borderRadius: "5px",
              });
            });
          ofirstCardsubTextContainer
            .getDomRef()
            .addEventListener("mouseleave", function () {
              gsap.to(ofirstCardsubTextContainer.getDomRef(), {
                scale: 1,
                boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)",
              });
            });

          this.secondCard();
          this.ThirdCard();
          this.FourthCard();
          this.onCarouselPageChanged();
        },
        onUserDetailsLoadCapacityManagement: async function (oEvent1) {
          const { id } = oEvent1.getParameter("arguments");
          this.ID = id;
          this.UserName;
          await this.getUserName(this.ID);
          // Apply the stored profile image to all avatars in the app & load the user details...
          this.applyStoredProfileImage(); //from Base controller
          this.onLoadUserDetailsBasedOnUserID_CM(); //from Base controller

          //Initially Action btns and Barchart will be Disabled in the pages...
          // this.byId("idMaterialMenuBtn").setEnabled(false);
          // this.byId("idContainerMenuBtn").setEnabled(false);
          // this.byId("iddatavisualization").setEnabled(false);
        },
        //Action Btns previously disable when user click on the GO btn then its enabled...
        onSearchSmartFiltersMasterData: function () {
          var oMenuActions = this.byId("idMaterialMenuBtn"); //Action btn in MasterData
          if (oMenuActions) {
            oMenuActions.setEnabled(true); // Set the enabled property to true
          }
        },
        onSearchSmartFiltersContainersData: function () {
          var oMenuActions = this.byId("idContainerMenuBtn"); //Action Btn in ContainerData
          if (oMenuActions) {
            oMenuActions.setEnabled(true); // Set the enabled property to true
          }
        },
        onSearchSmartFiltersPreviousSimulationData: function () {
          var oMenuActions = this.byId("iddatavisualization"); //Barchart Btn in Previous Simulation
          var oMenuActionDelete = this.byId("iddeletebutton");
          if (oMenuActions || oMenuActionDelete) {
            oMenuActions.setEnabled(true); // Set the enabled property to true
            oMenuActionDelete.setEnabled(true);
          }
        },

        //to get user name based on Id
        getUserName: async function (Id) {
          var oModel = this.getOwnerComponent().getModel();
          var that = this;
          await oModel.read(`/Users`, {
            filters: [new Filter("userID", FilterOperator.EQ, Id)],
            success: function (oData) {
              if (oData.results.length > 0) {
                that.UserName =
                  oData.results[0].fName + " " + oData.results[0].lName;
              }
            },
            error: function (oError) {},
          });
        },
        onAvatarPress_CapacityManagement: function (oEvent) {
          var oComponent = this.getOwnerComponent();
          // Destroy the existing popover if it exists
          if (oComponent.getPopover()) {
            oComponent.getPopover().destroy();
            oComponent.setPopover(null);
          }
          // Call the reusable function from BaseController
          this.onPressAvatarPopOverBaseFunction(oEvent); //from Base controller
        },
        onCarouselPageChanged: function () {
          clearTimeout(this._iCarouselTimeout);
          this._iCarouselTimeout = setTimeout(
            function () {
              var oWelcomeCarousel = this.byId("welcomeCarousel");
              if (oWelcomeCarousel) {
                oWelcomeCarousel.next();
                this.onCarouselPageChanged();
              }
            }.bind(this),
            this._iCarouselLoopTime
          );
        },
        secondCard: function () {
          var oSecondCardsubTextContainer = this.byId("id_SecondCardTextVbox");

          gsap.fromTo(
            oSecondCardsubTextContainer.getDomRef(),
            {
              scale: 1,
            },
            {
              scale: 1.1,
              stagger: 1,
              duration: 0.3,
              ease: "power1.out",
              paused: true,
              repeat: 0,
              reversed: true,
            }
          );

          oSecondCardsubTextContainer
            .getDomRef()
            .addEventListener("mouseenter", function () {
              gsap.to(oSecondCardsubTextContainer.getDomRef(), {
                scale: 1.1,
                ease: "bounce",
                boxShadow: "-15px 0px 15px rgba(255, 174, 0, 0.6)",
                borderTopLeftRadius: "15rem",
                borderBottomLeftRadius: "15rem",
              });
            });
          oSecondCardsubTextContainer
            .getDomRef()
            .addEventListener("mouseleave", function () {
              gsap.to(oSecondCardsubTextContainer.getDomRef(), {
                scale: 1,
                boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)",
              });
            });
        },

        ThirdCard: function () {
          var oThirdCardsubTextContainer = this.byId("id_ThirdCardTextVbox");

          gsap.fromTo(
            oThirdCardsubTextContainer.getDomRef(),
            {
              scale: 1,
            },
            {
              scale: 1.1,
              stagger: 1,
              duration: 0.3,
              ease: "power1.out",
              paused: true,
              repeat: 0,
              reversed: true,
            }
          );
          oThirdCardsubTextContainer
            .getDomRef()
            .addEventListener("mouseenter", function () {
              gsap.to(oThirdCardsubTextContainer.getDomRef(), {
                scale: 1.1,
                ease: "bounce",
                boxShadow: "-15px 0px 15px rgba(255, 174, 0, 0.6)",
                borderTopLeftRadius: "15rem",
                borderBottomLeftRadius: "15rem",
              });
            });
          oThirdCardsubTextContainer
            .getDomRef()
            .addEventListener("mouseleave", function () {
              gsap.to(oThirdCardsubTextContainer.getDomRef(), {
                scale: 1,
                boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)",
              });
            });
        },

        FourthCard: function () {
          var oFourthCardsubTextContainer = this.byId("id_FourthCardTextVbox");

          gsap.fromTo(
            oFourthCardsubTextContainer.getDomRef(),
            {
              scale: 1,
            },
            {
              scale: 1.1,
              stagger: 1,
              duration: 0.3,
              ease: "power1.out",
              paused: true,
              repeat: 0,
              reversed: true,
            }
          );

          oFourthCardsubTextContainer
            .getDomRef()
            .addEventListener("mouseenter", function () {
              gsap.to(oFourthCardsubTextContainer.getDomRef(), {
                scale: 1.1,
                ease: "bounce",
                boxShadow: "15px 0px 15px rgba(0, 0, 255, 0.6)",
                borderRadius: "5px",
              });
            });
          oFourthCardsubTextContainer
            .getDomRef()
            .addEventListener("mouseleave", function () {
              gsap.to(oFourthCardsubTextContainer.getDomRef(), {
                scale: 1,
                boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)",
              });
            });
        },

        /***Creating New Containers */
        onSaveCreateContainer: async function () {
          let oView = this.getView(),
            oDataModel = oView.getModel("CombinedModel"),
            oVehcileData = oDataModel.getProperty("/Vehicle"),
            oModel = oView.getModel(),
            oPath = "/CM_Truck_DetailsSet";

          if (
            !oVehcileData.Trucktype ||
            !oVehcileData.Length ||
            !oVehcileData.Width ||
            !oVehcileData.Height ||
            !oVehcileData.Capacity
          ) {
            MessageBox.warning("Please Enter all Values");
            return;
          }
          if (!oVehcileData.Trucktype.endsWith("FT")) {
            oVehcileData.Trucktype = `${oVehcileData.Trucktype}FT`;
          }
          oVehcileData.Volume = String(
            (
              oVehcileData.Length *
              oVehcileData.Width *
              oVehcileData.Height
            ).toFixed(2)
          );
          /**Error check */
          let raisedErrorsCreateContainer = [];
          const aUserInputsCreateContainer = [
            // { Id: "idDesvbncriptionInput_InitialView", value: oProductPayload.EAN, regex: null, message: "Please enter EAN" },
            {
              Id: "idCreateContainerTruckTypeInput",
              value: oVehcileData.Trucktype,
              regex: null,
              message: "Enter Truck Type",
            },
            {
              Id: "idCreateContainerLengthInput",
              value: oVehcileData.Length,
              regex: /^-?\d+(\.\d+)?$/,
              message: "Length should be numeric",
            },
            {
              Id: "idCreateContainerWidthInput",
              value: oVehcileData.Width,
              regex: /^-?\d+(\.\d+)?$/,
              message: "Width should be numeric",
            },
            {
              Id: "idCreateContainerHeightInput",
              value: oVehcileData.Height,
              regex: /^-?\d+(\.\d+)?$/,
              message: "Height should be numeric",
            },
            {
              Id: "idCreateContainerCapacityInput",
              value: oVehcileData.Capacity,
              regex: /^-?\d+(\.\d+)?$/,
              message: "Capacity should be numeric",
            },
          ];
          // Create an array of promises for validation
          const validationPromisesCreateContainer =
            aUserInputsCreateContainer.map(async (input) => {
              let aValidationsCreateContainer = await this.validateField(
                oView,
                input.Id,
                input.value,
                input.regex,
                input.message
              );
              if (aValidationsCreateContainer.length > 0) {
                raisedErrorsCreateContainer.push(
                  aValidationsCreateContainer[0]
                ); // Push first error into array
              }
            });
          // Wait for all validations to complete
          await Promise.all(validationPromisesCreateContainer);
          // Check if there are any raised errors
          if (raisedErrorsCreateContainer.length > 0) {
            // Consolidate errors into a single message
            const errorMessageSave = raisedErrorsCreateContainer.join("\n");
            MessageBox.information(errorMessageSave); // Show consolidated error messages
            return;
          }
          // oVehcileData.tvuom = "M³";
          // oVehcileData.tuom = "KG";
          /**Checking capacity it should be greater than Truck Weight */

          oVehcileData.Length = this.roundOfValue(oVehcileData.Length);
          oVehcileData.Width = this.roundOfValue(oVehcileData.Width);
          oVehcileData.Height = this.roundOfValue(oVehcileData.Height);
          oVehcileData.Capacity = this.roundOfValue(oVehcileData.Capacity);
          try {
            await this.createData(oModel, oVehcileData, oPath);
            MessageToast.show("Successfully Created!!");

            this.byId("idContianersTable").getBinding("items")?.refresh();
            // this.byId("idCreateContainerSelectUOM").setSelectedKey("");
          } catch (error) {
            console.log(error);
            MessageBox.error("Entity already exists!");

            // this.byId("idCreateContainerSelectUOM").setSelectedKey("");
            this.byId("idContianersTable").getBinding("items")?.refresh();
          }
          this.byId("idCreateContainerTruckTypeInput").setValue("");
          this.byId("idCreateContainerLengthInput").setValue("");
          this.byId("idCreateContainerWidthInput").setValue("");
          this.byId("idCreateContainerHeightInput").setValue("");
          this.byId("idCreateContainerCapacityInput").setValue("");
        },

        // Live Validations for Length
        onLiveChangeForConatainerLength: function (oEvent) {
          let slength = oEvent.getParameter("value");
          var oRegex = /^-?\d+(\.\d+)?$/;
          if (oRegex.test(slength)) {
            let oInput = this.getView().byId("idCreateContainerLengthInput");
            oInput.setValueState(sap.ui.core.ValueState.None);
          } else {
            let oInput = this.getView().byId("idCreateContainerLengthInput");
            oInput.setValueState(sap.ui.core.ValueState.Error);
            // MessageToast.show("Invalid Length")
          }
        },

        // Live Validations for Width
        onLiveChangeForContainerWidth: function () {
          let sWidth = this.getView()
            .byId("idCreateContainerWidthInput")
            .getValue();
          var oRegex = /^-?\d+(\.\d+)?$/;
          if (oRegex.test(sWidth)) {
            let oInput = this.getView().byId("idCreateContainerWidthInput");
            oInput.setValueState(sap.ui.core.ValueState.None);
          } else {
            let oInput = this.getView().byId("idCreateContainerWidthInput");
            oInput.setValueState(sap.ui.core.ValueState.Error);
            MessageToast.show("Invalid Width");
          }
        },

        // Live Validations for Container Type
        onLiveChangeForContainerType: async function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var oModel = this.getOwnerComponent().getModel();

          if (sValue.length == 2) {
            var truckExist = await this.readData(
              oModel,
              `/TruckTypes`,
              new Filter("truckType", FilterOperator.EQ, `${sValue}FT`)
            );
            console.log(truckExist);
            if (truckExist.results.length) {
              let oInput = this.getView().byId(
                "idCreateContainerTruckTypeInput"
              );
              oInput.setValueState(sap.ui.core.ValueState.Error);
              oInput.setValueStateText("Container Already Exists.");
            } else {
              let oInput = this.getView().byId(
                "idCreateContainerTruckTypeInput"
              );
              oInput.setValueState(sap.ui.core.ValueState.Success);
              oInput.setValueStateText();
            }
            oEvent.getSource().setValue(sValue.substring(0, 2));
          }
        },
        // Live Validations for Height
        onLiveChangeForContainerHeight: function () {
          let sHeight = this.getView()
            .byId("idCreateContainerHeightInput")
            .getValue();
          var oRegex = /^-?\d+(\.\d+)?$/;
          if (oRegex.test(sHeight)) {
            let oInput = this.getView().byId("idCreateContainerHeightInput");
            oInput.setValueState(sap.ui.core.ValueState.None);
          } else {
            let oInput = this.getView().byId("idCreateContainerHeightInput");
            oInput.setValueState(sap.ui.core.ValueState.Error);
            MessageToast.show("Invalid Height");
          }
        },
        // Live Validations for Capacity
        onLiveChangeForContainerCapacity: function () {
          let sCap = this.getView().byId("idCreateContainerCapacityInput");
          let sCapacity = sCap.getValue();
          var oRegex = /^-?\d+(\.\d+)?$/;
          if (oRegex.test(sCapacity)) {
            sCap.setValueState(sap.ui.core.ValueState.Success);
            sCap.setValueStateText();
          } else {
            sCap.setValueState(sap.ui.core.ValueState.Error);
            MessageToast.show("Invalid Capacity");
          }
        },

        // Live Validations for Weight
        //  onLiveChangeForContainerWeight:function(){
        //   let sW=this.getView().byId("idCreateContainerTruckWieghtInput")
        //   let sWeight=sW.getValue();
        //   var oRegex = /^-?\d+(\.\d+)?$/;
        //   if(oRegex.test(sWeight)){
        //     sW.setValueState(sap.ui.core.ValueState.Success);
        //     sW.setValueStateText();
        //   }
        //   else{

        //     sW.setValueState(sap.ui.core.ValueState.Error)
        //     MessageToast.show("Invalid Weight");
        //  }},

        /**Create Product/Model */
        onCreateProduct: async function () {
          const oView = this.getView(),
            oCombinedModel = oView.getModel("CombinedModel"),
            oProductPayload = oCombinedModel.getProperty("/Product"),
            // oSelectedCat = this.byId("idSelectCat").getSelectedKey(),
            oModel = oView.getModel(),
            oPath = "/CM_MATERIALSet";
          let raisedErrors = [];
          const aUserInputs = [
            // { Id: "idDesvbncriptionInput_InitialView", value: oProductPayload.EAN, regex: null, message: "Please enter EAN" },
            {
              Id: "idInputForModelNum",
              value: oProductPayload.Model,
              regex: null,
              message: "Enter SAP product number",
            },
            {
              Id: "idInputForModelLeng",
              value: oProductPayload.Length,
              regex: /^\d+(\.\d+)?$/,
              message: "Length should be numeric",
            },
            {
              Id: "idInputForModelWidth",
              value: oProductPayload.Width,
              regex: /^\d+(\.\d+)?$/,
              message: "Width should be numeric",
            },
            {
              Id: "idInputForModelHeight",
              value: oProductPayload.Height,
              regex: /^\d+(\.\d+)?$/,
              message: "Height should be numeric",
            },
            // { Id: "idInputForModelCat", value: oProductPayload.mCategory, regex: null, message: "Enter category" },
            {
              Id: "idInputForModelDesc",
              value: oProductPayload.Description,
              regex: null,
              message: "Enter description",
            },
            {
              Id: "idInputForModelNetWeight",
              value: oProductPayload.Netweight,
              regex: /^\d+(\.\d+)?$/,
              message: "Net Weight should be numeric",
            },
            {
              Id: "idInputForModelGrossWeight",
              value: oProductPayload.Grossweight,
              regex: /^\d+(\.\d+)?$/,
              message: "Gross Weight should be numeric",
            },
            // {
            //   Id: "idInputForModelStack",
            //   value: oProductPayload.Stack,
            //   regex: /^\d+$/,
            //   message: "Stack should be numeric",
            // },
          ];
          // Create an array of promises for validation
          const validationPromises = aUserInputs.map(async (input) => {
            let aValidations = await this.validateField(
              oView,
              input.Id,
              input.value,
              input.regex,
              input.message
            );
            if (aValidations.length > 0) {
              raisedErrors.push(aValidations[0]); // Push first error into array
            }
          });

          //  for round off the decimal values

          oProductPayload.Netweight = this.roundOfValue(
            oProductPayload.Netweight
          );
          oProductPayload.Grossweight = this.roundOfValue(
            oProductPayload.Grossweight
          );
          oProductPayload.Length = this.roundOfValue(oProductPayload.Length);
          oProductPayload.Width = this.roundOfValue(oProductPayload.Width);
          oProductPayload.Height = this.roundOfValue(oProductPayload.Height);
          console.log(oProductPayload);

          // Wait for all validations to complete
          await Promise.all(validationPromises);

          // Check if there are any raised errors
          if (raisedErrors.length > 0) {
            // Consolidate errors into a single message
            const errorMessage = raisedErrors.join("\n");
            MessageBox.information(errorMessage); // Show consolidated error messages
            return;
          }

          // validate category
          // if (oSelectedCat === "") {
          //   MessageBox.information("Please Select Category"); // Show consolidated error messages
          //   return;
          // }

          //(*****)PLEASE DONT REMOVE THE COMMENT PART(*****)
          /**Checking L*W*H UOM */
          // let oSlectedLWHUOM = this.byId("idForSelectModelLWHUOM").getSelectedKey();
          // if (oSlectedLWHUOM === 'Select') {
          //   return MessageBox.warning("Please Select L*W*H UOM!!");
          // }
          // oProductPayload.uom = oSlectedLWHUOM;
          /**Checking Net and Gross Weight UOM */
          // let oSlectedNWUOM = this.byId("idSelectModelWeightUOM").getSelectedKey();
          // if (oSlectedNWUOM === 'Select') {
          //   return MessageBox.warning("Please Select Net&Gross Weight UOM!!");
          // }
          //oProductPayload.wuom = oSlectedNWUOM;

          let oVolume;
          // const conversionFactors = {
          //   'CM': 0.01,  // Convert cm to meters
          //   'mm': 0.001, // Convert mm to meters
          //   'M': 1       // No conversion needed for meters
          // };
          oProductPayload.Bearingcapacity = String(
            oProductPayload.Stack * oProductPayload.Grossweight
          );
          // Determine the conversion factor based on UOM
          // const factor = conversionFactors[oProductPayload.uom] || 1; // Default to 1 if UOM is not found

          // oVolume = (oProductPayload.length * factor) * (oProductPayload.width * factor) * (oProductPayload.height * factor);

          // Volume in cubic meters with 2 decimal places
          // oProductPayload.muom = 'PC';
          // oProductPayload.vuom = "M³";

          //Displaying Length Width Height from mm or cm to Meters
          var uom = this.byId("idInputForModelLengUnits").getValue();

          if (uom == "CM" || uom == "cm") {
            (oProductPayload.Height = String(
              (oProductPayload.Height * 0.01).toFixed(4)
            )), // Convert height from cm to meters
              (oProductPayload.Length = String(
                (oProductPayload.Length * 0.01).toFixed(4)
              )), // Convert length from cm to meters
              (oProductPayload.Width = String(
                (oProductPayload.Width * 0.01).toFixed(4)
              )); // Convert width from cm to meters
          }

          if (uom == "mm" || uom == "MM") {
            (oProductPayload.Height = String(
              (oProductPayload.Height * 0.001).toFixed(4)
            )), // Convert height from mm to meters
              (oProductPayload.Length = String(
                (oProductPayload.Length * 0.001).toFixed(4)
              )), // Convert length from mm to meters
              (oProductPayload.Width = String(
                (oProductPayload.Width * 0.001).toFixed(4)
              )); // Convert width from mm to meters
          }

          // Calculate volume in cubic meters
          oVolume =
            oProductPayload.Length *
            oProductPayload.Width *
            oProductPayload.Height;
          // Store the volume in the payload with 2 decimal places
          oProductPayload.Volume = String(oVolume.toFixed(2));

          /**Checking Gross weight ->Gross weight should be greater or equals to Net Weight */

          if (
            Number(oProductPayload.Grossweight) <
            Number(oProductPayload.Netweight)
          ) {
            //         if (oProductPayload.grossWeight < oProductPayload.netWeight) {
            return MessageBox.warning(
              "Gross weight Should be greater or Equals to the NetWeight!!"
            );
          }
          // oProductPayload.Mcategory = oSelectedCat;
          try {
            await this.createData(oModel, oProductPayload, oPath);
            this.getView().byId("idModelsTable").getBinding("items")?.refresh();
            this.byId("idForSelectModelLWHUOM").setSelectedKey("");
            this.byId("idSelectModelWeightUOM").setSelectedKey("");
            MessageToast.show("Successfully Created!");
           // this.byId("idSelectCat").setSelectedKey("");
            oCombinedModel.setProperty("/Product", {}); // clear data after successful creation
            // this.ClearingModel(true);
            MessageToast.show("Successfully Created!");
          } catch (oError) {
            // console.error(error);

            // if (error.statusCode === "400" && JSON.parse(error.responseText).error.message.value.toLowerCase() === "entity already exists") {
            //   MessageBox.information("Product Number Should be unique enter different value")
            //   this.getView().byId("idModelsTable").getBinding("items")?.refresh();
            // } else {
            //   MessageToast.show("Facing technical issue");
            // }
            var sErrorMessage =
              "An error occurred while processing your request."; // Default error message

            // Check if responseText exists
            if (oError.responseText) {
              try {
                // Parse the responseText into a JSON object
                var oErrorResponse = JSON.parse(oError.responseText);

                // Extract the error message
                if (
                  oErrorResponse.error &&
                  oErrorResponse.error.message &&
                  oErrorResponse.error.message.value
                ) {
                  sErrorMessage = oErrorResponse.error.message.value;
                } else if (
                  oErrorResponse.error &&
                  oErrorResponse.error.errordetails &&
                  oErrorResponse.error.errordetails.length > 0
                ) {
                  // Fallback: Check for error details
                  sErrorMessage = oErrorResponse.error.errordetails[0].message;
                }
              } catch (e) {
                // Handle JSON parsing errors
                console.error("Failed to parse error response:", e);
              }
            }

            // Display the error message to the user
            sap.m.MessageBox.error(sErrorMessage);
          }
        },
        // live change for length in Add products
        onClearContainer: function () {
          this.getView().byId("idCreateContainerTruckTypeInput").setValue();
          this.getView().byId("idCreateContainerLengthInput").setValue();
          this.getView().byId("idCreateContainerWidthInput").setValue();
          this.getView().byId("idCreateContainerHeightInput").setValue();
          this.getView().byId("idCreateContainerTruckWieghtInput").setValue();
          this.getView().byId("idCreateContainerCapacityInput").setValue();
        },
        // live change for Add products
        onLiveChange: function () {
          let slength = this.getView().byId("idInputForModelLeng").getValue();
          var oRegex = /^[0-9]*\.?[0-9]*$/;
          if (oRegex.test(slength)) {
            let oInput = this.getView().byId("idInputForModelLeng");
            oInput.setValueState(sap.ui.core.ValueState.None);
          } else {
            let oInput = this.getView().byId("idInputForModelLeng");
            oInput.setValueState(sap.ui.core.ValueState.Error);
          }
        },
        // live change for width in add product
        onLiveChange1: function () {
          let sWidthInput = this.getView().byId("idInputForModelWidth");
          let sWidth = sWidthInput.getValue();
          var oRegex = /^[0-9]*\.?[0-9]*$/;
          if (oRegex.test(sWidth)) {
            sWidthInput.setValueState(sap.ui.core.ValueState.None);
          } else {
            sWidthInput.setValueState(sap.ui.core.ValueState.Error);
          }
        },
        // live change for height in add product
        onLiveChange2: function () {
          let oHeightInput = this.getView().byId("idInputForModelHeight");
          let oHeight = oHeightInput.getValue();
          var oRegex = /^[0-9]*\.?[0-9]*$/;
          if (oRegex.test(oHeight)) {
            oHeightInput.setValueState(sap.ui.core.ValueState.None);
          } else {
            oHeightInput.setValueState(sap.ui.core.ValueState.Error);
          }
        },
        // live change for stack in add product
        onLiveChange4: function () {
          let oStackInput = this.getView().byId("idInputForModelStack");
          let oStack = oStackInput.getValue();
          let oRegex = /^\d+$/;
          if (oRegex.test(oStack)) {
            oStackInput.setValueState(sap.ui.core.ValueState.None);
          } else {
            oStackInput.setValueState(sap.ui.core.ValueState.Error);
          }
        },
        // live change for gross weight in add product
        onLivechangeGrossWeight: function () {
          let oGrossinput = this.getView().byId("idInputForModelGrossWeight");
          let oGross = oGrossinput.getValue();
          let oRegex = /^[0-9]*\.?[0-9]*$/;
          if (oRegex.test(oGross)) {
            oGrossinput.setValueState(sap.ui.core.ValueState.None);
          } else {
            oGrossinput.setValueState(sap.ui.core.ValueState.Error);
          }
        },
        // live change for Net weight in add product
        onLiveChangeNetWt: function () {
          let oNetWtInput = this.getView().byId("idInputForModelNetWeight");
          let oNetWt = oNetWtInput.getValue();
          let oRegex = /^[0-9]*\.?[0-9]*$/;
          if (oRegex.test(oNetWt)) {
            oNetWtInput.setValueState(sap.ui.core.ValueState.None);
          } else {
            oNetWtInput.setValueState(sap.ui.core.ValueState.Error);
          }
        },
        // live change for product no in add product
        onLiveChangeProduct: function () {
          let oProdNoInp = this.getView().byId("idInputForModelNum");
          let oProdNo = oProdNoInp.getValue();
          if (!oProdNo) {
            oProdNoInp.setValueState(sap.ui.core.ValueState.Error);
          } else {
            oProdNoInp.setValueState(sap.ui.core.ValueState.None);
          }
        },
        // live change for product description in add product
        onLiveChangeDesc: function () {
          let oProDesInput = this.getView().byId("idInputForModelDesc");
          let oProDes = oProDesInput.getValue();
          if (!oProDes) {
            oProDesInput.setValueState(sap.ui.core.ValueState.Error);
          } else {
            oProDesInput.setValueState(sap.ui.core.ValueState.None);
          }
        },

        /**Opening ModelEdit Fragment */
        onModelEditFragment: async function () {
          if (!this.oEdit) {
            this.oEdit = await this.loadFragment("EditproductDetails");
          }
          this.oEdit.open();
        },
        /**closing Edit Model Fragment */
        onCloseEditModel: function () {
          if (this.oEdit.isOpen()) {
            this.oEdit.close();
          }
          this.getView().getModel("CombinedModel").setProperty("/Product", {});
        },

        // live change for length in Add products
        onClearContainer: function () {
          this.getView().byId("idCreateContainerTruckTypeInput").setValue();
          this.getView().byId("idCreateContainerLengthInput").setValue();
          this.getView().byId("idCreateContainerWidthInput").setValue();
          this.getView().byId("idCreateContainerHeightInput").setValue();
          this.getView().byId("idCreateContainerTruckWieghtInput").setValue();
          this.getView().byId("idCreateContainerCapacityInput").setValue();
        },
        // live change for Add products
        onLiveChange: function () {
          let slength = this.getView().byId("idInputForModelLeng").getValue();
          var oRegex = /^[0-9]*\.?[0-9]*$/;
          if (oRegex.test(slength)) {
            let oInput = this.getView().byId("idInputForModelLeng");
            oInput.setValueState(sap.ui.core.ValueState.Success);
          } else {
            let oInput = this.getView().byId("idInputForModelLeng");
            oInput.setValueState(sap.ui.core.ValueState.Error);
          }
        },
        // live change for width in add product
        onLiveChange1: function () {
          let sWidthInput = this.getView().byId("idInputForModelWidth");
          let sWidth = sWidthInput.getValue();
          var oRegex = /^[0-9]*\.?[0-9]*$/;
          if (oRegex.test(sWidth)) {
            sWidthInput.setValueState(sap.ui.core.ValueState.Success);
          } else {
            sWidthInput.setValueState(sap.ui.core.ValueState.Error);
          }
        },
        // live change for height in add product
        onLiveChange2: function () {
          let oHeightInput = this.getView().byId("idInputForModelHeight");
          let oHeight = oHeightInput.getValue();
          var oRegex = /^[0-9]*\.?[0-9]*$/;
          if (oRegex.test(oHeight)) {
            oHeightInput.setValueState(sap.ui.core.ValueState.Success);
          } else {
            oHeightInput.setValueState(sap.ui.core.ValueState.Error);
          }
        },
        // live change for stack in add product
        onLiveChange4: function () {
          let oStackInput = this.getView().byId("idInputForModelStack");
          let oStack = oStackInput.getValue();
          let oRegex = /^\d+$/;
          if (oRegex.test(oStack)) {
            oStackInput.setValueState(sap.ui.core.ValueState.Success);
          } else {
            oStackInput.setValueState(sap.ui.core.ValueState.Error);
          }
        },
        // live change for gross weight in add product
        onLivechangeGrossWeight: function () {
          let oGrossinput = this.getView().byId("idInputForModelGrossWeight");
          let oGross = oGrossinput.getValue();
          let oRegex = /^[0-9]*\.?[0-9]*$/;
          if (oRegex.test(oGross)) {
            oGrossinput.setValueState(sap.ui.core.ValueState.Success);
          } else {
            oGrossinput.setValueState(sap.ui.core.ValueState.Error);
          }
        },
        // live change for Net weight in add product
        onLiveChangeNetWt: function () {
          let oNetWtInput = this.getView().byId("idInputForModelNetWeight");
          let oNetWt = oNetWtInput.getValue();
          let oRegex = /^[0-9]*\.?[0-9]*$/;
          if (oRegex.test(oNetWt)) {
            oNetWtInput.setValueState(sap.ui.core.ValueState.Success);
          } else {
            oNetWtInput.setValueState(sap.ui.core.ValueState.Error);
          }
        },
        // live change for product no in add product
        onLiveChangeProduct: function () {
          let oProdNoInp = this.getView().byId("idInputForModelNum");
          let oProdNo = oProdNoInp.getValue();
          if (!oProdNo) {
            oProdNoInp.setValueState(sap.ui.core.ValueState.Error);
          } else {
            oProdNoInp.setValueState(sap.ui.core.ValueState.Success);
          }
        },
        // live change for product description in add product
        onLiveChangeDesc: function () {
          let oProDesInput = this.getView().byId("idInputForModelDesc");
          let oProDes = oProDesInput.getValue();
          if (!oProDes) {
            oProDesInput.setValueState(sap.ui.core.ValueState.Error);
          } else {
            oProDesInput.setValueState(sap.ui.core.ValueState.Success);
          }
        },

        /**Opening ModelEdit Fragment */
        onModelEditFragment: async function () {
          if (!this.oEdit) {
            this.oEdit = await this.loadFragment("EditproductDetails");
          }
          this.oEdit.open();
        },
        /**closing Edit Model Fragment */
        onCloseEditModel: function () {
          if (this.oEdit.isOpen()) {
            this.oEdit.close();
          }
          this.getView().getModel("CombinedModel").setProperty("/Product", {});
        },

        // /** Deleting Models */
        // onModelDelete: async function () {
        //   let oSlectedItems = this.byId("idModelsTable").getSelectedItems();
        //   if (oSlectedItems.length < 1) {
        //     return MessageBox.warning("Please Select atleast One Model/Prodcut");
        //   }

        //   this._oBusyDialog = new sap.m.BusyDialog({
        //     text: "Deleting Data"
        //   });
        //   this._oBusyDialog.open()

        //   try {
        //     await new Promise((resolve) => setTimeout(resolve, 500));

        //     const oModel = this.getView().getModel();
        //     // Create a batch group ID to group the delete requests
        //     var sBatchGroupId = "deleteBatchGroup";
        //     // Start a batch operation
        //     oModel.setUseBatch(true);
        //     oModel.setDeferredGroups([sBatchGroupId]);
        //     oSlectedItems.forEach(async (item) => {
        //       let sPath = item.getBindingContext().getPath();
        //       await this.deleteData(oModel, sPath, sBatchGroupId);

        //     })
        //     // Submit the batch request
        //     oModel.submitChanges({
        //       groupId: sBatchGroupId,
        //       success: this._onBatchSuccess.bind(this),
        //       error: this._onBatchError.bind(this),
        //       refresh: this.byId("idModelsTable").getBinding("items").refresh()
        //     });

        //   } catch (error) {
        //     MessageBox.error("Technical deletion error");
        //   } finally {
        //     this._oBusyDialog.close()
        //   }
        // },

        // Success callback after the batch request
        _onBatchSuccess: function (oData) {
          MessageToast.show("successfully Deleted");
        },

        // Error callback after the batch request
        _onBatchError: function (oError) {
          MessageToast.show("Batch delete failed. Please try again.");
        },
        //test
        /**Truck type selection based on click display details */
        onTruckTypeChange: async function (oEvent) {
          const oModel = this.getOwnerComponent().getModel();
          var that = this;
          // let oSelectedItem = oEvent.getParameters().newValue;
          let oSelectedItem = this.byId(
            "id_combobox_for_truckType"
          ).getSelectedKey();

          var oTable = this.byId("idProductTable");
          var aItems = oTable.getItems();
          if (aItems.length == 0) {
            MessageBox.information(
              "Please Add products or Upload excel file for Simulation and Save"
            );
            return;
          }

          let aSlectedObject = [];
          for (const item of aItems) {
            try {
              const oRowContext = item.getBindingContext();
              const oRowObject = oRowContext.getObject("Productno");

              // Wait for the read operation to complete
              const odata = await new Promise((resolve, reject) => {
                oModel.read(`/CM_MATERIALSet('${oRowObject}')`, {
                  success: resolve,
                  error: reject,
                });
              });
              console.log("Naveen");
              const { Description, Quantity, ...remainingProperties } = odata;
              const oContextObject = oRowContext.getObject();
              const { Id, Productno, Simulationname, ...sampleValues } =
                oContextObject;
              const oMergeObject = { ...sampleValues, ...remainingProperties };

              aSlectedObject.push(oMergeObject);
            } catch (error) {
              console.error("Error processing item:", error);
            }
          }

          // Now you can use aSlectedObject here
          console.log("Completed processing:", aSlectedObject);

          // /***New Code For Volumes */
          // aItems.forEach((item) => {
          //   let oRowContext = item.getBindingContext();
          //   let oRowObject = oRowContext.getObject("Productno");
          //   oModel.read(`CM_MATERIALSet('${oRowObject}')`,{
          //     success:function(odata){
          //       const { description, quantity, ...remainingProperties } = odata;
          //     },
          //     error:function(oError){
          //       console.log(oError)
          //     }
          //   })
          //   // const { description, quantity, ...remainingProperties } = oRowObject;
          //   // let oContextObject = oRowContext.getObject();
          //   // const { ID, Productno, simulationName, ...sampleValues } = oContextObject;
          //   // let oMergeObject = { ...sampleValues, ...remainingProperties }
          //   // aSlectedObject.push(oMergeObject);
          // })
          // console.log('Sreedhar Items::', aSlectedObject);
          let oTotalProd = aSlectedObject.reduce((sum, Item) => {
            return sum + Number(Item.Volume) * Number(Item.Selectedquantity);
          }, 0);
          console.log("Total Product Volume", oTotalProd);

          var oTable = this.byId("idProductTable").getItems();
          if (oTable.length == 0) {
            sap.m.MessageBox.show(
              "Please Add products or Upload excel file for Simulation",
              sap.m.MessageBox.Icon.ERROR,
              "Error",
              [sap.m.MessageBox.Action.CANCEL],
              function (oAction) {
                if (oAction === sap.m.MessageBox.Action.CANCEL) {
                  that
                    .getView()
                    .byId("id_combobox_for_truckType")
                    .setSelectedKey("")
                    .setValue("");
                }
              }
            );
            return;
          }

          // Reinitialize the 3D scene
          this._init3DScene();

          // Fetch dimensions based on truck type

          const sPath = `/CM_Truck_DetailsSet('${oSelectedItem}')`;
          let oRemainingVolume = 0;

          oModel.read(sPath, {
            success: function (odata) {
              console.log(odata);
              if (odata) {
                // const numberOfTrucksNeeded = Math.ceil(
                //   Math.ceil(oTotalProd) / Number(odata.volume)
                // );
                // const trucksToUse =
                //   numberOfTrucksNeeded > 0 ? numberOfTrucksNeeded : 1;
                // oRemainingVolume = Number(odata.volume) - oTotalProd;
                // console.log("Truck Volume", Number(odata.volume));
                this.byId("idPieChartThings").setVisible(true);
                // const oDummyData = {
                //   totalProductsVolume: oTotalProd.toFixed(2),
                //   truckVolume: Number(odata.volume),
                //   requiredTrucks: numberOfTrucksNeeded,
                //   RemainingVolume: oRemainingVolume.toFixed(2),
                // };
                // this.getView()
                //   .getModel("CombinedModel")
                //   .setProperty("/RequiredTruck", oDummyData);
                // this.getView().getModel("CombinedModel").refresh(true);

                // if (numberOfTrucksNeeded > 1) {
                //   // MessageBox.information(`Total product volume exceeds the limit. You will need ${trucksToUse} trucks.`);
                // } else {
                //   // MessageBox.information(`You will need ${trucksToUse} truck.`);
                // }

                const height = parseFloat(odata.Height);
                const length = parseFloat(odata.Length);
                const width = parseFloat(odata.Width);
                const capacity = parseFloat(odata.Capacity);
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

                this._createProducts(
                  aSlectedObject,
                  height1,
                  length1,
                  width1,
                  capacity
                );
                this.byId("ManualSimulation").setVisible(true);
              } else {
                console.error("No data found for the selected truck type.");
              }
            }.bind(this),
            error: function (oError) {
              console.error("Error fetching truck type data:", oError);
            },
          });
        },

        //Material Batch operations fragment open and data setting to that model ---> subash */

        onMaterialUploadbtn: function () {
          var oFileInput = document.createElement("input");
          oFileInput.type = "file";
          // Trigger the file input click event to open the file dialog
          oFileInput.click();
          oFileInput.addEventListener(
            "change",
            this._onFileSelected.bind(this, oFileInput)
          );
        },

        // /** Deleting Models */
        // onModelDelete: async function () {
        //   let oSlectedItems = this.byId("idModelsTable").getSelectedItems();
        //   if (oSlectedItems.length < 1) {
        //     return MessageBox.warning("Please Select atleast One Model/Prodcut");
        //   }

        //   this._oBusyDialog = new sap.m.BusyDialog({
        //     text: "Deleting Data"
        //   });
        //   this._oBusyDialog.open()

        //   try {
        //     await new Promise((resolve) => setTimeout(resolve, 500));

        //     const oModel = this.getView().getModel();
        //     // Create a batch group ID to group the delete requests
        //     var sBatchGroupId = "deleteBatchGroup";
        //     // Start a batch operation
        //     oModel.setUseBatch(true);
        //     oModel.setDeferredGroups([sBatchGroupId]);
        //     oSlectedItems.forEach(async (item) => {
        //       let sPath = item.getBindingContext().getPath();
        //       await this.deleteData(oModel, sPath, sBatchGroupId);

        //     })
        //     // Submit the batch request
        //     oModel.submitChanges({
        //       groupId: sBatchGroupId,
        //       success: this._onBatchSuccess.bind(this),
        //       error: this._onBatchError.bind(this),
        //       refresh: this.byId("idModelsTable").getBinding("items").refresh()
        //     });

        //   } catch (error) {
        //     MessageBox.error("Technical deletion error");
        //   } finally {
        //     this._oBusyDialog.close()
        //   }
        // },

        /*edit product functinality*/
        onModelEdit: async function () {
          var oSelectedItem = this.byId("idModelsTable").getSelectedItems();
          if (oSelectedItem.length == 0) {
            MessageBox.information("Please select at least one Row for edit!");
            return;
          }
          if (oSelectedItem.length > 1) {
            MessageBox.information("Please select only one Row for edit!");
            return;
          }
          let oPayload = oSelectedItem[0].getBindingContext().getObject();

          this.getView()
            .getModel("CombinedModel")
            .setProperty("/Product", oPayload);
          if (!this.oEdit) {
            this.oEdit = await this.loadFragment("EditproductDetails");
          }
          this.oEdit.open();
        },
        onCancelInEditProductDialog: function () {
          if (this.oEdit.isOpen()) {
            this.oEdit.close();
          }
        },

        /**save After Modifications */
        onSaveProduct: async function () {
          // Get the edited data from the fragment model
          const oView = this.getView(),
            oProductModel = oView.getModel("CombinedModel"),
            oUpdatedProduct = oProductModel.getProperty("/Product"),
            // Get the original product row binding context (from the selected row in the table)
            oTable = this.byId("idModelsTable"),
            oSelectedItem = oTable.getSelectedItem(),
            oContext = oSelectedItem.getBindingContext(),
            // Use the context to get the path and ID of the selected product for updating
            sPath = oContext.getPath(), // The path to the product entry in the OData model
            oModel = oView.getModel();

          // Create the payload for updating the product in the backend
          var oPayloadmodelupdate = {
            model: oUpdatedProduct.model,

            description: oUpdatedProduct.description,
            grossWeight: oUpdatedProduct.grossWeight,
            netWeight: oUpdatedProduct.netWeight,
            length: oUpdatedProduct.length,
            width: oUpdatedProduct.width,
            wuom: oUpdatedProduct.wuom,
            height: oUpdatedProduct.height,
            uom: oUpdatedProduct.uom,

            //           stack: oUpdatedProduct.stack
            //         };
            //         const oView = this.getView();

            stack: oUpdatedProduct.stack,
            volume: oUpdatedProduct.volume,
          };

          let raisedErrorsSave = [];
          const aUserInputsSave = [
            {
              Id: "editProductNoInput",
              value: oPayloadmodelupdate.model,
              regex: null,
              message: "Enter SAP product number",
            },
            {
              Id: "editproLengthInput",
              value: oPayloadmodelupdate.length,
              regex: /^\d+(\.\d+)?$/,
              message: "Length should be numeric",
            },
            {
              Id: "editprodWidthInput",
              value: oPayloadmodelupdate.width,
              regex: /^\d+(\.\d+)?$/,
              message: "Width should be numeric",
            },
            {
              Id: "editprodHeightInput",
              value: oPayloadmodelupdate.height,
              regex: /^\d+(\.\d+)?$/,
              message: "Height should be numeric",
            },
            {
              Id: "editDescriptionInput",
              value: oPayloadmodelupdate.description,
              regex: null,
              message: "Enter description",
            },
            {
              Id: "editnetWeightInput",
              value: oPayloadmodelupdate.netWeight,
              regex: /^\d+(\.\d+)?$/,
              message: "Net Weight should be numeric",
            },
            {
              Id: "editgrossWeightInput",
              value: oPayloadmodelupdate.grossWeight,
              regex: /^\d+(\.\d+)?$/,
              message: "Gross Weight should be numeric",
            },
            // { Id: "editQuantityInput", value: oPayloadmodelupdate.quantity, regex: /^\d+$/, message: "Quantity should be numeric" },
            {
              Id: "editstackInput",
              value: oPayloadmodelupdate.stack,
              regex: /^\d+$/,
              message: "Stack should be numeric",
            },
          ];
          // Create an array of promises for validation

          const validationPromisesSave = aUserInputsSave.map(async (input) => {
            let aValidationsSave = await this.validateField(
              oView,
              input.Id,
              input.value,
              input.regex,
              input.message
            );
            if (aValidationsSave.length > 0) {
              raisedErrorsSave.push(aValidationsSave[0]); // Push first error into array
            }
          });

          // Wait for all validations to complete
          await Promise.all(validationPromisesSave);

          // Check if there are any raised errors
          if (raisedErrorsSave.length > 0) {
            // Consolidate errors into a single message
            const errorMessageSave = raisedErrorsSave.join("\n");
            MessageBox.information(errorMessageSave); // Show consolidated error messages
            return;
          }

          oPayloadmodelupdate.netWeight = this.roundOfValue(
            oPayloadmodelupdate.netWeight
          );
          oPayloadmodelupdate.grossWeight = this.roundOfValue(
            oPayloadmodelupdate.grossWeight
          );
          oPayloadmodelupdate.length = this.roundOfValue(
            oPayloadmodelupdate.length
          );
          oPayloadmodelupdate.width = this.roundOfValue(
            oPayloadmodelupdate.width
          );
          oPayloadmodelupdate.height = this.roundOfValue(
            oPayloadmodelupdate.height
          );

          oPayloadmodelupdate.volume = String(
            (
              oPayloadmodelupdate.height *
              oPayloadmodelupdate.width *
              oPayloadmodelupdate.length
            ).toFixed(2)
          );
          oPayloadmodelupdate.bearingCapacity = String(
            oPayloadmodelupdate.stack * oPayloadmodelupdate.grossWeight
          );
          try {
            // Ensure both values are numbers
            let grossWeight = parseFloat(oPayloadmodelupdate.grossWeight);
            let netWeight = parseFloat(oPayloadmodelupdate.netWeight);

            // Check if the values are valid numbers
            if (isNaN(grossWeight) || isNaN(netWeight)) {
              MessageBox.error("Invalid weight values");
              return;
            }

            // Compare the weights
            if (grossWeight > netWeight) {
              await this.updateData(oModel, oPayloadmodelupdate, sPath);
              MessageBox.success("Product details updated successfully!");
              // Close the fragment
              this.onCloseEditModel();
              // Optionally, refresh the table binding to reflect the changes
              oTable.getBinding("items").refresh();
            } else {
              MessageBox.information(
                "Grossweight should be greater than Netweight"
              );
            }
          } catch (oError) {
            MessageBox.error(
              "Error updating product details: " + oError.message
            );
            this.onCloseEditModel();
          }
        },

        //Material Batch operations fragment open and data setting to that model ---> subash */
        onMaterialUploadbtn: function () {
          var oFileInput = document.createElement("input");
          oFileInput.type = "file";
          // Trigger the file input click event to open the file dialog
          oFileInput.click();
          oFileInput.addEventListener(
            "change",
            this._onFileSelected.bind(this, oFileInput)
          );
        },
        _onFileSelected: async function (oFileInput) {
          // Retrieve the selected file
          var oFile = oFileInput.files[0];
          // test

          // Get the file name and MIME type
          var fileName = oFile.name;

          // Allowed extensions for Excel files
          var allowedExtensions = [".xls", ".xlsx", ".xlsm"];

          // Check if the file extension is valid
          var fileExtension = fileName
            .substring(fileName.lastIndexOf("."))
            .toLowerCase();

          if (!allowedExtensions.includes(fileExtension)) {
            alert("Please select a valid Excel file (.xls, .xlsx, .xlsm)");
            return;
          }
          // test

          if (oFile) {
            // Here, you can implement the logic to handle the file
            // Example of handling the file upload logic.
            if (!this.oFragment) {
              this.oFragment = await this.loadFragment("MaterialXlData");
            }
            this.oFragment.open();
            await this._importData(oFile);
          }
        },
        /**Loading Container Fragment Data */
        _importData: function (file) {
          var that = this;
          var excelData = {};
          if (file && window.FileReader) {
            var reader = new FileReader();
            reader.onload = function (e) {
              var data = new Uint8Array(e.target.result);
              var workbook = XLSX.read(data, {
                type: "array",
              });
              workbook.SheetNames.forEach(function (sheetName) {
                // Here is your object for every sheet in workbook
                excelData = XLSX.utils.sheet_to_json(
                  workbook.Sheets[sheetName]
                );
                // adding serial numbers
                excelData.forEach(function (item, index) {
                  item.serialNumber = index + 1; // Serial number starts from 1
                });
              });

              // Setting the data to the local model
              that.MaterialModel.setData({
                items: excelData,
              });
              that.MaterialModel.refresh(true);
            };
            reader.onerror = function (ex) {
              console.log(ex);
            };
            reader.readAsArrayBuffer(file);
          }
        },
        //Creating Models batch
        // onBatchSave: async function () {
        //   var that = this;
        //   // Fetch the data model containing the uploaded Models
        //   var addedProdCodeModel = this.getView()
        //     .getModel("MaterialModel")
        //     .getData();
        //   var oDataModel = this.getView().getModel();
        //   // Group ID for batch requests
        //   var batchGroupId = "batchCreateGroup";
        //   const oView = this.getView();

        //   let raisedErrors = [];
        //   // Validation rules for various fields
        //   addedProdCodeModel.items.forEach(async (item, index) => {
        //     const aExcelInputs = [
        //       {
        //         value: item.Model,
        //         regex: null,
        //         message: "Enter SAP product number",
        //       },
        //       {
        //         value: item.Description,
        //         regex: null,
        //         message: "Enter description",
        //       },
        //       { value: item.Mcategory, regex: null, message: "Enter category" },
        //       {
        //         value: item.Length,
        //         regex: /^\d+(\.\d+)?$/,
        //         message: "Length should be numeric",
        //       },
        //       {
        //         value: item.Width,
        //         regex: /^\d+(\.\d+)?$/,
        //         message: "Width should be numeric",
        //       },
        //       {
        //         value: item.Height,
        //         regex: /^\d+(\.\d+)?$/,
        //         message: "Height should be numeric",
        //       },
        //       {
        //         value: item.Grossweight,
        //         regex: /^\d+(\.\d+)?$/,
        //         message: "Gross Weight should be numeric",
        //       },
        //       {
        //         value: item.Netweight,
        //         regex: /^\d+(\.\d+)?$/,
        //         message: "Net Weight should be numeric",
        //       },
        //     ];
        //     // Validate each input field
        //     for (let input of aExcelInputs) {
        //       let aValidations = this.validateField(
        //         oView,
        //         null,
        //         input.value,
        //         input.regex,
        //         input.message
        //       );
        //       if (aValidations.length > 0) {
        //         raisedErrors.push({ index: index, errorMsg: aValidations[0] });
        //       }
        //     }
        //   });
        //   // If there are any validation errors, show them to the user and exit
        //   if (raisedErrors.length > 0) {
        //     for (let error of raisedErrors) {
        //       MessageBox.information(
        //         `Check record number ${error.index + 1} ${error.errorMsg}`
        //       );
        //       return;
        //     }
        //   }

        //   try {
        //     let entityExistsFlag = false;
        //     let batchErrorOccurred = false;

        //     for (const [index, item] of addedProdCodeModel.items.entries()) {
        //       const propertiesToDelete = [
        //         "serialNumber",
        //         "muom",
        //         "uom",
        //         "wuom",
        //         "EAN",
        //       ];
        //       propertiesToDelete.forEach((property) => delete item[property]);

        //       item.Length = String(item.Length).trim();
        //       item.Width = String(item.Width).trim();
        //       item.Height = String(item.Height).trim();
        //       item.Netweight = String(item.Netweight).trim();
        //       item.Grossweight = String(item.Grossweight).trim();
        //       item.Stack = String(item.Stack).trim();
        //       item.Volume = String(
        //         parseFloat(item.Length * item.Width * item.Height).toFixed(3)
        //       );
        //       item.Quantity=String(item.Quantity).trim();

        //       if (Number(item.Grossweight) < Number(item.Netweight)) {
        //         MessageBox.warning(
        //           "Gross weight should be greater than or equal to net weight!"
        //         );
        //         return;
        //       }
        //       //Create a batch request for each item
        //       oDataModel.create("/CM_MATERIALSet", item, {
        //         method: "POST",
        //         groupId: batchGroupId,
        //         success: function (data, response) {
        //           console.log("Material created successfully:", data);
        //           that.byId("idModelsTable").getBinding("items").refresh();
        //         },
        //         error: function (err) {
        //           console.error("Error creating material:", err);
        //           if (
        //             JSON.parse(
        //               err.responseText
        //             ).error.message.value.toLowerCase() ===
        //             "entity already exists"
        //           ) {
        //             if (!entityExistsFlag) {
        //               MessageBox.error(
        //                 `You are trying to upload a material which already exists`
        //               );
        //               entityExistsFlag = true; // Set the flag to prevent showing the message again
        //             }
        //           } else {
        //             batchErrorOccurred = true;
        //           }
        //           that.byId("idModelsTable").getBinding("items").refresh();
        //         },
        //       });
        //     }
        //     //Submit the batch request
        //     await oDataModel.submitChanges({
        //       batchGroupId: batchGroupId,
        //       success: function (oData, response) {
        //         console.log("Batch request submitted successfully", oData);

        //         //  Refresh Model
        //         oDataModel.refresh(true);

        //         //Refresh the table binding explicitly
        //         that.byId("idModelsTable").getBinding("items").refresh();

        //         //MessageBox.success("Materials created successfully");

        //         // Close dialog if it exists
        //         if (that.oFragment) {
        //           that.getView().getModel("MaterialModel").setData("");
        //           that.oFragment.close();
        //         }
        //       },
        //       error: function (err) {
        //         if (batchErrorOccurred) {
        //           MessageBox.error(
        //             "Please check the uploaded file and upload correct data"
        //           );
        //         }
        //         console.error("Error in batch request:", err);
        //         that.byId("idModelsTable").getBinding("items").refresh();
        //       },
        //     });
        //   } catch (error) {
        //     console.log(error);
        //     MessageToast.show("Facing technical issue");
        //     that.byId("idModelsTable").getBinding("items").refresh();
        //   }
        // },
        onBatchSave: async function () {
          var that = this;
          var addedProdCodeModel = this.getView()
            .getModel("MaterialModel")
            .getData();
          var oDataModel = this.getView().getModel();
          const oView = this.getView();

          // Validation phase
          let raisedErrors = [];
          addedProdCodeModel.items.forEach((item, index) => {
            const aExcelInputs = [
              {
                value: item.Model,
                regex: null,
                message: "Enter SAP product number",
              },
              {
                value: item.Description,
                regex: null,
                message: "Enter description",
              },
              { value: item.Mcategory, regex: null, message: "Enter category" },
              {
                value: item.Length,
                regex: /^\d+(\.\d+)?$/,
                message: "Length should be numeric",
              },
              {
                value: item.Width,
                regex: /^\d+(\.\d+)?$/,
                message: "Width should be numeric",
              },
              {
                value: item.Height,
                regex: /^\d+(\.\d+)?$/,
                message: "Height should be numeric",
              },
              {
                value: item.Grossweight,
                regex: /^\d+(\.\d+)?$/,
                message: "Gross Weight should be numeric",
              },
              {
                value: item.Netweight,
                regex: /^\d+(\.\d+)?$/,
                message: "Net Weight should be numeric",
              },
            ];

            for (let input of aExcelInputs) {
              let aValidations = this.validateField(
                oView,
                null,
                input.value,
                input.regex,
                input.message
              );
              if (aValidations.length > 0) {
                raisedErrors.push({
                  index: index + 1,
                  errorMsg: aValidations[0],
                });
              }
            }

            // Validate weight relationship
            if (Number(item.Grossweight) < Number(item.Netweight)) {
              raisedErrors.push({
                index: index + 1,
                errorMsg:
                  "Gross weight should be greater than or equal to net weight!",
              });
            }
          });

          if (raisedErrors.length > 0) {
            let errorMessage = raisedErrors
              .map((e) => `Row ${e.index}: ${e.errorMsg}`)
              .join("\n");
            MessageBox.error("Validation errors found:\n\n" + errorMessage);
            return;
          }

          // Processing phase
          try {
            let successCount = 0;
            let errorCount = 0;
            let duplicateExists = false;
            let errorMessages = [];

            // Process items sequentially to avoid the batch limitation
            for (const [index, item] of addedProdCodeModel.items.entries()) {
              try {
                // Clean up item data
                const propertiesToDelete = [
                  "serialNumber",
                  "muom",
                  "uom",
                  "wuom",
                  "EAN",
                ];
                propertiesToDelete.forEach((property) => delete item[property]);

                item.Length = String(item.Length).trim();
                item.Width = String(item.Width).trim();
                item.Height = String(item.Height).trim();
                item.Netweight = String(item.Netweight).trim();
                item.Grossweight = String(item.Grossweight).trim();
                item.Stack = String(item.Stack).trim();
                item.Volume = String(
                  (
                    parseFloat(item.Length) *
                    parseFloat(item.Width) *
                    parseFloat(item.Height)
                  ).toFixed(3)
                );
                item.Quantity = String(item.Quantity).trim();

                // Create material one by one
                await new Promise((resolve) => {
                  oDataModel.create("/CM_MATERIALSet", item, {
                    success: function (data) {
                      successCount++;
                      console.log(
                        `Material ${item.Model} created successfully`
                      );
                      resolve();
                    },
                    error: function (err) {
                      errorCount++;
                      let errorMsg = `Row ${
                        index + 1
                      }: Failed to create material`;

                      if (err.responseText) {
                        try {
                          const errorObj = JSON.parse(err.responseText).error;
                          if (
                            errorObj.message.value
                              .toLowerCase()
                              .includes("entity already exists")
                          ) {
                            errorMsg = `Row ${index + 1}: Material ${
                              item.Model
                            } already exists`;
                            duplicateExists = true;
                          } else {
                            errorMsg = `Row ${index + 1}: ${
                              errorObj.message.value
                            }`;
                          }
                        } catch (e) {
                          console.error("Error parsing error response", e);
                        }
                      }

                      errorMessages.push(errorMsg);
                      console.error(errorMsg, err);
                      resolve(); // Continue with next item
                    },
                  });
                });
              } catch (e) {
                errorCount++;
                errorMessages.push(
                  `Row ${index + 1}: Unexpected error - ${e.message}`
                );
                console.error(`Error processing row ${index + 1}`, e);
              }
            }

            // Refresh UI
            that.byId("idModelsTable").getBinding("items").refresh();
            oDataModel.refresh(true);

            // Show summary
            let summaryMessage =
              `Processed ${addedProdCodeModel.items.length} items:\n` +
              `- Success: ${successCount}\n` +
              `- Failed: ${errorCount}`;

            if (errorMessages.length > 0) {
              summaryMessage += "\n\nErrors:\n" + errorMessages.join("\n");
            }

            if (errorCount === 0) {
              MessageBox.success(summaryMessage);
            } else if (duplicateExists && errorCount === 1) {
              MessageBox.warning(summaryMessage);
            } else {
              MessageBox.error(summaryMessage);
            }

            // Close dialog if exists
            if (that.oFragment) {
              that.getView().getModel("MaterialModel").setData("");
              that.oFragment.close();
            }
          } catch (error) {
            console.error("Unexpected error in onBatchSave", error);
            MessageBox.error(
              "A technical error occurred while processing your request"
            );
            that.byId("idModelsTable").getBinding("items").refresh();
          }
        },
        //close Models upload Fragment
        onClosePressXlData: function () {
          if (this.oFragment.isOpen()) {
            this.oFragment.close();
          }
        },
        //completed material batch

        // clear functionality for Add Product

        onClearProduct: function () {
          this.getView().byId("idInputForModelNum").setValue();
          this.getView().byId("idInputForModelDesc").setValue();
          // this.getView().byId("idForSelectModelLWHUOM").setValue("");
          this.getView().byId("idInputForModelLeng").setValue();
          this.getView().byId("idInputForModelWidth").setValue();
          this.getView().byId("idInputForModelHeight").setValue();
          // this.getView().byId("idForSelectModelLWHUOM").setValue("Select");
          this.getView().byId("idInputForModelNetWeight").setValue();
          this.getView().byId("idInputForModelGrossWeight").setValue();
          this.getView().byId("idSelectModelWeightUOM").setValue("Select");
          this.getView().byId("idInputForModelStack").setValue();
        },
        /***After Completed Simulation */
        async onFinishSimulation(oEvent) {
          var oModel = this.getOwnerComponent().getModel();
          let oView = this.getView();
          let oSimulationTable = oView.byId("idSimulationtable");
          let oSimulationKeyText = oView.byId("idCurrentSimName").getText();
          let parts = oSimulationKeyText.split(":"),
            oSimulationKey = parts[1] ? parts[1].trim() : "";
          let oTable = oView.byId("idProductTable");
          let aTableItems = oTable.getItems();
          let oComboBox = oView.byId("id_combobox_for_truckType");
          let oKey = oComboBox.getSelectedKey();
          if (oKey === "" || oSimulationKey === "" || aTableItems.length < 1) {
            return MessageBox.warning(
              "Simulation is not completed Please check products or Truck Details "
            );
          }
          // let oRouter = this.getOwnerComponent().getRouter();
          // let str = oRouter.oHashChanger.hash;
          // const value = str.split("/").pop();
          // console.log(value);
          // let oUserID = this.ID ? this.ID : value;
          // if (typeof oUserID !== "string") {
          //   oUserID = String(oUserID);
          // }
          // let sEntityPath = "/Users";
          // let oModel = oView.getModel();
          // let aUserID = new Filter("userID", FilterOperator.EQ, oUserID);
          // const oReadUserData = await this.readData(
          //   oModel,
          //   sEntityPath,
          //   aUserID
          // );
          // if (!oReadUserData) {
          //   return MessageBox.error("Error");
          // }
          // let oResult = oReadUserData.results[0];
          // let oUserName = `${oResult.fName} ${oResult.lName}`;
          // console.log("UserData", oReadUserData);
          let oRequiredTruck = oView
            .getModel("CombinedModel")
            .getProperty("/RequiredTruck");
          let oCount = oRequiredTruck.requiredTrucks;
          let sPath = `/CM_SIMULATED_RECORDSSet('${oSimulationKey}')`;
          const oPayload = {
            // modifiedBy: oUserName,
            Status: "Completed",
            // containerCount: oCount,
            Trucktype: oKey,
          };
          try {
            await this.updateData(oModel, oPayload, sPath);
            oSimulationTable.getBinding("items").refresh();
            MessageToast.show(`Status for ${oSimulationKey} is Changed`);
            oView.getModel("HistoryModel")?.refresh();
            // this.getView().byId("idBarChart").getModel("HistoryModel").refresh(true);
          } catch (error) {
            console.log(error);
            oSimulationTable.getBinding("items").refresh();
            MessageBox.error("Error Ocuurs");
          }
        },

        onPressBarChart: async function () {
          if (!this.oDataAnalysisFragment) {
            this.oDataAnalysisFragment = await this.loadFragment(
              "DataAnalysis"
            );
          }
          var oModel = this.getOwnerComponent().getModel();
          var that = this;
          oModel.read("/SimulatedRecords", {
            success: function (oData) {
              that.aItems = oData.results;
              that._setHistoryModel("day");
            },
            error: function (oError) {
              console.error(oError);
            },
          });
          that.oDataAnalysisFragment.open();
        },

        onCloseDataAnalysisDialog: function () {
          this.oDataAnalysisFragment.close();
        },

        _setHistoryModel: function (timePeriod) {
          var that = this;
          // Process history data based on the selected time period
          var oProcessedData = that._processHistoryData(
            that.aItems,
            timePeriod
          );
          var oHistoryModel = new sap.ui.model.json.JSONModel();
          oHistoryModel.setData(oProcessedData);
          that.getView().setModel(oHistoryModel, "HistoryModel");
          that
            .getView()
            .byId("idBarChart")
            .getModel("HistoryModel")
            .refresh(true);
          that.timePeriod = timePeriod;
        },
        formatDate: function (date) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        },
        _processHistoryData: function (aItems, timePeriod) {
          var oData = {};
          var today = new Date();
          var todayString = today.toISOString().split("T")[0]; // Get today's
          var currentMonth = today.getMonth(); // Current month (0-11)
          var currentYear = today.getFullYear(); // Current year

          let that = this;
          function printWeeksForCurrentMonth(date, currentMonth, currentYear) {
            let weeksArray = [],
              oFormateddate = that.formatDate(date);
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth() + 1; // Month is 0-indexed

            const weeks = that.getWeeksOfMonth(year, month);
            weeks.forEach((week, index) => {
              let daysArray = [];
              week.forEach((day) => {
                daysArray.push(that.formatDate(day));
              });
              weeksArray.push(daysArray);
            });
            for (let i = 0; i < weeksArray.length; i++) {
              if (weeksArray[i].includes(oFormateddate)) {
                return i + 1;
              }
            }
          }

          aItems.forEach(function (item) {
            var createdAt = new Date(item.createdAt);
            var dateKey;

            // Determine the key based on the selected time period
            switch (timePeriod) {
              case "day":
                // Only process records for today
                if (createdAt.toISOString().split("T")[0] !== todayString) {
                  return; // Skip records not from today
                }
                dateKey = todayString; // Use today's date as key
                break;
              case "month":
                // Only process records for the current month and year
                if (
                  createdAt.getMonth() !== currentMonth ||
                  createdAt.getFullYear() !== currentYear
                ) {
                  return; // Skip records not from this month
                }
                var weekNumber = printWeeksForCurrentMonth(
                  createdAt,
                  currentMonth,
                  currentYear
                );
                dateKey = `Week ${weekNumber}`; // Use "Week X" as key
                break;
              case "quarterly":
                // Only process records for the last three months of the current year
                if (
                  createdAt.getFullYear() !== currentYear ||
                  createdAt.getMonth() < currentMonth - 2
                ) {
                  return; // Skip records not from the last three months of this year
                }
                // Calculate the quarter
                const month = createdAt.getMonth();
                const quarter = Math.floor(month / 3) + 1; // Quarters: 1 (Jan-Mar), 2 (Apr-Jun), 3 (Jul-Sep), 4 (Oct-Dec)

                dateKey = `${createdAt.getFullYear()}-Q${quarter}`; // Format as YYYY-QX
                break;
              case "year":
                // Only process records for the current year
                if (createdAt.getFullYear() !== currentYear) {
                  return; // Skip records not from this year
                }

                // Format dateKey to show the month
                const monthKey = createdAt.getMonth() + 1; // Get month (0-11) and convert to (1-12)
                dateKey = `${createdAt.getFullYear()}-${
                  monthKey < 10 ? "0" : ""
                }${monthKey}`; // Format as YYYY-MM
                break;
              case "all":
                dateKey = createdAt.getFullYear(); // YYYY
                break;
              default:
                return;
            }

            if (!oData[dateKey]) {
              oData[dateKey] = {
                date: dateKey,
                CompletedCount: 0,
                PendingCount: 0,
              };
            }

            if (item.status === "Completed") {
              oData[dateKey].CompletedCount += 1;
            } else if (item.status === "Pending") {
              oData[dateKey].PendingCount += 1;
            }
          });
          return {
            Items: Object.values(oData),
          };
        },

        onSelectTimePeriod: function (oEvent) {
          var selectedButton = oEvent.getSource();
          var timePeriod = selectedButton.getText().toLowerCase(); // Get text from button (Daily, Monthly, etc.)

          this._setHistoryModel(timePeriod); // Pass selected time period to set model
        },

        onMenuAction: function (oEvent) {
          var oVizFrame = this.getView().byId("idBarChart");

          if (!oVizFrame) {
            console.error("Chart not found!");
            return;
          }

          // Get selected menu item
          var oSelectedItem = oEvent.getParameter("item");
          if (!oSelectedItem) {
            console.error("No menu item selected");
            return;
          }

          // Get chart type from the menu item key
          var sSelectedKey = oSelectedItem.getKey();

          // Apply the selected chart type immediately
          oVizFrame.setVizType(sSelectedKey);

          // Ensure both Completed and Pending measures are displayed
          var aFeeds = oVizFrame.getFeeds();
          if (aFeeds.length > 0) {
            oVizFrame.removeAllFeeds(); // Remove existing feeds to refresh
          }

          // Assuming you already have totalVolume calculated elsewhere
          var totalVolume = 0;
          var chartData = [];

          // Loop through your data to calculate percentage
          data.forEach(function (item) {
            totalVolume += parseFloat(item.Volume);
          });

          // Add percentage to each item in chartData
          chartData.forEach(function (item) {
            item.Percentage = (
              (parseFloat(item.Volume) / totalVolume) *
              100
            ).toFixed(1);
          });

          // Now update the model with the new chartData
          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData({ chartData: chartData });
          this.getView().setModel(oModel, "ChartData");

          // Add the required feeds
          oVizFrame.addFeed(
            new sap.viz.ui5.controls.common.feeds.FeedItem({
              uid: "valueAxis",
              type: "Measure",
              values: ["Volume"],
            })
          );

          oVizFrame.addFeed(
            new sap.viz.ui5.controls.common.feeds.FeedItem({
              uid: "categoryAxis",
              type: "Dimension",
              values: ["Name", "Packages"],
            })
          );

          // Force chart to refresh
          oVizFrame.getModel("HistoryModel").refresh(true);
        },
        onSelectData: function (oEvent) {
          var aData = oEvent.getParameter("data");
          var oSelectedData = aData[0].data;
          var sStatus = oSelectedData.measureNames; // The selected Status (e.g., "Completed", "Pending")
          var that = this;

          // Define current date information here
          var today = new Date();

          var oFilterStatus = new sap.ui.model.Filter(
            "status",
            sap.ui.model.FilterOperator.EQ,
            sStatus
          );
          this.getView().byId("idrefreshbutton").setVisible(true);

          function printWeeksForCurrentMonth(weekNumber) {
            const oArray = [];
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth() + 1; // Month is 0-indexed

            const weeks = that.getWeeksOfMonth(year, month);
            weeks.forEach((week, index) => {
              if (index + 1 === weekNumber) {
                if (week.length === 1) {
                  oArray.push(new Date(week[0].setHours(0, 0, 0, 0))); // Add the Date object, not formatted string
                  oArray.push(new Date(week[0].setHours(23, 59, 59, 999))); // Add the Date object
                } else {
                  week.forEach((day, index) => {
                    if (index === 0) {
                      oArray.push(new Date(day.setHours(0, 0, 0, 0))); // First day of the week
                    } else if (week.length - 1 === index) {
                      oArray.push(new Date(day.setHours(23, 59, 59, 999))); // Last day of the week
                    }
                  });
                }
              }
            });
            return oArray;
          }

          function getQuarterDateRange(quarter) {
            var startDate, endDate;

            // Extract the year and quarter from the input (e.g., "2025-Q1")
            var [year, qtr] = quarter.split("-");
            year = parseInt(year, 10); // Convert year to integer
            var quarterNumber = parseInt(qtr.split("Q")[1], 10); // Extract the quarter number (e.g., Q1, Q2, Q3, Q4)

            switch (quarterNumber) {
              case 1: // Q1
                startDate = new Date(year, 0, 1); // January 1st
                endDate = new Date(year, 2, 31); // March 31st
                break;
              case 2: // Q2
                startDate = new Date(year, 3, 1); // April 1st
                endDate = new Date(year, 5, 30); // June 30th
                break;
              case 3: // Q3
                startDate = new Date(year, 6, 1); // July 1st
                endDate = new Date(year, 8, 30); // September 30th
                break;
              case 4: // Q4
                startDate = new Date(year, 9, 1); // October 1st
                endDate = new Date(year, 11, 31); // December 31st
                break;
              default:
                throw new Error("Invalid quarter");
            }

            // Convert dates to ISO string format
            return {
              start: convertToISOStrig(startDate),
              end: convertToISOStrig(endDate),
            };
          }

          // Function to get the start and end dates of a specific month
          function getMonthDateRange(year, month) {
            // Set the start date as the 1st day of the month in UTC
            var startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)); // Month is 0-based, so subtract 1
            // Set the end date as the last day of the month in UTC
            var endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)); // The last moment of the month

            // Convert dates to ISO string format
            return {
              start: convertToISOStrig(startDate),
              end: convertToISOStrig(endDate),
            };
          }

          // Function to get the start and end dates of a specific year
          function getYearDateRange(year) {
            // Set the start date as January 1st of the selected year
            var startDate = new Date(year, 0, 1); // January 1st of the selected year
            // Set the end date as December 31st of the selected year
            var endDate = new Date(year, 11, 31); // December 31st of the selected year

            // Convert dates to ISO string format
            return {
              start: convertToISOStrig(startDate),
              end: convertToISOStrig(endDate),
            };
          }
          // Convert date to ISO string format
          function convertToISOStrig(date) {
            return date.toISOString();
          }

          var oFilterDateRange; // Declare oFilterDateRange to apply filter logic in switch cases

          switch (that.timePeriod) {
            case "day":
              var startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Today's date at 00:00:00
              var endOfDay = new Date(today.setHours(23, 59, 59, 999)); // Today's date at 23:59:59
              var startDateString = convertToISOStrig(startOfDay);
              var endDateString = convertToISOStrig(endOfDay);

              oFilterDateRange = new sap.ui.model.Filter({
                filters: [
                  new sap.ui.model.Filter(
                    "createdAt",
                    sap.ui.model.FilterOperator.BT,
                    startDateString,
                    endDateString
                  ),
                ],
                and: true, // Combine the filters with "AND"
              });
              this.onCloseDataAnalysisDialog();
              break;
            case "month":
              var weekNumber = parseInt(oSelectedData.Date.split(" ")[1]); // Assuming format is "Week 1", "Week 2", etc.
              let combinedDates = printWeeksForCurrentMonth(weekNumber);

              if (Array.isArray(combinedDates) && combinedDates.length === 2) {
                const startDateofWeek = convertToISOStrig(combinedDates[0]);
                const endDateofWeek = convertToISOStrig(combinedDates[1]);
                // Create filter for the selected week in the "createdAt" field
                oFilterDateRange = new sap.ui.model.Filter({
                  filters: [
                    new sap.ui.model.Filter(
                      "createdAt",
                      sap.ui.model.FilterOperator.BT,
                      startDateofWeek,
                      endDateofWeek
                    ),
                  ],
                  and: true, // Combine the filters with "AND"
                });
              } else {
                console.error(
                  "combinedDates is not a valid array with two Date objects."
                );
              }

              this.onCloseDataAnalysisDialog();
              break;
            case "quarterly":
              // Extract the quarter info from the selected data (e.g., "2025-Q1", "2025-Q2")
              var quarter = oSelectedData.Date; // This will be in the format "2025-Q1", "2025-Q2", etc.

              // Get the start and end dates for the selected quarter
              var quarterDateRange = getQuarterDateRange(quarter);

              // Create filter for the selected quarter
              oFilterDateRange = new sap.ui.model.Filter({
                filters: [
                  new sap.ui.model.Filter(
                    "createdAt",
                    sap.ui.model.FilterOperator.BT,
                    quarterDateRange.start,
                    quarterDateRange.end
                  ),
                ],
                and: true, // Combine the filters with "AND"
              });
              this.onCloseDataAnalysisDialog();
              break;

            case "year":
              // Extract the year and month info from the selected data (e.g., "2025-01", "2025-02")
              var yearMonth = oSelectedData.Date; // This will be in the format "2025-01", "2025-02", etc.

              // Extract year and month from the selected yearMonth value
              var [year, month] = yearMonth.split("-");
              year = parseInt(year, 10); // Convert to integer
              month = parseInt(month, 10); // Convert to integer

              // Get the start and end dates for the selected month
              var monthDateRange = getMonthDateRange(year, month);

              // Create filter for the selected month
              oFilterDateRange = new sap.ui.model.Filter({
                filters: [
                  new sap.ui.model.Filter(
                    "createdAt",
                    sap.ui.model.FilterOperator.BT,
                    monthDateRange.start,
                    monthDateRange.end
                  ),
                ],
                and: true, // Combine the filters with "AND"
              });
              this.onCloseDataAnalysisDialog();
              break;
            case "all":
              // Extract the year info from the selected data (e.g., "2025", "2024")
              var year = oSelectedData.Date; // This will be in the format "2025", "2024", etc.

              // Convert the year to an integer
              year = parseInt(year, 10);

              // Get the start and end dates for the selected year
              var yearDateRange = getYearDateRange(year);

              // Create filter for the selected year
              oFilterDateRange = new sap.ui.model.Filter({
                filters: [
                  new sap.ui.model.Filter(
                    "createdAt",
                    sap.ui.model.FilterOperator.BT,
                    yearDateRange.start,
                    yearDateRange.end
                  ),
                ],
                and: true, // Combine the filters with "AND"
              });
              this.onCloseDataAnalysisDialog();
              break;

            default:
              return; // No valid time period, exit
          }

          // Combine the status filter and the date range filter
          var aFilters = [oFilterStatus, oFilterDateRange];

          // Apply the filters to the table
          var oTable = this.byId("idSimulationtable");

          // Get the binding of the table's items aggregation
          var oBinding = oTable.getBinding("items");

          // Apply the filter to the binding
          oBinding.filter(aFilters);
        },

        getWeeksOfMonth: function (year, month) {
          const weeks = [];
          const firstDayOfMonth = new Date(year, month - 1, 1); // Month is 0-indexed in JS
          const lastDayOfMonth = new Date(year, month, 0); // Last day of the month
          const startDay = firstDayOfMonth.getDay(); // 0 (Sunday) to 6 (Saturday)

          let currentWeek = [];
          let currentDate = new Date(firstDayOfMonth);

          // Handle the first week
          if (startDay === 6) {
            // If the month starts on a Saturday
            currentWeek.push(new Date(currentDate)); // Add Saturday as the first week
            weeks.push(currentWeek);
            currentWeek = [];
            currentDate.setDate(currentDate.getDate() + 1); // Move to Sunday
          } else {
            // If the month starts between Sunday and Friday
            while (currentDate.getDay() !== 6) {
              // Until Saturday
              currentWeek.push(new Date(currentDate));
              currentDate.setDate(currentDate.getDate() + 1);
            }
            currentWeek.push(new Date(currentDate)); // Add Saturday
            weeks.push(currentWeek);
            currentWeek = [];
            currentDate.setDate(currentDate.getDate() + 1); // Move to Sunday
          }

          // Handle the remaining weeks
          while (currentDate <= lastDayOfMonth) {
            currentWeek.push(new Date(currentDate));
            if (currentDate.getDay() === 6) {
              // If it's Saturday, end the week
              weeks.push(currentWeek);
              currentWeek = [];
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }

          // Handle the last week if it's not complete
          if (currentWeek.length > 0) {
            weeks.push(currentWeek);
          }

          return weeks;
        },

        onPressRefresh: function () {
          // Get the Smart Table by its ID
          var oSmartTable = this.byId("idSimulationSmartTable");

          // Get the table inside the SmartTable
          var oTable = oSmartTable.getTable();

          // Get the binding for the table's items aggregation
          var oBinding = oTable.getBinding("items");

          // Clear any existing filters to fetch all the data
          oBinding.filter([]);

          // Refresh the binding to fetch all data
          oBinding.refresh();
          this.getView().byId("idrefreshbutton").setVisible(false);
        },

        /**Open Container Edit */
        onOpenContainerEdit: async function () {
          if (!this.oEditContainer) {
            this.oEditContainer = await this.loadFragment(
              "EditContainerDetails"
            );
          }
          this.oEditContainer.open();
        },
        /**closing Editing Container */
        onCancelEditContainer: function () {
          if (this.oEditContainer.isOpen()) {
            this.oEditContainer.close();

            let sContainerHeightInput = this.getView().byId(
              "idContainerHeight_Input"
            );
            let sContainerCapacityInput = this.getView().byId(
              "idContainerCapacity_Input"
            );
            let sContainerWidthInput = this.getView().byId(
              "idContainerWidth_Input"
            );
            let sContainerLenghtInput = this.getView().byId(
              "IdContainerLength_Input"
            );
            sContainerLenghtInput.setValueState(sap.ui.core.ValueState.None);
            sContainerWidthInput.setValueState(sap.ui.core.ValueState.None);
            sContainerCapacityInput.setValueState(sap.ui.core.ValueState.None);
            sContainerHeightInput.setValueState(sap.ui.core.ValueState.None);

            // Clear the Vehicle property from the CombinedModel
            this.getView()
              .getModel("CombinedModel")
              .setProperty("/Vehicle", {});

            // Optionally, you can trigger a rebind of the view or model to refresh it
            this.getView().getModel("CombinedModel").refresh(true);

            // Clear any previous validation error states on the input fields
            this.clearValidationStates();

            // If the UI relies on the same data model for display, you can also trigger a refresh of the UI element
            var oFragmentView = this.oEditContainer.getContent()[0];
            var oList = oFragmentView.byId("idEditContainerDssialog");
            if (oList) {
              oList.getBinding("items").refresh();
            }
          }
        },

        /**Opening Container Batch Fragment */
        onOpenContainerBranch: async function () {
          // Open the fragment and import data if a file is selected
          if (!this.oFragmentContainer) {
            this.oFragmentContainer = await this.loadFragment(
              "ContainerXlData"
            );
          }
          this.oFragmentContainer.open();
        },

        getDecimalPlaces: function (num) {
          var str = num.toString();
          var decimalIndex = str.indexOf(".");
          return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
        },

        // Helper function to round the number to a specific number of decimals
        roundToDecimals: function (num, decimals) {
          var factor = Math.pow(10, decimals);
          return Math.round(num * factor) / factor;
        },

        roundOfValue: function (oValue) {
          var fValue = parseFloat(oValue);
          if (!isNaN(fValue)) {
            if (this.getDecimalPlaces(fValue) > 3) {
              fValue = this.roundToDecimals(fValue, 3);
            }
            return fValue.toString();
          }
        },

        _init3DScene: function () {
          // If the scene and renderer exist, clear them
          if (this.scene) {
            while (this.scene.children.length > 0) {
              this.scene.remove(this.scene.children[0]);
            }
          } else {
            // this.scene = new THREE.Scene();
            // this.scene.background = new THREE.Color(0xFFFFFF); // Orange background
            this.scene = new THREE.Scene();
            this.scene.background = null; // Transparent background

            // When setting up the renderer, make sure alpha is set to true
            this.renderer = new THREE.WebGLRenderer({ alpha: true });
          }

          // If the renderer exists, dispose of its DOM element
          if (this.renderer) {
            this.renderer.domElement.remove();
            this.renderer.dispose();
          }

          // Set up the renderer and append it to the canvas container
          this.renderer = new THREE.WebGLRenderer({ alpha: true });
          const canvasContainer = document.getElementById("threejsCanvas");
          if (!canvasContainer) {
            console.error("Canvas container not found");
            return;
          }
          this.renderer.setSize(window.innerWidth / 2, window.innerHeight); // Increase canvas size
          this.renderer.outputEncoding = THREE.sRGBEncoding;
          this.renderer.shadowMap.enabled = true;
          canvasContainer.appendChild(this.renderer.domElement);

          // Set up the camera with increased initial zoom
          this.camera = new THREE.PerspectiveCamera(25, 500 / 500, 0.1, 1000); // Reduced FOV to make objects appear larger
          this.camera.position.set(10, 10, 20); // Position closer to the scene for larger appearance
          // Set up orbit controls
          this.controls = new THREE.OrbitControls(
            this.camera,
            this.renderer.domElement
          );
          this.controls.enableDamping = true;

          // Add lighting
          this._addLighting();

          // Start the animation loop
          this._animate();
        },

        _createContainer: function (height, length, width) {
          // Remove any existing container, border, and grids
          if (this.container) {
            this.scene.remove(this.container);
            this.container.geometry.dispose();
            this.container.material.dispose();
          }
          if (this.containerBorder) {
            this.scene.remove(this.containerBorder);
            this.containerBorder.geometry.dispose();
            this.containerBorder.material.dispose();
          }
          if (this.containerGrids) {
            this.containerGrids.forEach((grid) => {
              this.scene.remove(grid);
              grid.geometry.dispose();
              grid.material.dispose();
            });
          }

          // Create geometry for the container
          const geometry = new THREE.BoxGeometry(length, height, width);

          // Create a material with transparency and metallic properties
          const material = new THREE.MeshPhysicalMaterial({
            color: 0x000000, // Invisible color
            opacity: 0,
            transparent: true,
            side: THREE.DoubleSide,
          });

          // Create the container mesh
          this.container = new THREE.Mesh(geometry, material);
          this.container.castShadow = true;
          this.container.receiveShadow = true;

          // Position the container at the origin
          this.container.position.set(0, height / 2, 0);

          // Add the container to the scene
          this.scene.add(this.container);

          // Add thick borders around the container using EdgesGeometry
          const edgesGeometry = new THREE.EdgesGeometry(geometry); // Get the edges of the box
          const edgesMaterial = new THREE.LineBasicMaterial({
            color: 0x000000, // Black color for the border
            linewidth: 20, // Adjust the thickness (Three.js doesn't directly support linewidth in WebGL)
          });

          // Create border lines and position them at the container's location
          this.containerBorder = new THREE.LineSegments(
            edgesGeometry,
            edgesMaterial
          );
          this.containerBorder.position.copy(this.container.position);

          // Add the border to the scene
          this.scene.add(this.containerBorder);

          // Create grids dynamically based on container position
          this.containerGrids = [];
          const gridMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
          const containerPosition = this.container.position.clone(); // Get container position

          // Define grid line offsets for each face
          const planes = [
            {
              offset: new THREE.Vector3(0, 0, width / 2), // Front face
              size: [length, height],
            },
            {
              offset: new THREE.Vector3(0, 0, -width / 2), // Back face
              size: [length, height],
            },
            {
              offset: new THREE.Vector3(length / 2, 0, 0), // Right face
              size: [width, height],
              rotation: { axis: "y", angle: -Math.PI / 2 },
            },
            {
              offset: new THREE.Vector3(-length / 2, 0, 0), // Left face
              size: [width, height],
              rotation: { axis: "y", angle: Math.PI / 2 },
            },
            {
              offset: new THREE.Vector3(0, height / 2, 0), // Top face
              size: [length, width],
              rotation: { axis: "x", angle: -Math.PI / 2 },
            },
            {
              offset: new THREE.Vector3(0, -height / 2, 0), // Bottom face
              size: [length, width],
              rotation: { axis: "x", angle: Math.PI / 2 },
            },
          ];

          planes.forEach((plane) => {
            const [planeLength, planeHeight] = plane.size;

            const gridGeometry = new THREE.BufferGeometry();
            const vertices = [];

            // Add 3 vertical lines (evenly spaced)
            const verticalSpacing = planeLength / 10; // (4 divisions give us 3 lines)
            for (let i = 0; i < 10; i++) {
              const x = -planeLength / 2 + i * verticalSpacing;
              vertices.push(x, -planeHeight / 2, 0);
              vertices.push(x, planeHeight / 2, 0);
            }

            // Add 3 horizontal lines (evenly spaced)
            const horizontalSpacing = planeHeight / 10; // (4 divisions give us 3 lines)
            for (let i = 0; i < 10; i++) {
              const y = -planeHeight / 2 + i * horizontalSpacing;
              vertices.push(-planeLength / 2, y, 0);
              vertices.push(planeLength / 2, y, 0);
            }

            gridGeometry.setAttribute(
              "position",
              new THREE.BufferAttribute(new Float32Array(vertices), 3)
            );

            const grid = new THREE.LineSegments(gridGeometry, gridMaterial);

            // Apply rotations if necessary
            if (plane.rotation) {
              grid.rotation[plane.rotation.axis] = plane.rotation.angle;
            }

            // Position the grid relative to the container
            const gridPosition = containerPosition.clone().add(plane.offset);
            grid.position.copy(gridPosition);

            this.containerGrids.push(grid);
            this.scene.add(grid);
          });

          console.log("Container created with dimensions:", {
            height,
            length,
            width,
          });

          // this.byId("_IDGenText2").setVisible(true);

          const oTabledata = this.byId("idProductTable").getItems();

          oTabledata.forEach((Item) => {
            let oRowData = Item.getBindingContext().getObject();
            let model = oRowData.Productno_model;
            let quantity = oRowData.SelectedQuantity;
            let color = oRowData.Color;
          });

          // Get selected products from the table
          // const oTable = this.getView().byId("idAddProductsTableIn_simulate");
          // const aSelectedItems = oTable.getSelectedItems();
          // const aSelectedData = aSelectedItems.map(item => item.getBindingContext().getObject());

          // console.log("Selected Items Data as Objects:", aSelectedData);

          // Call the _createProducts method to add products to the container

          // var height = height - 0.01,
          //   width = width - 0.05,
          //   length = length - 0.05;

          /**code added */

          //  this._createProducts( aSlectedObject, height, length, width);
        },
        _addLighting: function () {
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
          this.scene.add(ambientLight);

          const lightPositions = [
            { x: 50, y: 50, z: 50 },
            { x: -50, y: 50, z: 50 },
            { x: 50, y: 50, z: -50 },
            { x: -50, y: 50, z: -50 },
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
        },

        onContainerDelete: async function () {
          let oSlectedItems = this.byId("idContianersTable").getSelectedItems();
          if (oSlectedItems.length < 1) {
            return MessageBox.warning(
              "Please Select atleast One Row/Container to Delete"
            );
          }
          this._oBusyDialog = new sap.m.BusyDialog({
            text: "Deleting Data",
          });
          this._oBusyDialog.open();

          try {
            await new Promise((resolve) => setTimeout(resolve, 500));

            const oModel = this.getView().getModel();
            // Create a batch group ID to group the delete requests
            var sBatchGroupId = "deleteBatchGroup";
            // Start a batch operation
            oModel.setUseBatch(true);
            oModel.setDeferredGroups([sBatchGroupId]);
            oSlectedItems.forEach(async (item) => {
              let sPath = item.getBindingContext().getPath();
              await this.deleteData(oModel, sPath, sBatchGroupId);
            });
            // Submit the batch request
            oModel.submitChanges({
              groupId: sBatchGroupId,
              success: this._onBatchSuccess.bind(this),
              error: this._onBatchError.bind(this),
              refresh: this.byId("idContianersTable")
                .getBinding("items")
                .refresh(),
            });
          } catch (error) {
            MessageBox.error("Technical deletion error");
          } finally {
            this._oBusyDialog.close();
          }
        },
        // Submit the simulation (for example, a submit button in the fragment)
        onSubmitSimulation: async function () {
          let oModel = this.getOwnerComponent().getModel();
          let oView = this.getView();
          const oNewSimulationName = oView.byId("simulationInput").getValue();
          let payloadObejct = {
            Simulationname: oNewSimulationName,
            Status: "Pending",
            // createdBy: this.UserName
          };
          await this.createData(
            oModel,
            payloadObejct,
            "/CM_SIMULATED_RECORDSSet"
          );
          this._oFragmentNewSimulation.close();
          oView.byId("idList4").setVisible(false);
          oView.byId("idPieChartThings").setVisible(false);
          oView
            .byId("idCurrentSimName")
            .setText(`Current Simulation Name:${oNewSimulationName}`);
          oView.byId("id_Simulation_UI").setVisible(true);
          MessageToast.show(`${oNewSimulationName} is created successfully`);
          // var oTable = this.byId("idProductTable");
          // var oBinding = oTable.getBinding("items");
          // // Create the filter
          // var oFilter = new sap.ui.model.Filter(
          //   "Simulationname",
          //   sap.ui.model.FilterOperator.EQ,
          //   this.SimulationName
          // );
          // // Apply the filter
          // oBinding.filter([oFilter]);
          // this.byId("idProductTable").getBinding("items").refresh();
        },

        //Material Batch operations fragment open and data setting to that model ---> subash */
        onMaterialUploadbtn: function () {
          var oFileInput = document.createElement("input");
          oFileInput.type = "file";
          // Trigger the file input click event to open the file dialog
          oFileInput.click();
          oFileInput.addEventListener(
            "change",
            this._onFileSelected.bind(this, oFileInput)
          );
        },
        _onFileSelected: async function (oFileInput) {
          // Retrieve the selected file
          var oFile = oFileInput.files[0];
          // test

          // Get the file name and MIME type
          var fileName = oFile.name;

          // Allowed extensions for Excel files
          var allowedExtensions = [".xls", ".xlsx", ".xlsm"];

          // Check if the file extension is valid
          var fileExtension = fileName
            .substring(fileName.lastIndexOf("."))
            .toLowerCase();

          if (!allowedExtensions.includes(fileExtension)) {
            alert("Please select a valid Excel file (.xls, .xlsx, .xlsm)");
            return;
          }
          // test

          if (oFile) {
            // Here, you can implement the logic to handle the file
            // Example of handling the file upload logic.
            if (!this.oFragment) {
              this.oFragment = await this.loadFragment("MaterialXlData");
            }
            this.oFragment.open();
            await this._importData(oFile);
          }
        },
        /**Loading Container Fragment Data */
        _importData: function (file) {
          var that = this;
          var excelData = {};
          if (file && window.FileReader) {
            var reader = new FileReader();
            reader.onload = function (e) {
              var data = new Uint8Array(e.target.result);
              var workbook = XLSX.read(data, {
                type: "array",
              });
              workbook.SheetNames.forEach(function (sheetName) {
                // Here is your object for every sheet in workbook
                excelData = XLSX.utils.sheet_to_json(
                  workbook.Sheets[sheetName]
                );
                // adding serial numbers
                excelData.forEach(function (item, index) {
                  item.serialNumber = index + 1; // Serial number starts from 1
                });
              });

              // Setting the data to the local model
              that.MaterialModel.setData({
                items: excelData,
              });
              that.MaterialModel.refresh(true);
            };
            reader.onerror = function (ex) {
              console.log(ex);
            };
            reader.readAsArrayBuffer(file);
          }
        },

        //*Container upload logic
        // Function to handle the batch save process in container upload
        onBatchSaveContainerUpload: async function () {
          debugger;
          var that = this;

          // Fetch the data model containing the uploaded containers
          var addedContainersModel = this.getView()
            .getModel("ContainerModel")
            .getData();
          var oDataModel = this.getView().getModel();
          // Group ID for batch requests
          var batchGroupIdInContainerUpload = "batchCreateGroup";
          const oView = this.getView();

          let raisedErrors = [];

          //Fetch existing truck types from the backend
          let existingTruckTypes = new Set();
          try {
            const data = await new Promise((resolve, reject) => {
              oDataModel.read("/TruckTypes", {
                success: function (response) {
                  resolve(response.results);
                },
                error: function (err) {
                  reject(err);
                },
              });
            });
            data.forEach((item) =>
              existingTruckTypes.add(item.truckType.toUpperCase())
            );
          } catch (error) {
            MessageBox.error(
              "Failed to fetch existing truck types from the backend."
            );
            console.error("Error fetching truck types:", error);
            return;
          }

          // Standardize truck types and check for duplicates (backend and frontend)
          let frontendTruckTypes = new Set();

          for (
            let index = 0;
            index < addedContainersModel.items.length;
            index++
          ) {
            let item = addedContainersModel.items[index];

            // Standardize truck type (append "FT" if not present)
            if (!/FT$/i.test(item.truckType)) {
              item.truckType = `${item.truckType}FT`;
            }

            // Check for duplicate truck types within the uploaded data
            if (frontendTruckTypes.has(item.truckType.toUpperCase())) {
              raisedErrors.push({
                index: index,
                errorMsg: `Duplicate Container Type found in uploaded data: ${item.truckType}`,
              });
            } else {
              frontendTruckTypes.add(item.truckType.toUpperCase());
            }

            // Check for duplicate truck types in the backend
            if (existingTruckTypes.has(item.truckType.toUpperCase())) {
              raisedErrors.push({
                index: index,
                errorMsg: `Duplicate Container Type`,
              });
            }
          }

          //Perform other validations (numeric fields, weight < capacity, etc.)
          for (
            let index = 0;
            index < addedContainersModel.items.length;
            index++
          ) {
            let item = addedContainersModel.items[index];

            // Validation rules for various fields
            const aExcelInputs = [
              {
                value: item.truckType,
                regex: null,
                message: "Enter SAP product number",
              }, // Mandatory field, no regex needed
              {
                value: item.length,
                regex: /^\d+(\.\d+)?$/,
                message: "Length should be numeric",
              }, // Numeric validation
              {
                value: item.width,
                regex: /^\d+(\.\d+)?$/,
                message: "Width should be numeric",
              }, // Numeric validation
              {
                value: item.height,
                regex: /^\d+(\.\d+)?$/,
                message: "Height should be numeric",
              }, // Numeric validation
              {
                value: item.capacity,
                regex: /^\d+(\.\d+)?$/,
                message: "Capacity should be numeric",
              }, // Numeric validation
            ];

            // Validate each input field
            for (let input of aExcelInputs) {
              let aValidations = this.validateField(
                oView,
                null,
                input.value,
                input.regex,
                input.message
              );
              if (aValidations.length > 0) {
                raisedErrors.push({ index: index, errorMsg: aValidations[0] });
              }
            }
          }

          // If there are any validation errors, show them to the user and exit
          if (raisedErrors.length > 0) {
            let errorMessages = raisedErrors.map((error) => {
              const item = addedContainersModel.items[error.index];
              return `Container Type ${item.truckType}: ${error.errorMsg}`;
            });

            const allErrors = errorMessages.join("\n");
            MessageBox.warning(
              `The following containers have validation issues:\n\n${allErrors}`
            );
            return;
            // Exit the function after showing the errors
          }

          let errorShown = false;

          try {
            //Process and transform each item before sending it to the server
            for (
              let index = 0;
              index < addedContainersModel.items.length;
              index++
            ) {
              let item = addedContainersModel.items[index];
              delete item.serialNumber; // Remove unnecessary property

              // Convert dimensions based on the unit of measurement (UOM)
              if (item.uom === "mm" || item.uom === "MM") {
                item.length = String(item.length / 1000).trim();
                item.width = String(item.width / 1000).trim();
                item.height = String(item.height / 1000).trim();
              } else if (item.uom === "cm" || item.uom === "CM") {
                item.length = String(item.length / 100).trim();
                item.width = String(item.width / 100).trim();
                item.height = String(item.height / 100).trim();
              } else {
                item.length = String(item.length).trim();
                item.width = String(item.width).trim();
                item.height = String(item.height).trim();
              }

              // Calculate volume and ensure fields are strings
              item.volume = String(
                (item.length * item.width * item.height).toFixed(3)
              );
              item.capacity = String(item.capacity);

              //Create a batch request for each item
              oDataModel.create("/TruckTypes", item, {
                method: "POST",
                groupId: batchGroupIdInContainerUpload, // Add request to the batch group
                success: function (data, response) {
                  if (addedContainersModel.items.length === index + 1) {
                    MessageBox.success("Containers created successfully");
                    that.onCloseContainerUpload();
                    that
                      .byId("idContianersTable")
                      .getBinding("items")
                      .refresh();
                  }
                },
                error: function (err) {
                  if (!errorShown) {
                    errorShown = true;
                    MessageBox.error(
                      "Please check the uploaded file and upload correct data"
                    );
                    that.onCloseContainerUpload();
                  }
                  that.byId("idContianersTable").getBinding("items").refresh();
                  console.error("Error creating Container:", err);
                },
              });
            }

            //Submit the batch request
            await oDataModel.submitChanges({
              batchGroupIdInContainerUpload: batchGroupIdInContainerUpload,
              success: function (oData, response) {
                console.log("Batch request submitted", oData);
              },
              error: function (err) {
                if (!errorShown) {
                  errorShown = true;
                  MessageBox.error("Error creating Container batch");
                }
                console.error("Error in batch request:", err);
                that.byId("idContianersTable").getBinding("items").refresh();
              },
            });
          } catch (error) {
            console.log(error);
            MessageToast.show("Facing technical issue");
            this.byId("idContianersTable").getBinding("items").refresh();
          }
        },
        // Function to handle the close button press event in the container upload fragment
        onCloseContainerUpload: function () {
          // // Close the fragment dialog if it is open
          if (!this.oFragmentContainer) {
            this.byId("idDialogContainerUpload").close();
          } else if (this.oFragmentContainer.isOpen()) {
            this.oFragmentContainer.close();
          } else {
            console.log(
              "No action taken: oFragmentContainer exists but is not open."
            );
          }
        },
        // Function to trigger the container upload
        onContainerUpload: function () {
          var oFileInputContainer = document.createElement("input");
          oFileInputContainer.type = "file";

          // Trigger the file input click event to open the file dialog
          oFileInputContainer.click();
          oFileInputContainer.addEventListener(
            "change",
            this._onFileSelectedContainer.bind(this, oFileInputContainer)
          );
        },

        // // Function to handle file selection
        _onFileSelectedContainer: async function (oFileInputContainer) {
          // Retrieve the selected file
          var oFileContainer = oFileInputContainer.files[0];

          if (oFileContainer) {
            this.onOpenContainerBranch();
            await this._importContainerData(oFileContainer);
          }
        },

        // // Function to import data from the selected file (repeated function from earlier)
        _importContainerData: function (file) {
          var that = this;
          var excelContainerData = {};
          if (file && window.FileReader) {
            var reader = new FileReader();
            reader.onload = function (e) {
              var data = new Uint8Array(e.target.result);
              var workbook = XLSX.read(data, { type: "array" });
              workbook.SheetNames.forEach(function (sheetName) {
                excelContainerData = XLSX.utils.sheet_to_json(
                  workbook.Sheets[sheetName]
                );
                excelContainerData.forEach(function (item, index) {
                  item.serialNumber = index + 1; // Serial number starts from 1
                });
              });
              that.ContainerModel.setData({ items: excelContainerData });
              that.ContainerModel.refresh(true);
            };
            reader.onerror = function (ex) {
              console.log(ex);
            };
            reader.readAsArrayBuffer(file);
          }
        },

        onContainerEditPress: async function () {
          var oSelectedItem = this.byId("idContianersTable").getSelectedItems();
          if (oSelectedItem.length == 0) {
            MessageBox.warning("Please select at least one Record edit!");
            return;
          }
          if (oSelectedItem.length > 1) {
            MessageBox.warning("Please select only one Record for edit!");
            return;
          }
          let oPayload = oSelectedItem[0].getBindingContext().getObject();
          this.getView()
            .getModel("CombinedModel")
            .setProperty("/Vehicle", oPayload);
          this.onOpenContainerEdit();
        },

        //Edit function for the Container table. Present there is no requirment
        // for any additional functionality or validation requirements Add this Code
        onSaveEditContainerPress: async function () {
          // Get the edited data from the fragment model
          const oView = this.getView(),
            oContainerModel = oView.getModel("CombinedModel"),
            oUpdateContainer = oContainerModel.getProperty("/Vehicle"),
            // Get the original product row binding context (from the selected row in the table)
            oTable = this.byId("idContianersTable"),
            oSelectedItem = oTable.getSelectedItem(),
            oContext = oSelectedItem.getBindingContext(),
            // Use the context to get the path and ID of the selected product for updating
            sPath = oContext.getPath(), // The path to the product entry in the OData model
            oModel = oView.getModel();

          // Create the payload for updating the product in the backend
          var oPayloadmodelupdate = {
            truckType: oUpdateContainer.truckType,
            length: oUpdateContainer.length,
            width: oUpdateContainer.width,
            height: oUpdateContainer.height,
            uom: oUpdateContainer.uom,
            volume: oUpdateContainer.volume,
            tvuom: oUpdateContainer.tvuom,
            capacity: oUpdateContainer.capacity,
            tuom: oUpdateContainer.tuom, // Add any additional properties if needed
          };

          let raisedErrorsSave = [];
          const aUserInputsSave = [
            {
              Id: "IdContainerLength_Input",
              value: oPayloadmodelupdate.length,
              regex: /^\d+(\.\d+)?$/,
              message: "Length should be numeric",
            },
            {
              Id: "idContainerWidth_Input",
              value: oPayloadmodelupdate.width,
              regex: /^\d+(\.\d+)?$/,
              message: "Width should be numeric",
            },
            {
              Id: "idContainerHeight_Input",
              value: oPayloadmodelupdate.height,
              regex: /^\d+(\.\d+)?$/,
              message: "Height should be numeric",
            },
            {
              Id: "idContainerCapacity_Input",
              value: oPayloadmodelupdate.capacity,
              regex: /^\d+(\.\d+)?$/,
              message: "Capacity should be numeric",
            },
          ];

          // Add validation for empty fields
          aUserInputsSave.forEach((input) => {
            if (
              input.value === "" ||
              input.value === null ||
              input.value === undefined
            ) {
              raisedErrorsSave.push(input.message + " cannot be empty.");
            }
          });

          oPayloadmodelupdate.capacity = this.roundOfValue(
            oPayloadmodelupdate.capacity
          );
          oPayloadmodelupdate.length = this.roundOfValue(
            oPayloadmodelupdate.length
          );
          oPayloadmodelupdate.width = this.roundOfValue(
            oPayloadmodelupdate.width
          );
          oPayloadmodelupdate.height = this.roundOfValue(
            oPayloadmodelupdate.height
          );

          const validationPromisesSave = aUserInputsSave.map(async (input) => {
            if (
              input.value !== "" &&
              input.value !== null &&
              input.value !== undefined
            ) {
              let aValidationsSave = await this.validateField(
                oView,
                input.Id,
                input.value,
                input.regex,
                input.message
              );
              if (aValidationsSave.length > 0) {
                raisedErrorsSave.push(aValidationsSave[0]); // Push first error into array
              }
            }
          });

          // Wait for all validations to complete
          await Promise.all(validationPromisesSave);

          // Check if there are any raised errors
          if (raisedErrorsSave.length > 0) {
            // Consolidate errors into a single message
            const errorMessageSave = raisedErrorsSave.join("\n");
            MessageBox.warning(errorMessageSave); // Show consolidated error messages
            return;
          }

          oPayloadmodelupdate.volume = String(
            (
              oPayloadmodelupdate.height *
              oPayloadmodelupdate.width *
              oPayloadmodelupdate.length
            ).toFixed(3)
          );

          try {
            await this.updateData(oModel, oPayloadmodelupdate, sPath);
            MessageBox.success("Container details updated successfully!");
            // Close the fragment
            this.onCancelEditContainer();
            // Optionally, refresh the table binding to reflect the changes
            oTable.getBinding("items").refresh();
          } catch (oError) {
            MessageBox.error(
              "Error updating Container details: " + oError.message
            );
            this.onCancelEditContainer();
          }
        },

        // --------------------------------------------------- Simulation logic ---------------------------------------------------
        onCancelPress_valueHelp: function () {
          this.oValueDialog.close();
        },
        onAddPress: function () {
          var oTable = this.byId("idTableAddProduct");
          var aSelectedItems = oTable.getSelectedItems();
          let count = 0;
          var oModel = this.getOwnerComponent().getModel();
          if (aSelectedItems.length > 0) {
            var selectedData = [];

            // Loop through the selected rows and collect data
            aSelectedItems.forEach(function (oItem) {
              var oBindingContext = oItem.getBindingContext();
              var oData = oBindingContext.getObject(); // Get the data object of the row

              // Get the Input control for Picking Quantity
              var oInput = oItem.getCells()[4].mProperties; // Assuming the Input control is the 4th cell (index 3)

              // Get the value entered in the Input field
              var sPickingQty = oInput.value;
              var actualQuantity = oData.quantity;
              if (
                parseInt(sPickingQty) > parseInt(actualQuantity) ||
                parseInt(sPickingQty) <= 0 ||
                !sPickingQty
              ) {
                count = count + 1;
              }
            });
            if (count > 0) {
              MessageToast.show("Please Enter correct data");
              return;
            } else {
              this.onAddPress1(aSelectedItems, oModel);
            }
          } else {
            MessageToast.show("Please select atleast one product");
          }
        },

        onAddPress1: function (aSelectedItems, oModel) {
          // var oTable = this.byId("idTableAddProduct");
          var that = this;
          // Get the selected items (rows) from the table
          // const randomHexColor = (function () {
          //   const letters = '0123456789ABCDEF';
          //   let color = '#';
          //   for (let i = 0; i < 6; i++) {
          //     color += letters[Math.floor(Math.random() * 16)];
          //   }
          //   return color;
          // })();
          // var aSelectedItems = oTable.getSelectedItems();

          // var oModel = this.getOwnerComponent().getModel()
          // Check if there are selected items
          if (aSelectedItems.length > 0) {
            var selectedData = [];

            // Loop through the selected rows and collect data
            aSelectedItems.forEach(async function (oItem) {
              var oBindingContext = oItem.getBindingContext();
              var oData = oBindingContext.getObject(); // Get the data object of the row

              // Get the Input control for Picking Quantity
              var oInput = oItem.getCells()[4].mProperties; // Assuming the Input control is the 4th cell (index 3)

              // Get the value entered in the Input field
              var sPickingQty = oInput.value;
              // var actualQuantity = oData.quantity;

              // Add the relevant data along with the entered Picking Quantity
              var dummy = {
                Productno_ID: oData.ID,
                SelectedQuantity: sPickingQty,
              };
              // var dummy2 = {
              //   Productno_ID: oData.ID,

              //   color: randomHexColor
              // };
              selectedData.push({
                product: oData.model,
                description: oData.description,
                actualQuantity: oData.quantity, // Replace with the correct field name from the data
                pickingQuantity: sPickingQty,
                // color: randomHexColor
              });
              try {
                var oProductExists = await that.productExists(
                  oModel,
                  dummy.Productno_ID
                );

                if (!oProductExists) {
                  await that.createData(oModel, dummy, "/SelectedProduct");
                  that
                    .byId("idAddProductsTableIn_simulate")
                    ?.getBinding("items")
                    ?.refresh();
                  return;
                }
                await oModel.read("/SelectedProduct", {
                  filters: [
                    new Filter(
                      "Productno_ID",
                      FilterOperator.EQ,
                      dummy.Productno_ID
                    ),
                    //new Filter("password", FilterOperator.EQ, sPassword)
                  ],
                  success: async function (oData) {
                    console.log(oData);
                    var sID = oData.results[0].ID;
                    await oModel.update(
                      "/SelectedProduct('" + sID + "')",
                      { SelectedQuantity: sPickingQty },
                      {
                        success: function () {
                          that
                            .byId("idAddProductsTableIn_simulate")
                            ?.getBinding("items")
                            ?.refresh();
                        }.bind(this),
                        error: function (oError) {
                          sap.m.MessageBox.error("Failed " + oError.message);
                        }.bind(this),
                      }
                    );
                  },
                  error: function (oError) {
                    console.log(oError);
                  },
                });
              } catch (error) {
                console.log(error);
                MessageToast.show(error);
              }
            });

            // Do something with the selected data, e.g., display it
            //MessageToast.show("Selected Products: " + JSON.stringify(selectedData.));
            this.oValueDialog.close();
          } else {
            MessageToast.show("No rows selected.");
          }
        },
        productExists: function (oModel, sId) {
          const that = this;
          return new Promise((resolve, reject) => {
            // oModel.read(`/SelectedProduct('${sId}')`, {
            //     success: function (oData, resp) {
            //         console.log(oData);
            //         that.flag = true;  // Set flag to true if product exists
            //         resolve();         // Resolve promise when success
            //     },
            //     error: function (error) {
            //         console.error(error.message);
            //         that.flag = false; // Set flag to false if product does not exist
            //         reject(error);     // Reject promise on error
            //     }
            // });
            oModel.read("/SelectedProduct", {
              filters: [
                new Filter("Productno_ID", FilterOperator.EQ, sId),
                //new Filter("password", FilterOperator.EQ, sPassword)
              ],
              success: function (oData) {
                resolve(oData.results.length > 0);
              },
              error: function () {
                reject("An error occurred while checking username existence.");
              },
            });
          });
        },

        loadProductsFromLocalStorage: function () {
          const oTempJSon = this.getView().getModel("oJsonModelProd");

          if (!oTempJSon) {
            console.error("JSON Model 'oJsonModelProd' is not defined.");
            return; // Exit if model is not available
          }

          const savedProducts = localStorage.getItem("productsData");
          if (savedProducts) {
            const products = JSON.parse(savedProducts);
            console.log("Loaded products from local storage:", products);

            // Ensure the structure is correct
            if (Array.isArray(products)) {
              oTempJSon.setProperty("/products", products);
              console.log(
                "Products set in model:",
                oTempJSon.getProperty("/products")
              );

              // Refresh the table binding
              // this.getView().byId("idAddProductsTableIn_simulate").getBinding("items").refresh();
              this.getView().getModel("oJsonModelProd").refresh(true);
            } else {
              console.error("Loaded data is not an array:", products);
            }
          } else {
            console.log("No products found in local storage.");
          }
        },
        onRemoveSelectedProducts: function () {
          // Get the current model
          const oTempJSon = this.getView().getModel("oJsonModelProd");

          // Get the table and selected items
          const oTable = this.getView().byId("idAddProductsTableIn_simulate");
          const aSelectedItems = oTable.getSelectedItems();

          // If there are selected items, remove them
          if (aSelectedItems.length > 0) {
            const aProducts = oTempJSon.getProperty("/products");

            // Create a set of selected product keys for easier lookup
            const aSelectedKeys = aSelectedItems.map((item) => {
              return item
                .getBindingContext("oJsonModelProd")
                .getProperty("Product");
            });

            console.log("Selected Keys:", aSelectedKeys); // Log selected keys
            console.log("All Products:", aProducts); // Log all products

            // Filter out products that are in the selected keys
            const aFilteredProducts = aProducts.filter((product) => {
              const isSelected = aSelectedKeys.includes(product.Product);
              console.log(
                `Checking product: ${product.Product}, is selected: ${isSelected}`
              ); // Log each check
              return !isSelected; // Keep products that are not selected
            });

            console.log("Filtered Products:", aFilteredProducts); // Log filtered products

            // Update the model with filtered products
            oTempJSon.setProperty("/products", aFilteredProducts);

            // Update local storage with the new array
            localStorage.setItem(
              "productsData",
              JSON.stringify(aFilteredProducts)
            );

            // Refresh table binding to reflect changes
            oTable.getBinding("items").refresh();

            // Inform the user that selected products have been removed
            sap.m.MessageToast.show("Selected products have been removed.");
            this.Blocking();
          } else {
            // If no items are selected, remove all products
            oTempJSon.setProperty("/products", []);

            // Clear local storage
            localStorage.removeItem("productsData");

            // Refresh table binding to reflect changes
            oTable.getBinding("items").refresh();

            // Inform the user that all products have been removed
            sap.m.MessageToast.show("All products have been removed.");
          }
        },
        _import: function (file) {
          var that = this;
          let oTempProduct = that.getView().getModel("oJsonModelProd"),
            existData = oTempProduct.getData().products;
          var excelData = {};
          if (file && window.FileReader) {
            var reader = new FileReader();
            reader.onload = function (e) {
              var data = e.target.result;
              var workbook = XLSX.read(data, {
                type: "binary",
              });
              workbook.SheetNames.forEach(function (sheetName) {
                // Here is your object for every sheet in workbook
                excelData = XLSX.utils.sheet_to_row_object_array(
                  workbook.Sheets[sheetName]
                );
              });
              console.log(excelData);
              excelData.forEach((record) => {
                if (record.Weight) {
                  // Check if Weight field exists
                  record.Weight += "KG"; // Concatenate 'kg' to the Weight field
                }
              });
              var uniqueData = [...new Set(excelData)];
              console.log(uniqueData);
              // Step 2: Store new Excel data in local storage
              const combinedData = [...existData, ...uniqueData]; // Combine existing and new data
              localStorage.setItem(
                "productsData",
                JSON.stringify(combinedData)
              ); // Store combined data back in local storage

              // Step 3: Set the combined data to the local model
              oTempProduct.setData({ products: combinedData }); // Update model with combined products
              oTempProduct.refresh(true); // Refresh the model to update UI bindings
            };
            reader.onerror = function (ex) {
              console.log(ex);
            };
            reader.readAsBinaryString(file);
          }
        },
        onListItemPress: function (oEvent) {
          const { ID } = oEvent.getSource().getBindingContext().getObject();
          var oView = this.getView();
          var oSelectedItem = oEvent.getSource(),
            oBindingContext = oSelectedItem.getBindingContext(),
            oSelectedRowData = oBindingContext.getObject();

          if (oSelectedRowData.status === "Completed") {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteSimulationDetails", {
              sid: ID,
              id: this.ID,
              simID: oSelectedRowData.Simulationname,
            });
          } else {
            // oView.byId("_IDGenText2").setVisible(false);

            // var oSelectedItem = this.byId("idIconTabHeader").getParameter("selectedItem"),
            // selectedText = oSelectedItem.getText();

            var oIconTabBar = this.byId("idIconTabHeader");
            oIconTabBar.setSelectedKey("page7");

            this.byId("pageContainer").to(this.getView().createId("page4"));
            oView.byId("idList4").setVisible(false);
            oView.byId("idPieChartThings").setVisible(false);
            oView
              .byId("id_SelectedProductsForSimulation_table")
              .setVisible(false);
            oView.byId("VBoxForTrucks").setVisible(true);
            oView.byId("idProductTable").setVisible(true);
            oView.byId("id_Simulation_UI").setVisible(true);
            this.getView().getModel("MaterialModel").setData(); // Reset Material Model
            oView
              .byId("idCurrentSimName")
              .setText(
                `Current Simulation Name: ${oSelectedRowData.Simulationname}`
              );
            this.SimulationName = oSelectedRowData.Simulationname;

            // Apply filter to fetch product details based on simulationName
            var oTable = this.byId("idProductTable");
            var oBinding = oTable.getBinding("items");

            // Create the filter
            var oFilter = new sap.ui.model.Filter(
              "Simulationname",
              sap.ui.model.FilterOperator.EQ,
              oSelectedRowData.Simulationname
            );

            // Apply the filter
            oBinding.filter([oFilter]);
            console.log(oBinding.aKeys);
            // if (oBinding.aKeys.length == 0) {
            var oComboBox = this.byId("id_combobox_for_truckType");
            oComboBox.setSelectedKey("");
            oComboBox.setValue("");
            if (this.renderer) {
              this.renderer.domElement.remove();
              this.renderer.dispose();
            }
            var selectedContainer = this.byId(
              "id_combobox_for_truckType"
            ).getSelectedKey();
            if (oBinding.getLength() === 0 && selectedContainer === "") {
              this.byId("ManualSimulation").setVisible(false);
            } else {
              this.byId("ManualSimulation").setVisible(true);
            }
            // }
          }
        },

        modeltoDisplayforPendingSimulation: async function (simName) {
          var oModel = this.getOwnerComponent().getModel();
          var oProducts = [];
          var that = this;
          await oModel.read("/SelectedProduct", {
            filters: [
              new Filter(
                "simulationName_simulationName",
                FilterOperator.EQ,
                simName
              ),
            ],
            success: function (oData) {
              const smodels = oData.results;
              console.log(oData);
              for (var i = 0; i < smodels.length; i++) {
                oProducts.push({
                  model: smodels[i].Productno_model,
                  quantity: smodels[i].SelectedQuantity,
                });
              }
              console.log(oProducts);
            },
            error: function (oError) {},
          });
        },

        onValueHelpRequest: function (oEvent) {
          try {
            const oInput = oEvent.getSource(); // The triggering input field
            const oRowBindingContext =
              oInput.getBindingContext("MaterialModel"); // Get the binding context of the Input field

            if (!oRowBindingContext) {
              console.error(
                "No binding context found for the triggering input."
              );
              return;
            }

            // Extract the row's unique serial number directly from the binding context
            const rowId = oRowBindingContext.getProperty("serialNumber");

            if (!rowId) {
              console.error(
                "Row ID (serialNumber) is not found in the binding context."
              );
              return;
            }

            // Store the current row ID globally for later use
            this._currentRowId = rowId;

            // Check if the Value Help Dialog is already created
            if (!this._oValueHelpDialog) {
              this._oValueHelpDialog = new sap.m.SelectDialog({
                title: "Select Model",
                items: {
                  path: "/CM_MATERIALSet", // Path in the model for available materials
                  template: new sap.m.StandardListItem({
                    title: "{Model}",
                    description: "{Description}",
                  }),
                },
                search: function (oSearchEvent) {
                  const sQuery = oSearchEvent.getParameter("value"); // Search query entered by the user

                  // Combine selected values from both fragments
                  const aSelectedModels = this._getSelectedModels();

                  const aFilters = [];

                  // Exclude already selected models
                  if (aSelectedModels.length > 0) {
                    aSelectedModels.forEach(function (sModel) {
                      aFilters.push(
                        new sap.ui.model.Filter(
                          "Model",
                          sap.ui.model.FilterOperator.NE,
                          sModel
                        )
                      );
                    });
                  }

                  // Add search query as a filter
                  if (sQuery) {
                    aFilters.push(
                      new sap.ui.model.Filter(
                        "Model",
                        sap.ui.model.FilterOperator.Contains,
                        sQuery
                      )
                    );
                  }

                  // Apply the combined filters
                  const oBinding = oSearchEvent.getSource().getBinding("items");
                  if (oBinding) {
                    oBinding.filter(
                      aFilters.length > 0
                        ? new sap.ui.model.Filter({
                            filters: aFilters,
                            and: true,
                          })
                        : []
                    );
                  }
                }.bind(this),
                confirm: function (oConfirmEvent) {
                  const oSelectedItem =
                    oConfirmEvent.getParameter("selectedItem");
                  if (oSelectedItem) {
                    const sSelectedModel = oSelectedItem.getTitle();

                    // Use the current row ID to update the relevant row
                    const oRow = this.byId(
                      "id_SelectedProductsForSimulation_table"
                    )
                      .getItems()
                      .find(
                        function (oItem) {
                          return (
                            oItem
                              .getBindingContext("MaterialModel")
                              .getProperty("serialNumber") ===
                            this._currentRowId
                          );
                        }.bind(this)
                      );

                    if (oRow) {
                      const oModelInput = oRow.getCells()[1]; // Assuming Model Input is the second cell
                      oModelInput.setValue(sSelectedModel); // Update the selected model
                    } else {
                      console.error(
                        "Row with ID",
                        this._currentRowId,
                        "not found in the table."
                      );
                    }
                  }
                }.bind(this),
              });

              this.getView().addDependent(this._oValueHelpDialog);
            }

            // Exclude selected models from the dialog's binding
            const aFilters = this._getSelectedModels().map(function (sModel) {
              return new sap.ui.model.Filter(
                "Model",
                sap.ui.model.FilterOperator.NE,
                sModel
              );
            });

            const oBinding = this._oValueHelpDialog.getBinding("items");
            if (oBinding) {
              oBinding.filter(
                aFilters.length > 0
                  ? new sap.ui.model.Filter({ filters: aFilters, and: true })
                  : []
              );
            }

            this._oValueHelpDialog.open();
          } catch (oError) {
            console.error("Error in onValueHelpRequest:", oError.message);
          }
        },

        /**
         * Utility function to get selected models from both tables.
         * This ensures already selected values do not appear in either the fragment or dialog.
         */
        _getSelectedModels: function () {
          const aSelectedFromFragment = this.byId(
            "id_SelectedProductsForSimulation_table"
          )
            .getItems()
            .map(function (oItem) {
              return oItem
                .getBindingContext("MaterialModel")
                .getProperty("Model");
            })
            .filter(Boolean); // Filter out empty or undefined values

          const aSelectedFromTable = this.byId("idProductTable")
            .getItems()
            .map(function (oItem) {
              return oItem.getBindingContext().getProperty("Productno");
            })
            .filter(Boolean); // Filter out empty or undefined values

          // Combine selected models from both sources
          return [...aSelectedFromFragment, ...aSelectedFromTable];
        },

        onAddRowPress: function () {
          this.byId("idProductTable").setVisible(false);
          this.byId("id_SelectedProductsForSimulation_table").setVisible(true);
          this.byId("_IDGenButton2").setVisible(true);

          // Get the current data from MaterialModel
          var oCurrentData = this.MaterialModel.getData();

          // Initialize items if it does not exist
          if (!oCurrentData) {
            oCurrentData = {};
          }

          if (!oCurrentData.items) {
            oCurrentData.items = [];
          }

          // Add a single empty row
          var oNewRow = {
            serialNumber: oCurrentData.items.length + 1,
            model: "",
            quantity: "",
          };
          oCurrentData.items.push(oNewRow);

          // Update the model with the modified data
          this.MaterialModel.setData(oCurrentData);

          // Refresh the model to trigger the UI update
          this.MaterialModel.refresh(true);
        },

        onEditModelQTYPress: function () {
          const oSelected = this.byId("idProductTable").getSelectedItems();
          if (oSelected.length === 0) {
            MessageToast.show("Please Select atleast one item");
            return;
          }
          oSelected.forEach((item, index) => {
            item.getCells()[1].setEditable(true);
            this.totalSelected = index + 1;
          });

          this.byId("id_newSimlation_MenuBtn").setVisible(false);
          this.byId("idUpdateModelQTYBtn").setVisible(true);
          this.byId("idCancelUpdateModelQTYBtn").setVisible(true);
        },
        onUpdateSelectedProductQTY: function () {
          const oModel = this.getOwnerComponent().getModel(),
            that = this;
          // Prepare batch request (grouping updates into a batch)
          oModel.setDeferredGroups(["updateGroup"]);

          const oSelected = this.byId("idProductTable").getSelectedItems();
          var count = 0;
          if (this.totalSelected === oSelected.length) {
            try {
              oSelected.forEach((item) => {
                const modelId = item.getBindingContext().getObject().ID;
                const QTY = item.getCells()[1].getValue();
                if (QTY > 0 && /^\d+$/.test(QTY)) {
                  // Create update request
                  oModel.update(
                    `/SelectedProduct('${modelId}')`,
                    { SelectedQuantity: QTY },
                    {
                      groupId: "updateGroup", // Group updates in a batch
                      success: async function (oData, response) {
                        count += 1;
                        if (count === that.totalSelected) {
                          MessageToast.show(`Updated successfully!`);
                          that.byId("idProductTable").removeSelections(true);
                          await that.onCancelUpdateSelProductQTY();
                          await that.onTruckTypeChange();
                        }
                      },
                      error: function (oError) {
                        console.error(
                          `Error updating product ${modelId}:`,
                          oError
                        );
                      },
                    }
                  );
                } else {
                  MessageToast.show("Please enter correct quantity value");
                }
              });

              // Send the batch request
              oModel.submitChanges({
                groupId: "updateGroup",
                success: function (oData, response) {
                  try {
                    console.log("Batch update successful.");
                  } catch (e) {
                    console.error("Error in success callback:", e);
                  }
                },
                error: function (oError) {
                  // Handle errors for the entire batch
                  try {
                    console.error("Batch update failed:", oError);
                    alert("Batch update failed. Please try again later.");
                  } catch (e) {
                    console.error("Error in batch error handler:", e);
                  }
                },
              });
            } catch (e) {
              // General error handling if anything goes wrong in the batch setup or before sending
              console.error("An unexpected error occurred:", e);
              MessageToast.show("An unexpected error occurred:", e);
            }
          } else {
            MessageToast.show("Please select all the editable rows");
          }
        },

        onCancelUpdateSelProductQTY: function () {
          this.byId("idProductTable")
            .getItems()
            .forEach((item) => {
              item.getCells()[1].setEditable(false);
            });
          this.byId("idUpdateModelQTYBtn").setVisible(false);
          this.byId("idCancelUpdateModelQTYBtn").setVisible(false);
          this.byId("id_newSimlation_MenuBtn").setVisible(true);
          this.getView().getModel().refresh(true);
        },

        // Function to update the S.No column for all rows in the table

        onUploadSelectedProducts: function () {
          var oFileInput = document.createElement("input");
          oFileInput.type = "file";

          // Trigger the file input click event to open the file dialog
          oFileInput.click();
          oFileInput.addEventListener(
            "change",
            this._onFileSelectedProducts.bind(this, oFileInput)
          );
        },
        _onFileSelectedProducts: async function (oFileInput) {
          // Retrieve the selected file

          if (oFileInput) {
            // Retrieve the selected file
            var oFileInput = oFileInput.files[0];
            // test

            // Get the file name and MIME type
            var fileName = oFileInput.name;

            // Allowed extensions for Excel files
            var allowedExtensions = [".xls", ".xlsx", ".xlsm"];

            // Check if the file extension is valid
            var fileExtension = fileName
              .substring(fileName.lastIndexOf("."))
              .toLowerCase();

            if (!allowedExtensions.includes(fileExtension)) {
              alert("Please select a valid Excel file (.xls, .xlsx, .xlsm)");
              return;
            }
            await this._importDataSlectedProducts(oFileInput);
            this.byId("idProductTable").setVisible(false);
            this.byId("id_SelectedProductsForSimulation_table").setVisible(
              true
            );
            this.byId("_IDGenButton2").setVisible(true);
            this.byId("idUpdateModelQTYBtn").setVisible(false);
          }
        },
        onCancelSelectedProdUpload: function () {
          if (this.byId("idProductTable").getVisible() === false) {
            this.getView().getModel("MaterialModel").setData("");
            this.byId(
              "id_SelectedProductsForSimulation_table"
            ).removeAllItems();
            this.byId("id_SelectedProductsForSimulation_table").setVisible(
              false
            );
            this.byId("idProductTable").setVisible(true);
            this.byId("_IDGenButton2").setVisible(false);
            this.byId("idUpdateModelQTYBtn").setVisible(false);
            this.byId("idBarChart").getModel("HistoryModel").refresh(true);
          }
        },
        _importDataSlectedProducts: function (file) {
          var that = this;
          var excelData = {};
          var oCurrentData = that.MaterialModel.getData();
          if (!oCurrentData) {
            oCurrentData = {}; // Ensure oCurrentData exists
          }
          if (!oCurrentData.items) {
            oCurrentData.items = []; // Initialize 'items' if it's undefined
          }

          var iCurrentCount = oCurrentData.items.length;
          if (file && window.FileReader) {
            var reader = new FileReader();
            reader.onload = function (e) {
              var data = new Uint8Array(e.target.result);
              var workbook = XLSX.read(data, {
                type: "array",
              });
              workbook.SheetNames.forEach(function (sheetName) {
                // Here is your object for every sheet in workbook
                excelData = XLSX.utils.sheet_to_json(
                  workbook.Sheets[sheetName]
                );
                // adding serial numbers
                excelData.forEach(function (item, index) {
                  if (iCurrentCount != 0) {
                    item.serialNumber = iCurrentCount + 1;
                    iCurrentCount += 1;
                  } else {
                    item.serialNumber = index + 1;
                  }
                });
              });
              oCurrentData.items = oCurrentData.items.concat(excelData);
              // Setting the data to the local model
              that.MaterialModel.setData({
                items: oCurrentData.items,
              });
              that.MaterialModel.refresh(true);
            };
            reader.onerror = function (ex) {
              console.log(ex);
            };
            reader.readAsArrayBuffer(file);
          }
        },
        // onBatchSaveSelectedProduct: async function () {
        //   this._oBusyUpload = new sap.m.BusyDialog({
        //     text: "Please wait while uploading",
        //   });
        //   var that = this;
        //   var addedProdCodeModel = this.getView()
        //     .getModel("MaterialModel")
        //     .getData();
        //   // var batchChanges = [];
        //   var oDataModel = this.getOwnerComponent().getModel();
        //   var batchGroupId = "batchCreateGroup";
        //   const oView = this.getView();
        //   var oProductDetailsArray = [];

        //   // test
        //   // excel Validations
        //   let raisedErrors = [];
        //   if (addedProdCodeModel) {
        //     if (addedProdCodeModel.items) {
        //       this._oBusyUpload.open();
        //       addedProdCodeModel.items.forEach(async (item, index) => {
        //         const aExcelInputs = [
        //           {
        //             value: item.Model,
        //             regex: null,
        //             message: "Enter SAP model/product number",
        //           },
        //           {
        //             value: item.Quantity,
        //             regex: /^\d+$/,
        //             message: "Quantity should be numeric",
        //           },
        //         ];
        //         for (let input of aExcelInputs) {
        //           let aValidations = this.validateField(
        //             oView,
        //             null,
        //             input.value,
        //             input.regex,
        //             input.message
        //           );
        //           if (aValidations.length > 0) {
        //             raisedErrors.push({
        //               index: index,
        //               errorMsg: aValidations[0],
        //             }); // pushning error into empty array
        //           }
        //         }
        //       });
        //       if (raisedErrors.length > 0) {
        //         for (let error of raisedErrors) {
        //           MessageBox.information(
        //             `Check record number ${error.index + 1} ${error.errorMsg}`
        //           ); // showing error msg
        //           this._oBusyUpload.close();
        //           return;
        //         }
        //       }
        //       // test
        //       try {
        //         const sPath = "/CM_SELECTED_PRODUCTSet",
        //           oBatchGroup = "batchGroup1";
        //         // Create the simulation filter
        //         let aFilters = [
        //           new sap.ui.model.Filter(
        //             "Simulationname",
        //             sap.ui.model.FilterOperator.EQ,
        //             that.SimulationName
        //           ),
        //         ];

        //         var oProductsInCurrentSimulation = await this.readData(
        //           oDataModel,
        //           sPath,
        //           aFilters
        //         );
        //         // check the uploading data if exists...
        //         // Create a Set of models for efficient lookup
        //         const modelSet = new Set(
        //           addedProdCodeModel.items.map((item) => item.Model)
        //         );

        //         // Filter products that match any model in the set
        //         const duplicateItems =
        //           oProductsInCurrentSimulation.results.filter((product) =>
        //             modelSet.has(product.Productno)
        //           );

        //         // const duplicateItems = oProductsInCurrentSimulation.results.filter(item1 => addedProdCodeModel.items.some(item2 => item2.model === item1.Productno_model));
        //         if (duplicateItems.length === 0) {
        //           let Count = 0;
        //           const readCAllerrors = await readMaterialData(); // Get errors from read operation
        //           if (readCAllerrors.length === 0) {
        //             await createSelMaterialsData(); // Proceed if no errors found
        //           } else {
        //             const tableItems = this.byId(
        //               "id_SelectedProductsForSimulation_table"
        //             ).getItems();
        //             const set2Ids = new Set(
        //               readCAllerrors.map((item) => item.model)
        //             );

        //             tableItems.map((item) => {
        //               if (set2Ids.has(item.getCells()[1].getValue())) {
        //                 item.getCells()[1].setValueState("Error");
        //                 item
        //                   .getCells()[1]
        //                   .setValueStateText("Model not found in records");
        //               } else {
        //                 item.getCells()[1].setValueState("None");
        //               }
        //             });
        //             let unknownMaterials = readCAllerrors
        //               .map((item) => item.model)
        //               .join(", \n");
        //             MessageBox.error(
        //               `There are some unknown materials/models in this file:\n  "${unknownMaterials}"`
        //             );
        //           }
        //           //
        //           async function readMaterialData() {
        //             // Initialize readErrors array before starting
        //             let readErrors = [];
        //             // Loop over each item and read the data
        //             for (let item of addedProdCodeModel.items) {
        //               Count += 1;
        //               let sPath = `/CM_MATERIALSet('${item.Model}')`; // Define the path
        //               // Create a promise for each read operation to handle async properly
        //               await new Promise((resolve, reject) => {
        //                 oDataModel.read(sPath, {
        //                   groupId: oBatchGroup,
        //                   success: function (oData, response) {
        //                     // MessageToast.show("Read successful for model: " + item.model);
        //                     resolve(); // Resolve the promise to continue
        //                   },
        //                   error: function (oError) {
        //                     // Handle errors by pushing them into the readErrors array
        //                     readErrors.push({
        //                       model: item.Model,
        //                       error: oError,
        //                     });
        //                     console.log(
        //                       "Error fetching record for model:",
        //                       item.Model,
        //                       oError
        //                     );
        //                     // MessageBox.error("Error fetching record for model: " + item.model);
        //                     resolve(); // Resolve to continue, even after an error
        //                   },
        //                 });
        //               });
        //             }
        //             // After all reads, submit the batch request
        //             try {
        //               await oDataModel.submitChanges({
        //                 groupId: oBatchGroup,
        //                 success: function (oData) {
        //                   console.log("Batch sent", oData);
        //                   // that
        //                   //   .getView()
        //                   //   .byId("idBarChart")
        //                   //   .getModel("HistoryModel")
        //                   //   .refresh(true);
        //                 },
        //                 error: function (oError) {
        //                   console.log("Sending batch request failed", oError);
        //                 },
        //               });
        //             } catch (error) {
        //               console.error("Error: ", error);
        //             }
        //             // Return the collected errors after all operations are completed
        //             return readErrors;
        //           }
        //           // Function to generate random hex color in 0xRRGGBB format
        //           function generateRandomHexColor() {
        //             const randomColor = Math.floor(Math.random() * 0xffffff);
        //             return `#${randomColor
        //               .toString(16)
        //               .padStart(6, "0")
        //               .toUpperCase()}`;
        //           }
        //           async function createSelMaterialsData() {
        //             let creationCount = 0;
        //             for (let item of addedProdCodeModel.items) {
        //               const obJ = {
        //                 Productno: item.Model,
        //                 Selectedquantity: item.Quantity.toString(),
        //                 Simulationname: that.SimulationName,
        //                 Color: generateRandomHexColor(),
        //               };
        //               oDataModel.create("/CM_SELECTED_PRODUCTSet", obJ, {
        //                 method: "POST",
        //                 groupId: batchGroupId, // Specify the batch group ID here
        //                 success: function (data, response) {
        //                   creationCount += 1;
        //                   if (
        //                     creationCount === addedProdCodeModel.items.Length
        //                   ) {
        //                     // that.oFragmentSP.close()
        //                     MessageBox.success("Materials added successfully");
        //                     that
        //                       .getView()
        //                       .getModel("MaterialModel")
        //                       .setData("");
        //                     that
        //                       .byId("id_SelectedProductsForSimulation_table")
        //                       .setVisible(false);
        //                     that.byId("idProductTable").setVisible(true);
        //                     that.byId("_IDGenButton2").setVisible(false);
        //                     var oTable = that.byId("idProductTable");
        //                     var oBinding = oTable.getBinding("items");
        //                     // Create the filter
        //                     var oFilter = new sap.ui.model.Filter(
        //                       "Simulationname",
        //                       sap.ui.model.FilterOperator.EQ,
        //                       that.SimulationName
        //                     );
        //                     // Apply the filter
        //                     oBinding.filter([oFilter]);
        //                   }
        //                 },
        //                 error: function (err) {
        //                   // Handle error for individual item
        //                   if (
        //                     JSON.parse(
        //                       err.responseText
        //                     ).error.message.value.toLowerCase() ===
        //                     "entity already exists"
        //                   ) {
        //                     MessageBox.error(
        //                       "Material already exists. Please check and try again."
        //                     );
        //                   } else {
        //                     MessageBox.error(
        //                       "Error creating material. Please check the uploaded file and upload correct data."
        //                     );
        //                   }
        //                   console.error("Error creating material:", err);
        //                   // throw new Error('Error during material creation'); // Stop further execution
        //                 },
        //               });
        //             }
        //             await oDataModel.submitChanges({
        //               batchGroupId: batchGroupId,
        //               success: function (oData, response) {
        //                 // console.log("Batch request submitted", oData);
        //               },
        //               error: function (err) {
        //                 // MessageBox.error("Error creating material batch");
        //                 console.error("Error in batch request:", err);
        //               },
        //             });
        //           }
        //         } else {
        //           const tableItems = this.byId(
        //             "id_SelectedProductsForSimulation_table"
        //           ).getItems();
        //           const set2Ids = new Set(
        //             duplicateItems.map((item) => item.Productno)
        //           );

        //           tableItems.map((item) => {
        //             if (set2Ids.has(item.getCells()[1].getValue())) {
        //               item.getCells()[1].setValueState("Error");
        //               item
        //                 .getCells()[1]
        //                 .setValueStateText("Model already selected");
        //             } else {
        //               item.getCells()[1].setValueState("None");
        //             }
        //           });

        //           MessageBox.information(`Current file contains models/materials which are already selected for simulation.\n
        //             ${duplicateItems
        //               .map((item) => item.Productno_model)
        //               .join(",\n")}\n
        //                            NOTE:You can increase the quantity of already selected models/materials by editing them individually`);
        //         }
        //         // testing
        //       } catch (error) {
        //         console.log(error);
        //         MessageToast.show(
        //           "Facing technical issue please refresh the page"
        //         );
        //       } finally {
        //         this._oBusyUpload.close();
        //       }
        //     } else {
        //       MessageBox.information(
        //         "To proceed please add products either by uploading a file or by manual"
        //       );
        //     }
        //   } else {
        //     MessageBox.information(
        //       "To proceed please add products either by uploading a file or by manual"
        //     );
        //   }
        // },
        onBatchSaveSelectedProduct: async function () {
          this._oBusyUpload = new sap.m.BusyDialog({
            text: "Please wait while uploading",
          });
          this._oBusyUpload.open();

          try {
            const that = this;
            const addedProdCodeModel = this.getView()
              .getModel("MaterialModel")
              .getData();
            const oDataModel = this.getOwnerComponent().getModel();
            const oView = this.getView();

            // Validate if there are items to process
            if (!addedProdCodeModel?.items?.length) {
              sap.m.MessageBox.information(
                "To proceed please add products either by uploading a file or by manual"
              );
              return;
            }

            // Excel Validations
            const raisedErrors = [];
            for (const [index, item] of addedProdCodeModel.items.entries()) {
              const aExcelInputs = [
                {
                  value: item.Model,
                  regex: null,
                  message: "Enter SAP model/product number",
                },
                {
                  value: item.Quantity,
                  regex: /^\d+$/,
                  message: "Quantity should be numeric",
                },
              ];

              for (const input of aExcelInputs) {
                const aValidations = this.validateField(
                  oView,
                  null,
                  input.value,
                  input.regex,
                  input.message
                );
                if (aValidations.length > 0) {
                  raisedErrors.push({
                    index: index,
                    errorMsg: aValidations[0],
                  });
                }
              }
            }

            if (raisedErrors.length > 0) {
              for (const error of raisedErrors) {
                sap.m.MessageBox.information(
                  `Check record number ${error.index + 1} ${error.errorMsg}`
                );
              }
              return;
            }

            // Check for duplicates in existing simulation
            const sPath = "/CM_SELECTED_PRODUCTSet";
            const aFilters = [
              new sap.ui.model.Filter(
                "Simulationname",
                sap.ui.model.FilterOperator.EQ,
                that.SimulationName
              ),
            ];

            const oProductsInCurrentSimulation = await this.readData(
              oDataModel,
              sPath,
              aFilters
            );

            const modelSet = new Set(
              addedProdCodeModel.items.map((item) => item.Model)
            );

            const duplicateItems = oProductsInCurrentSimulation.results.filter(
              (product) => modelSet.has(product.Productno)
            );

            if (duplicateItems.length > 0) {
              const tableItems = this.byId(
                "id_SelectedProductsForSimulation_table"
              ).getItems();
              const set2Ids = new Set(
                duplicateItems.map((item) => item.Productno)
              );

              tableItems.forEach((item) => {
                if (set2Ids.has(item.getCells()[1].getValue())) {
                  item.getCells()[1].setValueState("Error");
                  item
                    .getCells()[1]
                    .setValueStateText("Model already selected");
                } else {
                  item.getCells()[1].setValueState("None");
                }
              });

              sap.m.MessageBox.information(
                `Current file contains models/materials which are already selected for simulation.\n` +
                  `${duplicateItems
                    .map((item) => item.Productno)
                    .join(",\n")}\n` +
                  `NOTE: You can increase the quantity of already selected models/materials by editing them individually`
              );
              return;
            }

            // Validate materials exist in the system
            const readErrors = [];
            for (const item of addedProdCodeModel.items) {
              try {
                const sPath = `/CM_MATERIALSet('${item.Model}')`;
                await new Promise((resolve, reject) => {
                  oDataModel.read(sPath, {
                    success: resolve,
                    error: (oError) => {
                      readErrors.push({
                        model: item.Model,
                        error: oError,
                      });
                      resolve(); // Continue even if error
                    },
                  });
                });
              } catch (error) {
                console.error("Error reading material:", error);
              }
            }

            if (readErrors.length > 0) {
              const tableItems = this.byId(
                "id_SelectedProductsForSimulation_table"
              ).getItems();
              const set2Ids = new Set(readErrors.map((item) => item.model));

              tableItems.forEach((item) => {
                if (set2Ids.has(item.getCells()[1].getValue())) {
                  item.getCells()[1].setValueState("Error");
                  item
                    .getCells()[1]
                    .setValueStateText("Model not found in records");
                } else {
                  item.getCells()[1].setValueState("None");
                }
              });

              const unknownMaterials = readErrors
                .map((item) => item.model)
                .join(", \n");
              sap.m.MessageBox.error(
                `There are some unknown materials/models in this file:\n  "${unknownMaterials}"`
              );
              return;
            }

            // Create selected products - one at a time with individual changesets
            for (const item of addedProdCodeModel.items) {
              const batchGroupId = `batchCreate_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 5)}`;

              const obJ = {
                Productno: item.Model,
                Selectedquantity: item.Quantity.toString(),
                Simulationname: that.SimulationName,
                Color: this.generateRandomHexColor(),
              };

              try {
                await new Promise((resolve, reject) => {
                  oDataModel.create("/CM_SELECTED_PRODUCTSet", obJ, {
                    groupId: batchGroupId,
                    success: resolve,
                    error: reject,
                  });

                  oDataModel.submitChanges({
                    groupId: batchGroupId,
                    success: resolve,
                    error: reject,
                  });
                });
              } catch (err) {
                console.error("Error creating material:", err);
                if (
                  JSON.parse(
                    err.responseText
                  )?.error?.message?.value?.toLowerCase() ===
                  "entity already exists"
                ) {
                  sap.m.MessageBox.error(
                    "Material already exists. Please check and try again."
                  );
                } else {
                  sap.m.MessageBox.error(
                    "Error creating material. Please check the uploaded file and upload correct data."
                  );
                }
                throw err; // Stop further execution
              }
            }

            // Success case
            sap.m.MessageBox.success("Materials added successfully");
            this.getView().getModel("MaterialModel").setData("");
            this.byId("id_SelectedProductsForSimulation_table").setVisible(
              false
            );
            this.byId("idProductTable").setVisible(true);
            this.byId("_IDGenButton2").setVisible(false);

            const oTable = this.byId("idProductTable");
            const oBinding = oTable.getBinding("items");
            const oFilter = new sap.ui.model.Filter(
              "Simulationname",
              sap.ui.model.FilterOperator.EQ,
              this.SimulationName
            );
            oBinding.filter([oFilter]);
          } catch (error) {
            console.error("Error in onBatchSaveSelectedProduct:", error);
            sap.m.MessageToast.show(
              "Facing technical issue please refresh the page"
            );
          } finally {
            this._oBusyUpload.close();
          }
        },

        // Helper function to generate random hex color
        generateRandomHexColor: function () {
          const randomColor = Math.floor(Math.random() * 0xffffff);
          return `#${randomColor.toString(16).padStart(6, "0").toUpperCase()}`;
        },
        onDeleSeleProducts: function () {
          const isTab_1Visible = this.getView()
            .byId("id_SelectedProductsForSimulation_table")
            .getVisible();
          const isTab_2Visible = this.getView()
            .byId("idProductTable")
            .getVisible();
          if (isTab_1Visible) {
            const oModel = this.getView().getModel("MaterialModel"),
              aSelectedItems = this.getView()
                .byId("id_SelectedProductsForSimulation_table")
                .getSelectedItems();
            const oTable = this.getView().byId(
              "id_SelectedProductsForSimulation_table"
            );
            if (aSelectedItems.length === 0) {
              MessageToast.show("Please select records to delete.");
              return;
            }

            var aRecords = oModel.getProperty("/items");

            // Remove the selected records
            // Loop through the selected items and remove the corresponding records from the model
            for (var i = aSelectedItems.length - 1; i >= 0; i--) {
              var oItem = aSelectedItems[i];
              var oBindingContext = oItem.getBindingContextPath(); // Get the binding context of the selected item
              var idx = oBindingContext.split("/")[2]; // Extract the index from the path

              // Remove the record from the array using the index
              aRecords.splice(idx, 1);

              // Snippet to Set Value state None after deleting the duplicate model/material
              const tableItems = this.byId(
                "id_SelectedProductsForSimulation_table"
              ).getItems();
              tableItems.forEach((item) => {
                item.getCells()[1].setValueState("None");
              });
            }
            // Reassign serial numbers
            aRecords.forEach((record, index) => {
              record.serialNumber = index + 1; // Reassign serial numbers starting from 1
            });

            // Update the model to reflect changes in the UI
            oModel.setProperty("/items", aRecords);
            oTable.removeSelections(true);
          }
          if (isTab_2Visible) {
            const aSelectedItems = this.getView()
              .byId("idProductTable")
              .getSelectedItems();

            // TEst
            if (aSelectedItems.length < 1) {
              return MessageBox.warning(
                "Please Select atleast One Model/Prodcut"
              );
            }
            try {
              const oModel = this.getOwnerComponent().getModel();
              // Create a batch group ID to group the delete requests
              var sBatchGroupId = "deleteBatchGroup";
              // Start a batch operation
              oModel.setUseBatch(true);
              oModel.setDeferredGroups([sBatchGroupId]);
              aSelectedItems.forEach(async (item) => {
                let sPath = item.getBindingContext().getPath();
                await this.deleteData(oModel, sPath, sBatchGroupId);
              });
              // Submit the batch request
              oModel.submitChanges({
                groupId: sBatchGroupId,
                success: this._onBatchSuccess.bind(this),
                error: this._onBatchError.bind(this),
                refresh: this.byId("idProductTable")
                  .getBinding("items")
                  .refresh(),
              });
            } catch (error) {
              MessageBox.error("Facing Technical Issue");
            }
            // TEst
          }
        },
        onContainerCreate: async function () {
          let oSelectedItem = this.byId("idContianersTable").getSelectedItems();
          if (oSelectedItem.length > 0) {
            return MessageBox.warning("Please Unselect the Row For Creation");
          }
          //   if (!this.oContainerCreate) {
          //     this.oContainerCreate = await this.loadFragment("CreateContainer");
          //   }
          //   this.oContainerCreate.open();
          // },
          // /**Closing Container Fragment */
          // onCancelCreateContainer: function () {
          //   if (this.oContainerCreate.isOpen()) {
          //     this.oContainerCreate.close();

          this.getView().getModel("CombinedModel").setProperty("/Vehicle", {});
        },

        onSignoutPressed_ResourcePage: function () {
          localStorage.removeItem("loginData");
          // Navigate to the Initial Screen
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("RouteHome", {}, true);
        },

        // Function to handle the batch upload event
        onbatchUploadContainers: async function (e) {
          // Check if the fragment is already loaded; if not, load it
          if (!this.oFragmentContainer) {
            this.oFragmentContainer = await this.loadFragment(
              "ContainerXlData"
            );
          }
          // Open the fragment dialog
          this.oFragmentContainer.open();
          // Import data from the selected file
          await this._importConatinerData(
            e.getParameter("files") && e.getParameter("files")[0]
          );
        },

        // Function to import data from an Excel file
        _importConatinerData: function (file) {
          var that = this;
          var excelData = {};

          // Check if a file is provided and if FileReader is supported by the browser
          if (file && window.FileReader) {
            var reader = new FileReader();

            // On file load, process the Excel data
            reader.onload = function (e) {
              var data = new Uint8Array(e.target.result);
              var workbook = XLSX.read(data, { type: "array" });

              // Iterate through each sheet in the Excel workbook
              workbook.SheetNames.forEach(function (sheetName) {
                // Convert the sheet data to JSON format
                excelData = XLSX.utils.sheet_to_json(
                  workbook.Sheets[sheetName]
                );

                // Add serial numbers to each row of data
                excelData.forEach(function (item, index) {
                  item.serialNumber = index + 1; // Serial number starts from 1
                });
              });

              // Set the imported data to the local model and refresh the model
              that.ContainerModel.setData({ items: excelData });
              that.ContainerModel.refresh(true);
            };

            // Handle any errors during file reading
            reader.onerror = function (ex) {
              console.log(ex);
            };

            // Read the file as an ArrayBuffer
            reader.readAsArrayBuffer(file);
          }
        },
        _importContainerData: function (file) {
          var that = this;
          var excelContainerData = {};
          if (file && window.FileReader) {
            var reader = new FileReader();
            reader.onload = function (e) {
              var data = new Uint8Array(e.target.result);
              var workbook = XLSX.read(data, { type: "array" });
              workbook.SheetNames.forEach(function (sheetName) {
                excelContainerData = XLSX.utils.sheet_to_json(
                  workbook.Sheets[sheetName]
                );
                excelContainerData.forEach(function (item, index) {
                  item.serialNumber = index + 1; // Serial number starts from 1
                });
              });
              that.ContainerModel.setData({ items: excelContainerData });
              that.ContainerModel.refresh(true);
            };
            reader.onerror = function (ex) {
              console.log(ex);
            };
            reader.readAsArrayBuffer(file);
          }
        },

        onDeleUnwanted: async function () {
          const aSelectedItem =
            this.byId("idMutliProductTbl").getSelectedItem();
          let sPath = aSelectedItem.getBindingContextPath(),
            oModel = aSelectedItem.getModel("MaterialModel");
          oModel.setProperty(sPath, null); // Removes the object at this path
          this.byId("idMutliProductTbl").refresh();
        },

        // Open the Create Simulation fragment
        _openCreateSimulationFragment: async function () {
          var oView = this.getView();

          // Check if the fragment is already loaded
          if (!this._oFragmentNewSimulation) {
            // Load the fragment if it's not already loaded
            this._oFragmentNewSimulation = await this.loadFragment(
              "CreateNewSimulaton"
            );
          }
          this._oFragmentNewSimulation.open();
          this.createSimulationName();
        },

        createSimulationName: async function () {
          const oModel = this.getOwnerComponent().getModel(),
            that = this,
            now = new Date(),
            year = now.getFullYear(),
            month = String(now.getMonth() + 1).padStart(2, "0"), // Month is zero-indexed, so add 1
            day = String(now.getDate()).padStart(2, "0"),
            hours = String(now.getHours()).padStart(2, "0"),
            minutes = String(now.getMinutes()).padStart(2, "0"),
            seconds = String(now.getSeconds()).padStart(2, "0"),
            formattedDate = `${year}${month}${day}${hours}${minutes}${seconds}`;

          await oModel.read("/CM_SIMULATED_RECORDSSet", {
            success: function (oData) {
              console.log(oData);
              if (oData.results.length === 0) {
                that.SimulationName = `SML01`;
              } else {
                const numbers = oData.results.map((item) => {
                  const match = item.Simulationname.match(/SML(\d+)/);
                  return match ? parseInt(match[1], 10) : 0;
                });
                const maxNumber = Math.max(...numbers);
                if (maxNumber + 1 <= 9) {
                  that.SimulationName = `SML0${maxNumber + 1}`;
                } else {
                  that.SimulationName = `SML${maxNumber + 1}`;
                }
              }
              that
                .getView()
                .byId("simulationInput")
                .setValue(that.SimulationName);
              var oTable = that.byId("idProductTable"),
                oBinding = oTable.getBinding("items"),
                oInitialFilter = new sap.ui.model.Filter(
                  "Simulationname",
                  sap.ui.model.FilterOperator.EQ,
                  ""
                ); // to show no data
              oBinding.filter([oInitialFilter]);
            },
            error: function (oError) {
              MessageBox.information(
                "Facing technical issue please refresh the page"
              );
            },
          });
        },

        onCloseDialogSimulate: function () {
          this._oFragmentNewSimulation.close();
        },

        statusColorFormatter: function (status) {
          console.log("triggered");
          if (!status) {
            return "Warning"; // Return class for pending status
          } else {
            return "Success"; // Return class for completed status
          }
        },

        _createProducts: function (
          selectedProducts,
          containerHeight,
          containerLength,
          containerWidth,
          capacity
        ) {
          let currentX = -containerLength / 2;
          let currentZ = -containerWidth / 2;
          let currentY = 0;
          const positionMap = []; // Keeps track of occupied positions
          const chartData = [];
          let maxHeight = 0; // Max height for the current level (Y-axis tracking)
          let maxWidth = 0; // Max width for the current row (Z-axis tracking)
          let totalQuantity = 0;
          let totalVolume = 0;
          let totalWeight = 0;
          const containerMaxVolume =
            containerHeight * containerLength * containerWidth;
          const containerMaxWeight = capacity;

          selectedProducts.sort((a, b) => {
            const aVolume =
              parseFloat(a.Length) * parseFloat(a.Width) * parseFloat(a.Height);
            const bVolume =
              parseFloat(b.Length) * parseFloat(b.Width) * parseFloat(b.Height);
            return b.Netweight - a.Netweight || bVolume - aVolume;
          });

          selectedProducts.forEach((product) => {
            const SelectedQuantity = parseInt(product.Selectedquantity);
            const productLength = Math.max(parseFloat(product.Length), 0.01);
            const productHeight = Math.max(parseFloat(product.Height), 0.01);
            const productWidth = Math.max(parseFloat(product.Width), 0.01);
            const productColor = product.Color;
            const productWeight = parseFloat(product.Grossweight);
            const productName = product.Model;

            let totalChartVolume = 0;
            let totalChartWeight = 0;

            for (let i = 0; i < SelectedQuantity; i++) {
              let isPlaced = false;

              while (!isPlaced) {
                // Check if the product fits within the container's dimensions
                if (currentX + productLength > containerLength / 2) {
                  currentX = -containerLength / 2; // Reset X position to start new row
                  currentZ += maxWidth; // Shift to the next row (Z axis)

                  if (currentZ + productWidth > containerWidth / 2) {
                    currentZ = -containerWidth / 2; // Reset Z position to start new column
                    currentY += maxHeight; // Shift to the next height level (Y axis)
                    maxHeight = 0; // Reset maxHeight for new level

                    // If Y axis overflow, break out (do not place the product)
                    if (currentY + productHeight > containerHeight) {
                      console.log(
                        `Product "${productName}" cannot fit in the container.`
                      );
                      return; // Skip placing this product
                    }
                  }
                }

                // Now we check if the product fits within the container's bounds and does not overlap with other products
                const fitsX = currentX + productLength <= containerLength / 2;
                const fitsZ = currentZ + productWidth <= containerWidth / 2;
                const fitsY = currentY + productHeight <= containerHeight;

                if (fitsX && fitsZ && fitsY) {
                  // Check for overlap with previously placed products
                  const isOverlap = positionMap.some(
                    (position) =>
                      currentX < position.xEnd &&
                      currentX + productLength > position.xStart &&
                      currentZ < position.zEnd &&
                      currentZ + productWidth > position.zStart &&
                      currentY < position.yTop
                  );

                  if (!isOverlap) {
                    // Place the product
                    isPlaced = true;
                    console.log(
                      `Product placed at X: ${currentX}, Y: ${currentY}, Z: ${currentZ}`
                    );

                    // Add product to 3D scene
                    const productGeometry = new THREE.BoxGeometry(
                      productLength,
                      productHeight,
                      productWidth
                    );
                    const productMaterial = new THREE.MeshStandardMaterial({
                      color: new THREE.Color(productColor),
                      metalness: 0.5,
                      roughness: 0.5,
                    });
                    const productMesh = new THREE.Mesh(
                      productGeometry,
                      productMaterial
                    );
                    productMesh.position.set(
                      currentX + productLength / 2,
                      currentY + productHeight / 2,
                      currentZ + productWidth / 2
                    );
                    this.scene.add(productMesh);

                    // Add wireframe for visualization
                    const edgesGeometry = new THREE.EdgesGeometry(
                      productGeometry
                    );
                    const edgesMaterial = new THREE.LineBasicMaterial({
                      color: 0x000000,
                    });
                    const edges = new THREE.LineSegments(
                      edgesGeometry,
                      edgesMaterial
                    );
                    edges.position.copy(productMesh.position);
                    this.scene.add(edges);

                    // Update the occupied positions in the positionMap
                    positionMap.push({
                      xStart: currentX,
                      xEnd: currentX + productLength,
                      zStart: currentZ,
                      zEnd: currentZ + productWidth,
                      yTop: currentY + productHeight,
                    });

                    // Update maxHeight and maxWidth for the current row/level
                    maxHeight = Math.max(maxHeight, productHeight);
                    maxWidth = Math.max(maxWidth, productWidth);

                    // Update totals
                    totalQuantity++;
                    const productVolume =
                      productLength * productHeight * productWidth;
                    totalVolume += productVolume;
                    totalWeight += productWeight;
                    totalChartVolume += productVolume;
                    totalChartWeight += productWeight;

                    // Move to the next available position in the X axis for the next product
                    currentX += productLength;
                    console.log(`Moving to next X position: ${currentX}`);
                  } else {
                    // If there is overlap, move to the next X position
                    currentX += productLength;
                    console.log(`Overlap detected, moving X to: ${currentX}`);
                  }
                } else {
                  // If it doesn't fit, skip placing it (do nothing)
                  console.log(
                    `Product "${productName}" doesn't fit at the current position.`
                  );
                  return;
                }
              }
            } // Collect the product data for chart visualization

            chartData.push({
              Name: productName,
              Packages: SelectedQuantity,
              Volume: totalChartVolume.toFixed(1),
              Weight: totalChartWeight.toFixed(1),
              Color: productColor,
              Percentage: (
                (parseFloat(totalChartVolume.toFixed(1)) / containerMaxVolume) *
                100
              ).toFixed(1),
            });
          });

          const t = chartData.reduce(
            (sum, item) => sum + Number(item.Percentage),
            0
          );
          chartData.forEach((item) => console.log(item.Percentage));
          console.log("Volume", t);
          // Calculate remaining available volume and weight in the container
          const remainingVolume = containerMaxVolume - totalVolume.toFixed(2);
          console.log(remainingVolume, totalVolume);
          console.log(containerMaxVolume, "container");
          const remainingWeight = containerMaxWeight - totalWeight;
          const remainingSpacePercentage = (
            (remainingVolume / containerMaxVolume) *
            100
          ).toFixed(1);
          // Add empty space (unused space) in the chart data
          chartData.push({
            Name: "Empty",
            Packages: 0,
            Volume: remainingVolume.toFixed(2),
            Weight: 0,
            Color: "#cccccc",
            Percentage: 100 - t, // Gray color for empty space
          });
          this.byId("ReaminingTruckVolume").setText(
            `${remainingVolume.toFixed(2)}m³`
          );
          // Update the view models with total values and chart data
          this.getView()
            .getModel("ChartData")
            .setProperty("/chartData", chartData);
          this.getView()
            .getModel("Calculation")
            .setProperty("/", {
              TotalQuantity: totalQuantity,
              TotalVolume: `${totalVolume.toFixed(1)} m³ (${(
                (totalVolume / containerMaxVolume) *
                100
              ).toFixed(1)}% filled)`,
              TotalWeight: `${totalWeight.toFixed(1)} kg`,
              RemainingCapacity: `${remainingVolume.toFixed(1)} m³ (${(
                (remainingVolume / containerMaxVolume) *
                100
              ).toFixed(1)}% empty)`,
            });

          // Update pie chart visualization based on filled/empty spaces
          const oVizFrame = this.getView().byId("idPieChart");
          oVizFrame.setVizProperties({
            plotArea: {
              colorPalette: chartData.map((item) => item.Color), // Use dynamic colors
              dataLabel: {
                visible: false,
              },
            },
            // title: {
            //     text: "Cargo Volume Breakdown"
            // }
          });
        },
        // Live validation for Height in the Edit model fragment
        onEidtHeight_LC: function () {
          let sHeightInput = this.getView().byId("editprodHeightInput");
          let oHeight = sHeightInput.getValue();
          var oRegex = /^[0-9]*\.?[0-9]*$/;
          if (oRegex.test(oHeight)) {
            sHeightInput.setValueState(sap.ui.core.ValueState.Success);
          } else {
            sHeightInput.setValueState(sap.ui.core.ValueState.Error);
          }
        },
        // Live validation for Length in the Edit model fragment
        onEidtLenght_LC: function () {
          let sLenghtInput = this.getView().byId("editproLengthInput");
          let oLenght = sLenghtInput.getValue();
          var oRegex = /^[0-9]*\.?[0-9]*$/;
          if (oRegex.test(oLenght)) {
            sLenghtInput.setValueState(sap.ui.core.ValueState.Success);
          } else {
            sLenghtInput.setValueState(sap.ui.core.ValueState.Error);
          }
        },
        // Live validation for Width in the Edit model fragment
        onEidtWidth_LC: function () {
          let sWidthInput = this.getView().byId("editprodWidthInput");
          let oWidth = sWidthInput.getValue();
          var oRegex = /^[0-9]*\.?[0-9]*$/;
          if (oRegex.test(oWidth)) {
            sWidthInput.setValueState(sap.ui.core.ValueState.Success);
          } else {
            sWidthInput.setValueState(sap.ui.core.ValueState.Error);
          }
        },
        // Live validation for GrossWeight in the Edit model fragment
        onEidtGrossWeight_LC: function () {
          let sGrossWeightInput = this.getView().byId("editgrossWeightInput");
          let oGrossWeight = sGrossWeightInput.getValue();
          var oRegex = /^[0-9]*\.?[0-9]*$/;
          if (oRegex.test(oGrossWeight)) {
            sGrossWeightInput.setValueState(sap.ui.core.ValueState.Success);
          } else {
            sGrossWeightInput.setValueState(sap.ui.core.ValueState.Error);
          }
        },
        // Live validation for NetWeight in the Edit model fragment
        onEidtNetWeight_LC: function () {
          let sNetWeightInput = this.getView().byId("editnetWeightInput");
          let oNetWeight = sNetWeightInput.getValue();
          var oRegex = /^[0-9]*\.?[0-9]*$/;
          if (oRegex.test(oNetWeight)) {
            sNetWeightInput.setValueState(sap.ui.core.ValueState.Success);
          } else {
            sNetWeightInput.setValueState(sap.ui.core.ValueState.Error);
          }
        },
        // Live validation for Stack in the Edit model fragment
        onEidtStack_LC: function () {
          let sStackInput = this.getView().byId("editstackInput");
          let oStack = sStackInput.getValue();
          let oRegex = /^\d+$/;
          if (oRegex.test(oStack)) {
            sStackInput.setValueState(sap.ui.core.ValueState.Success);
          } else {
            sStackInput.setValueState(sap.ui.core.ValueState.Error);
          }
        },
        // Live validation for Lenght in the Edit Container fragment
        onEidtContainerLenght_LC: function () {
          let sContainerLenghtInput = this.getView().byId(
            "IdContainerLength_Input"
          );
          let oContainerLenght = sContainerLenghtInput.getValue();
          var oRegex = /^[0-9]*\.?[0-9]*$/;
          sContainerLenghtInput.setValueState(sap.ui.core.ValueState.None);
          if (oRegex.test(oContainerLenght)) {
            sContainerLenghtInput.setValueState(sap.ui.core.ValueState.Success);
          } else {
            sContainerLenghtInput.setValueState(sap.ui.core.ValueState.Error);
          }
        },

        onEidtContainerWidth_LC: function () {
          let sContainerWidthInput = this.getView().byId(
            "idContainerWidth_Input"
          );
          let oContainerWidth = sContainerWidthInput.getValue();
          var oRegex = /^[0-9]*\.?[0-9]*$/;

          // Reset previous error state
          sContainerWidthInput.setValueState(sap.ui.core.ValueState.None);

          if (oRegex.test(oContainerWidth)) {
            sContainerWidthInput.setValueState(sap.ui.core.ValueState.Success);
          } else {
            sContainerWidthInput.setValueState(sap.ui.core.ValueState.Error);
          }
        },

        onEidtContainerHeight_LC: function () {
          let sContainerHeightInput = this.getView().byId(
            "idContainerHeight_Input"
          );
          let oContainerHeight = sContainerHeightInput.getValue();
          sContainerHeightInput.setValueState(sap.ui.core.ValueState.None);
          var oRegex = /^[0-9]*\.?[0-9]*$/;
          if (oRegex.test(oContainerHeight)) {
            sContainerHeightInput.setValueState(sap.ui.core.ValueState.Success);
          } else {
            sContainerHeightInput.setValueState(sap.ui.core.ValueState.Error);
          }
        },

        // onEidtContainerTruckWeight_LC: function () {
        //   let sContainerTruckWeightInput = this.getView().byId("idContainerTruckWeight_Input");
        //   let oContainerTruckWeight = sContainerTruckWeightInput.getValue();
        //   var oRegex = /^[0-9]*\.?[0-9]*$/;
        //   if (oRegex.test(oContainerTruckWeight)) {
        //     sContainerTruckWeightInput.setValueState(sap.ui.core.ValueState.Success)
        //   }
        //   else {
        //     sContainerTruckWeightInput.setValueState(sap.ui.core.ValueState.Error)

        //   }
        // },

        onEidtContainerCapacity_LC: function () {
          let sContainerCapacityInput = this.getView().byId(
            "idContainerCapacity_Input"
          );
          let oContainerCapacity = sContainerCapacityInput.getValue();
          var oRegex = /^[0-9]*\.?[0-9]*$/;
          sContainerCapacityInput.setValueState(sap.ui.core.ValueState.None);
          if (oRegex.test(oContainerCapacity)) {
            sContainerCapacityInput.setValueState(
              sap.ui.core.ValueState.Success
            );
          } else {
            sContainerCapacityInput.setValueState(sap.ui.core.ValueState.Error);
          }
        },
        //close Models upload Fragment
        /** Deleting Models */
        onModelDelete: async function () {
          let oSlectedItems = this.byId("idModelsTable").getSelectedItems();
          if (oSlectedItems.length < 1) {
            return MessageBox.warning(
              "Please Select atleast One Model/Prodcut"
            );
          }
          try {
            await new Promise((resolve) => setTimeout(resolve, 500));

            const oModel = this.getView().getModel();
            // Create a batch group ID to group the delete requests
            var sBatchGroupId = "deleteBatchGroup";
            // Start a batch operation
            oModel.setUseBatch(true);
            oModel.setDeferredGroups([sBatchGroupId]);
            oSlectedItems.forEach(async (item) => {
              let sPath = item.getBindingContext().getPath();
              await this.deleteData(oModel, sPath, sBatchGroupId);
            });
            // Submit the batch request
            oModel.submitChanges({
              groupId: sBatchGroupId,
              success: this._onBatchSuccess.bind(this),
              error: this._onBatchError.bind(this),
              refresh: this.byId("idModelsTable").getBinding("items").refresh(),
            });
          } catch (error) {
            MessageBox.error("Technical deletion error");
          } finally {
            this._oBusyDialog.close();
          }
        },

        // Success callback after the batch request
        _onBatchSuccess: function (oData) {
          MessageToast.show("successfully Deleted");
        },

        // Error callback after the batch reques
        _onBatchError: function (oError) {
          MessageToast.show("Batch delete failed. Please try again.");
        },

        onClosePressXlData: function () {
          if (this.oFragment.isOpen()) {
            this.oFragment.close();
          }
        },
        //completed material batch
        // Round Of Value Start
        // Helper function to round the number to a specific number of decimals

        roundToDecimals: function (num, decimals) {
          var factor = Math.pow(10, decimals);
          return Math.round(num * factor) / factor;
        },

        getDecimalPlaces: function (num) {
          var str = num.toString();
          var decimalIndex = str.indexOf(".");
          return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
        },

        roundOfValue: function (oValue) {
          var fValue = parseFloat(oValue);
          if (!isNaN(fValue)) {
            if (this.getDecimalPlaces(fValue) > 3) {
              fValue = this.roundToDecimals(fValue, 3);
            }
            return fValue.toString();
          }
        },

        onManualSimulation: function (oEvent) {
          debugger;
          const oUserId = this.ID;
          //const simName = this.simID;
          var name = this.byId("idCurrentSimName")
            .getText()
            .split(":")[1]
            .trim();
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("RouteManualSimulationDetails", {
            // id: oUserId,
            simulationName: name,
          });
        },

        onPressDelete: function () {
          var oTable = this.byId("idSimulationtable");
          var aSelectedItems = oTable.getSelectedItems();
          if (aSelectedItems.length > 0) {
            var oModel = this.getView().getModel();
            var aDeletePaths = [];
            aSelectedItems.forEach(function (oSelectedItem) {
              var oContext = oSelectedItem.getBindingContext();
              var sPath = oContext.getPath();
              aDeletePaths.push(sPath);
            });
            console.log(aDeletePaths);
            var iCount = aDeletePaths.length;
            var that = this;
            async function deleteNext() {
              if (aDeletePaths.length > 0) {
                var sPath = aDeletePaths.pop();
                await oModel.update(
                  sPath,
                  {
                    isDelete: true,
                  },
                  {
                    success: function () {
                      iCount--;
                      if (iCount === 0) {
                        sap.m.MessageToast.show(
                          "All selected records deleted successfully"
                        );
                      }
                      deleteNext();
                    },
                    error: function (oError) {
                      sap.m.MessageToast.show("Error deleting record");
                    },
                  }
                );
              }
            }

            deleteNext();
          } else {
            sap.m.MessageToast.show("No records selected");
          }
        },
        onModelSubmit: function(oEvent) {
          var that =this
          const oView = this.getView();
          const oCombinedModel = oView.getModel("CombinedModel");
          const oODataModel = this.getOwnerComponent().getModel();
          const sProductId = oEvent.getParameter("value");
          
          // Clear previous values while loading new ones
         
          
          oODataModel.read(`/CM_MARASet('${sProductId}')`, {
              success: function(oData) {
                  // Update the combined model with the retrieved data
                  oCombinedModel.setProperty("/Product", {
                      Model: sProductId,
                      Description: oData.Description || "",
                      Length: oData.Laeng || "",
                      Width: oData.Breit || "",
                      Height: oData.Hoehe || "",
                      Volume: oData.Volum|| "",
                      Mcategory: oData.Extwg || "",
                      Netweight: oData.Ntgew || "",
                      Grossweight: oData.Brgew || "",
                      Stack: oData.Stack || "",
                      Bearingcapacity: oData.Bearingcapacity || "",
                  });
                 
                  oView.byId("idInputForModelLengUnits").setValue(oData.Meabm);
                  oView.byId("idInputForModelWidthUnits").setValue(oData.Meabm);
                  oView.byId("idInputForModelHeightUnit").setValue(oData.Meabm);
                  oView.byId("idInputForModelNetWeightUnits").setValue(oData.Gewei);
                  oView.byId("idInputForModelGrossWeightUnits").setValue(oData.Gewei);
              },
              error: function(oError) {
                  MessageToast.show("Product not found");
                  // Clear the input if product not found
                  oCombinedModel.setProperty("/Product/Model", "");
              }
          });
      }
      }
    );
  }
);
