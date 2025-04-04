sap.ui.define(
  [
    "./BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/f/library",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (
    BaseController,
    MessageBox,
    MessageToast,
    JSONModel,
    fioriLibrary,
    Filter,
    FilterOperator
  ) {
    "use strict";

    return BaseController.extend(
      "com.app.capacitymanagement.controller.SimulationDetails",
      {
        onInit() {
          // var oToolbar = this.byId("_IDGenToolbar");
          // oToolbar.addStyleClass("blackBackground");

          const oChartData = new JSONModel({
            aSelectedObject: [],
          });
          this.getView().setModel(oChartData, "ChartModel");

          var oViewModel = new sap.ui.model.json.JSONModel({
            selectedTab: "shipping", // Default tab is 'shipping'
          });
          this.getView().setModel(oViewModel, "detailView");
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.attachRoutePatternMatched(
            this.onSimulationDetailsLoad_CM,
            this
          );

          //Background for the Icons are Tarnsparent..
          var icontoolheaders_SimulatedPage = [
            this.getView().byId(
              "container-com.sap.capacitymanagementapp---SimulationDetails--idIconTabBar--header"
            ),
          ];
          // // Loop through the array and apply the same logic to each control
          // icontoolheaders_SimulatedPage.forEach(function (header) {
          //   header.setBackgroundDesign(sap.m.BackgroundDesign.Transparent);
          // });
        },

        onSelect: function (oEvent) {
          var oSelectedItem = oEvent.getParameter("selectedItem"),
            selectedText = oSelectedItem.getText();
          if (selectedText === "Data Visualization") {
            this.onDataVisualization();
          }
          console.log(selectedText);
        },
        // onSimulationDetailsLoad_CM: async function (oEvent) {
        //   debugger;
        //   // var oIconTabBar = this.byId("iconTabBar");
        //   // oIconTabBar.setSelectedKey("ProductDetails");
        //   var oModel = this.getOwnerComponent().getModel(),
        //     oView = this.getView();
        //   const { id, simID } = oEvent.getParameter("arguments");
        //   this.ID = id;
        //   this.simID = simID;

        //   this.applyStoredProfileImage();
        //   this.onLoadUserDetailsBasedOnUserID_CM();

        //   // Fetch data using simID and store it in a variable
        //   var oSimulatedRecordData;
        //   var oSimulatedRecordModel = new sap.ui.model.json.JSONModel();
        //   oModel.read(`/SimulatedRecords('${this.simID}')`, {
        //     success: function (oData) {
        //        console.log("Fetched Simulation Data:", oData);
        //       // Set the fetched data into the JSON model
        //       oSimulatedRecordModel.setData(oData);
        //       // Set the model to the view so it can be accessed in UI
        //       oView.setModel(oSimulatedRecordModel, "SimulatedRecord");
        //     },
        //     error: function (oError) {
        //       console.error("Error fetching simulation data:", oError);
        //     }
        //   });
        //   return oSimulatedRecordData;  // Optional: Return the data if needed
        // },
        onSimulationDetailsLoad_CM: async function (oEvent) {
          var oIconTabBar = this.byId("iconTabBar");
          oIconTabBar.setSelectedKey("ProductDetails");
          debugger;
          var oModel = this.getOwnerComponent().getModel(),
            oView = this.getView();
          const { id, simID } = oEvent.getParameter("arguments");
          this.ID = id;
          this.simID = simID;

          this.applyStoredProfileImage();
          this.onLoadUserDetailsBasedOnUserID_CM();

          //For the SMLName and Date Time for the SimulationDetails Page...
          var oSimulatedRecordModel = new sap.ui.model.json.JSONModel();
          oModel.read(`/SimulatedRecords('${this.simID}')`, {
            success: function (oData) {
              //console.log("Fetched Simulation Data:", oData);

              // Extract Simulation Name & Created At
              const { simulationName, createdAt, createdBy } = oData;
              const oSMLNameWithoutDT = simulationName.split("_")[0]; //for the Simulation Name only like "SML1" instead of "SML1_2023393993"

              // Format createdAt into separate Date and Time
              const oDate = new Date(createdAt);
              const userLocale = navigator.language || "en-GB"; // Detect User Locale

              const sFormattedDate = new Intl.DateTimeFormat(userLocale, {
                year: "numeric",
                month: "short",
                day: "numeric",
              }).format(oDate);
              const sFormattedTime = new Intl.DateTimeFormat(userLocale, {
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                hour12: true,
              }).format(oDate);

              // Set Data to JSON Model
              oSimulatedRecordModel.setData({
                oSMLNameWithoutDT,
                sFormattedDate,
                sFormattedTime,
                createdBy,
              });

              // Set the model to the view
              oView.setModel(oSimulatedRecordModel, "SimulatedRecord");
            },
            error: function (oError) {
              console.error("Error fetching simulation data:", oError);
            },
          });
          var oTable = this.byId("idproductTable");
          var oBinding = oTable.getBinding("items");
          var oFilter = new Filter(
            "simulationName_simulationName",
            FilterOperator.EQ,
            simID
          );
          oBinding.filter([oFilter]);

          var oTable = this.byId("idcontainerTable");
          var oBinding = oTable.getBinding("items");
          var oFilter = new Filter("simulationName", FilterOperator.EQ, simID);
          oBinding.filter([oFilter]);
        },
        // onAfterRendering:function(){
        //   this.getView().byId("idpageTitle").setText(this.simID)
        // },

        onTabSelect: function (oEvent) {
          var selectedKey = oEvent.getParameter("key"); // Get the selected tab's key
          this.getView()
            .getModel("detailView")
            .setProperty("/selectedTab", selectedKey); // Update the selected tab in the model
        },

        onAvatarPress_CM_SimulationPage: function (oEvent) {
          var oComponent = this.getOwnerComponent();
          // Destroy the existing popover if it exists
          if (oComponent.getPopover()) {
            oComponent.getPopover().destroy();
            oComponent.setPopover(null);
          }

          // Call the reusable function from BaseController
          this.onPressAvatarPopOverBaseFunction(oEvent);
        },

        onPressNavBackMainPg: function () {
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("RouteMainPage", {
            id: this.ID,
          });
          this.byId("VBoxChart_sv").setVisible(false);
          this.getView().getModel("ChartModel").setProperty("/", {});
        },
        onDataVisualization() {
          const oView = this.getView();
          const oTable = oView.byId("idproductTable");
          const oContainerTable = oView.byId("idcontainerTable");

          // Get the truck type object to retrieve its volume and capacity
          const oContainerObject = oContainerTable
            .getItems()[0]
            .getBindingContext()
            .getObject("truckType");
          let oTruckVolume = Number(oContainerObject.volume); // Ensure it's a number
          let oTruckWeight = Number(oContainerObject.capacity); // Ensure it's a number

          let aTableItems = oTable.getItems();

          // Log table items for debugging
          console.log(aTableItems);

          let aSelectedObject = [];

          // Initialize total remaining volume and weight
          let totalVolumeUsed = 0;
          let totalWeightUsed = 0;

          // Process each item in the table
          aTableItems.forEach((item) => {
            let oRowContext = item.getBindingContext();
            if (!oRowContext) return; // Skip if no context
            console.log("Bye", oRowContext.getObject().SelectedQuantity);
            let oRowObject = oRowContext.getObject("Productno");
            console.log("sreedhar", oRowObject);

            let t = oRowContext.getObject().SelectedQuantity;
            // Destructure properties safely with defaults
            const { model, volume = 0, grossWeight = 0 } = oRowObject || {};
            let oRSelObject = oRowContext.getProperty();
            let oSelectedQuantity = oRSelObject.SelectedQuantity || 0; // Default to 0 if undefined
            let oColor = oRSelObject.Color || "#000000"; // Provide a default color if none (black)

            // Calculate new values based on selected quantity
            let newVolume = Number(volume) * Number(oSelectedQuantity);
            let newGrossWeight =
              Number(grossWeight) * Number(oSelectedQuantity);

            // Accumulate total used volume and weight
            totalVolumeUsed += newVolume;
            totalWeightUsed += newGrossWeight;

            // Push new object into array for chart data
            aSelectedObject.push({
              model: model,
              Color: oColor,
              quantity: t,
              volume: newVolume,
              grossWeight: newGrossWeight,
              SelectedQuantity: oSelectedQuantity,
            });
          });

          // Calculate remaining volume and weight in the truck
          let remainingVolume = Math.max(0, oTruckVolume - totalVolumeUsed);
          let remainingWeight = Math.max(0, oTruckWeight - totalWeightUsed);

          // Add empty space (unused space) in the chart data if there's remaining volume
          if (remainingVolume > 0) {
            aSelectedObject.push({
              model: "Empty",
              Color: "#cccccc", // Gray color for unused space
              volume: remainingVolume,
              grossWeight: 0,
              SelectedQuantity: 0,
            });
          }

          // Update chart model with selected data
          const chartModel = oView.getModel("ChartModel");
          chartModel.setProperty("/aSelectedObject", aSelectedObject);

          // Show or hide the chart based on data availability
          oView.byId("VBoxChart_sv").setVisible(true);

          // Update VizFrame properties dynamically
          const oVizFrame = oView.byId("idPieChart_sv");
          oVizFrame.setVizProperties({
            plotArea: {
              colorPalette: aSelectedObject.map((item) => item.Color), // Use dynamic colors from selected objects
              dataLabel: {
                visible: true,
              },
            },
            title: {
              text: "Container Volume Breakdown",
            },
          });
        },

        //FOR DOWNLOADING PDF for Product/Model Details
        onPressBtnPDFDownloadPreviousModelsData: async function () {
          debugger;
          const oSimulationID = this.simID;
          const oModel2 = this.getOwnerComponent().getModel();
          const oSimulationData = await new Promise((resolve, reject) => {
            oModel2.read("/SimulatedRecords", {
              success: resolve,
              error: reject,
            });
          });
          // Find user data based on userID
          const oSingleSimulationData = oSimulationData.results.find(
            (Simulation) => Simulation.simulationName === oSimulationID
          );
          this.oCreatedBy = oSingleSimulationData.createdBy;
          const oCreatedAt = oSingleSimulationData.createdAt;

          // Format createdAt into separate Date and Time
          const oDate = new Date(oCreatedAt);
          const userLocale = navigator.language || "en-GB"; // Detect User Locale

          this.sFormattedDatePDF = new Intl.DateTimeFormat(userLocale, {
            year: "numeric",
            month: "short",
            day: "numeric",
          }).format(oDate);
          this.sFormattedTimePDF = new Intl.DateTimeFormat(userLocale, {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true,
          }).format(oDate);

          var oView = this.getView();
          var oTable = oView.byId("idproductTable");

          if (oTable) {
            var pdfDoc = this.FormatforThePDF(oTable);
            pdfDoc.save("ProductTableData.pdf"); // Save the PDF locally
          } else {
            console.error("Table element not found. Check the ID.");
          }
        },

        // Function to prepare the formatted PDF document
        FormatforThePDF: function (oTable) {
          var { jsPDF } = window.jspdf;
          var doc = new jsPDF({
            orientation: "portrait",
            unit: "px",
            format: "a4",
          });

          // Company logo in the top-right corner
          var logoUrl = "https://i.ibb.co/rKr8ZrK9/Daikin-removebg-preview.png";
          var logoWidth = 90;
          var logoHeight = 60;
          doc.addImage(logoUrl, "PNG", 320, 40, logoWidth, logoHeight);

          // Set font and add Simulation Details in the top-left corner
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text("Simulation Details:", 20, 40);

          doc.setFontSize(12);
          doc.setFont("helvetica", "normal");
          doc.text(`Simulation Name: ${this.simID}`, 20, 55);
          doc.text(`Created By: ${this.oCreatedBy}`, 20, 70);
          doc.text(`Date: ${this.sFormattedDatePDF}`, 20, 85);
          doc.text(`Time: ${this.sFormattedTimePDF}`, 20, 100);

          // Draw a line separator
          doc.setLineWidth(0.5);
          doc.line(20, 130, 425, 130);

          // Extract table data and format it
          var tableData = this.onAutoBindingTheTableData(oTable);

          // Add table to PDF
          doc.autoTable({
            startY: 150,
            head: [tableData.columns],
            body: tableData.rows,
            theme: "grid",
            styles: { fontSize: 10 },
            headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
          });

          return doc; // Return the formatted document
        },

        // Function to extract table data
        onAutoBindingTheTableData: function (oTable) {
          var columns = [
            "Product ID",
            "Product Description",
            "Quantity(Pcs)",
            "Volume(m³)",
          ];
          var rows = [];

          // Get row data
          oTable.getItems().forEach(function (item) {
            var cells = item.getCells();
            var rowData = [
              cells[0].getText(), // Product ID
              cells[1].getText(), // Product Description
              cells[2].getText(), // Quantity
              cells[3].getText(), // Volume
            ];
            rows.push(rowData);
          });

          return { columns: columns, rows: rows };
        },
      }
    );
  }
);
