sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",

], function (Controller, Fragment, Filter, FilterOperator, MessageBox, MessageToast) {
    'use strict';

    return Controller.extend("com.app.capacitymanagement.controller.BaseController", {
        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        },
        onInit: function () {

        },
        
        //Fully Load USER DETAILS based on USERID from the Database...
        onLoadUserDetailsBasedOnUserID_CM: async function () {
            const oUserID = this.ID;
            const oModel = this.getOwnerComponent().getModel();
            try {
                const userData = await new Promise((resolve, reject) => {
                    oModel.read("/Users", {
                        success: resolve,
                        error: reject
                    });
                });

                // Find user data based on userID
                const user = userData.results.find((user) => user.userID === oUserID);
                const oUserSelectedTheme = user.backGroundTheme; // Assume this is where the color is stored
                //const Backgroundimage = user.BackgroundImage; 

                var aAvailableThemes = [
                    "sap_fiori_3",
                    "sap_belize_plus",
                    "sap_fiori_3_dark",
                    "sap_belize",
                    "sap_belize_hcw",
                    "sap_belize_hcb",
                    "sap_horizon",
                    "sap_fiori_4_dark"
                ];

                const oUserPastSelectedTheme = aAvailableThemes.includes(oUserSelectedTheme) ? oUserSelectedTheme : sap.ui.getCore().getConfiguration().getTheme();
                sap.ui.getCore().applyTheme(oUserPastSelectedTheme);
            } catch (oError) {
                console.error("Error fetching user data:", oError);
                //sap.m.MessageToast.show("Failed to retrieve user details.");
            }
        },
        //Applying the saved prfile picture to frontand avatars from the backend table with based on user id...
        applyStoredProfileImage: async function () {
            debugger
            var oView = this.getView();
            const oUserID = this.ID; // Assuming this.ID holds the user ID
            var oModel = this.getOwnerComponent().getModel();
            try {
                const userData = await new Promise((resolve, reject) => {
                    oModel.read("/Users", {
                        success: resolve,
                        error: reject
                    });
                });

                const user = userData.results.find((user) => user.userID === oUserID);

                if (user) {
                    const storedImage = user.profileImage;
                    // Find all `sap.m.Avatar` controls in the view
                    var allAvatars = oView.findElements(true, function (element) {
                        return element.isA("sap.m.Avatar");
                    });
                    if (storedImage) {
                        // Apply the stored image if available
                        const oStoredBase64Image = `data:image/png;base64,${storedImage}`;
                        allAvatars.forEach(function (avatar) {
                            avatar.setSrc(oStoredBase64Image);
                        });
                    } else {
                        // Profile image not available, set initials from `lname` and `fname`
                        const lastname = user.lName || "";
                        const firstname = user.fName || "";
                        const initials = (firstname[0]).toUpperCase() + (lastname[0]).toUpperCase();

                        allAvatars.forEach(function (avatar) {
                            avatar.setInitials(initials); // Set initials to the avatar
                        });
                    }
                } else {
                    sap.m.MessageToast.show("User not found.");
                }
            } catch (error) {
                sap.m.MessageToast.show("Error fetching user data");
                console.error("Error fetching user data:", error);
                sap.m.MessageToast.show("Failed to apply profile image.");
            }
        },

        //This is a helper function that used in ACCOUNT DETAILS & User CUSTOME SETTINGS functions...
        fetchUserData_BindToModel: async function (oUserID) {
            const oModel1 = this.getOwnerComponent().getModel();

            try {
                const oUserdata = await new Promise((resolve, reject) => {
                    oModel1.read("/Users", {
                        success: resolve,
                        error: reject,
                    });
                });
                const user = oUserdata.results.find((user) => user.userID === oUserID);
                if (!user) {
                    throw new Error("User not found");
                }

                // Return the JSONModel with user data
                return new sap.ui.model.json.JSONModel({
                    oUserID: user.userID,
                    firstName: user.fName,
                    lastName: user.lName,
                    PhNumber: user.phoneNo,
                    UserMail: user.mailID,
                });
            } catch (error) {
                sap.m.MessageToast.show("Error fetching user data");
                console.error("Error fetching user data:", error);
                throw error;
            }
        },

        createData: function (oModel, oPayload, sPath) {
            return new Promise((resolve, reject) => {
                oModel.create(sPath, oPayload, {
                    refreshAfterChange: true,
                    success: function (oSuccessData) {
                        resolve(oSuccessData);
                    },
                    error: function (oErrorData) {
                        reject(oErrorData)
                    }
                })
            })
        },
        deleteData: function (oModel, sPath, sBatchID) {
            return new Promise((resolve, reject) => {
                oModel.remove(sPath, {
                    groupId: sBatchID,
                    success: function (oSuccessData) {
                        resolve(oSuccessData);
                    },
                    error: function (oErrorData) {
                        reject(oErrorData)
                    }
                })
            })
        },
        updateData: function (oModel, oPayload, sPath) {
            return new Promise((resolve, reject) => {
                oModel.update(sPath, oPayload, {
                    success: function (oSuccessData) {
                        resolve(oSuccessData);
                    },
                    error: function (oErrorData) {
                        reject(oErrorData);
                    }
                })
            })
        },
        readData: function (oModel, sPath, oFilter) {
            return new Promise((resolve, reject) => {
                oModel.read(sPath, {
                    filters: [oFilter],
                    success: function (oSuccessData) {
                        resolve(oSuccessData)
                    }, error: function (oErrorData) {
                        reject(oErrorData)
                    }

                })
            })
        },
        loadFragment: async function (sFragmentName) {
            const oFragment = await Fragment.load({
                id: this.getView().getId(),
                name: `com.app.capacitymanagement.fragment.${sFragmentName}`,
                controller: this,
            });
            this.getView().addDependent(oFragment);
            return oFragment;
        },

        validateField: function (oView, fieldId, value, regex, errorMessage) {
            const validationErrors = [];
            if (!fieldId) {
                if (!value || (regex && !regex.test(value))) {
                    validationErrors.push(errorMessage);
                }
                return validationErrors
            } else {
                // Validation
                const oField = oView.byId(fieldId);
                if (!value || (regex && !regex.test(value))) {
                    oField.setValueState("Error");
                    oField.setValueStateText(errorMessage);
                    validationErrors.push(errorMessage);
                } else {
                    oField.setValueState("None");
                }
                return validationErrors
            }

        },
        //User settings OPENS Btn from Profile Popover...
        onPressUserCustomeSettings_CM: async function () {
            const oUserID = this.ID;

            try {
                sap.ui.core.BusyIndicator.show(0);
                // Fetch user data using the helper function
                const oUserSetingsModel = await this.fetchUserData_BindToModel(oUserID);

                // Load the fragment asynchronously if not already loaded
                if (!this.oUserSettingsFragment) {
                    this.oUserSettingsFragment = await this.loadFragment("UserCustomeSettings");
                }

                // Set the model to the fragment
                this.oUserSettingsFragment.setModel(oUserSetingsModel, "oUserSetingsModel");
                this.oUserSettingsFragment.open();
            } catch (error) {
                sap.m.MessageToast.show("Unable to open User Settings");
            } finally {
                sap.ui.core.BusyIndicator.hide();
            }
            this.applyStoredProfileImage();
        },
        //Decline(CLOSE) Btn from the User cutome Settings Fragment...
        onPressDeclin_UsrCustomeSettings_CM: function () {
            debugger
            this.onUserStoredTheme();
            this.onResetSelectedColour_UsrCustomeSettings_CM();
            this.oUserSettingsFragment.close();
        },
        /* If user selects a theme from the options then it previews only, 
         * while user just do not apply & just click on the decline btn it become back.. */
        onUserStoredTheme: async function () {
            const oUserID = this.ID;
            const oModel = this.getOwnerComponent().getModel();
            // Fetch user data from the backend
            const oUserdata = await new Promise((resolve, reject) => {
                oModel.read("/Users", {
                    success: resolve,
                    error: reject,
                });
            });

            const user = oUserdata.results.find((user) => user.userID === oUserID);
            const oPreviousTheme = (user && user.backGroundTheme && user.backGroundTheme.trim() !== "") ? user.backGroundTheme : "sap_fiori_3";
            sap.ui.getCore().applyTheme(oPreviousTheme);
        },

        //which Navigates from the UserCustomeSettingsFragment...
        onItemSelectFragment: async function (event) {
            const selectedKey = event.getParameter("item").getKey();
            const oNavContainer = this.byId("idNavcontainerUsrCustomeSettings_CM");
            await this.onUserStoredTheme();
            this.onResetSelectedColour_UsrCustomeSettings_CM();

            // Navigate to the corresponding page based on the selected key
            switch (selectedKey) {
                case "Home":
                    oNavContainer.to(this.byId("idPageUserHomeUsrCustomeSettings_CM"));
                    break;
                case "Appearance":
                    oNavContainer.to(this.byId("idPageUserAppearanceUsrCustomeSettings_CM"));
                    break;
                case "Help":
                    oNavContainer.to(this.byId("idPageUserHelpUsrCustomeSettings_CM"));
                    break;
                default:
                    break;
            }
        },
        //Applying Theming to the Application..
        onPressSelectedColour: function (oEvent) {
            const oTile = oEvent.getSource();
            const sHeader = oTile.getHeader(); // Assuming the header holds the theme name
            this.selectedTheme = sHeader; // Store the header as the selected theme

            // Clear the selection effect from previously selected tiles
            const aItems = this.byId("idVBoxColorOptionsUsrCustomeSettings_CM").getItems(); // Get all items in the VBox
            aItems.forEach(oHBox => {
                if (oHBox.isA("sap.m.HBox")) {
                    const oHBoxTile = oHBox.getItems()[0]; // Assuming the first item is the tile
                    const oTileDomRef = oHBoxTile.getDomRef();
                    if (oTileDomRef) {
                        // Remove the 'selected-tile' class and any tick marks
                        oTileDomRef.classList.remove("selected-tile");
                        const tickMark = oTileDomRef.querySelector(".tick-mark");
                        if (tickMark) {
                            tickMark.remove();
                        }
                    }
                }
            });

            // Apply the selection effect to the clicked tile
            const oTileDom = oTile.getDomRef();
            if (oTileDom) {
                oTileDom.classList.add("selected-tile");
                const tickMark = document.createElement("div");
                tickMark.className = "tick-mark";
                tickMark.innerHTML = "&#10004;"; // Unicode for checkmark
                oTileDom.appendChild(tickMark);
            }

            sap.ui.getCore().applyTheme(this.selectedTheme);

            // Show a message with the selected theme
            //sap.m.MessageToast.show(`Selected Theme: ${sHeader}`);
        },
        //this btn is commented but keep this...
        onResetSelectedColour_UsrCustomeSettings_CM: function () {
            this.selectedTheme = null;
            // Get all HBox items in the VBox
            const aItems = this.byId("idVBoxColorOptionsUsrCustomeSettings_CM").getItems();
            aItems.forEach(oHBox => {
                if (oHBox.isA("sap.m.HBox")) {
                    const oTile = oHBox.getItems()[0]; // Assuming the first item is the tile
                    const oTileDomRef = oTile.getDomRef();
                    // Remove styling and tick mark from each tile
                    if (oTileDomRef) {
                        oTileDomRef.classList.remove("selected-tile");
                        const tickMark = oTileDomRef.querySelector(".tick-mark");
                        if (tickMark) {
                            tickMark.remove();
                        }
                    }
                }
            });
            //sap.m.MessageToast.show("Selection has been reset.");
        },
        onApplySelectedColour_UsrCustomeSettings_CM: async function () {
            debugger;
            if (!this.selectedTheme) {
                sap.m.MessageToast.show("Please select a theme first!");
                return;
            }
            const oUserID = this.ID;
            const oModel = this.getOwnerComponent().getModel();
            // Fetch user data from the backend
            const oUserdata = await new Promise((resolve, reject) => {
                oModel.read("/Users", {
                    success: resolve,
                    error: reject,
                });
            });

            const user = oUserdata.results.find((user) => user.userID === oUserID);
            const oUserPath = user.ID;
            var aAvailableThemes = [
                "sap_fiori_3",
                "sap_belize_plus",
                "sap_fiori_3_dark",
                "sap_belize",
                "sap_belize_hcw",
                "sap_belize_hcb",
                "sap_horizon",
                "sap_fiori_4_dark"
            ];

            const oUserCurrentSelectedTheme = aAvailableThemes.includes(this.selectedTheme) ? this.selectedTheme : sap.ui.getCore().getConfiguration().getTheme();
            // Payload to update the backgroundTheme in the database
            const oPayload = {
                backGroundTheme: oUserCurrentSelectedTheme // Selected color
            };
            try {
                sap.ui.core.BusyIndicator.show(0);
                const selectedTheme = oUserCurrentSelectedTheme;
                // Apply the selected theme globally
                if (!selectedTheme) {
                    selectedTheme = selectedTheme ? selectedTheme : sap.ui.getCore().getConfiguration().getTheme();
                }
                sap.ui.getCore().applyTheme(selectedTheme);

                await new Promise((resolve, reject) => {
                    oModel.update(`/Users(${oUserPath})`, oPayload, {
                        success: resolve,
                        error: reject
                    });
                });
                this.oUserSettingsFragment.close();
                sap.m.MessageToast.show("Theme applied successfully!");
            } catch (error) {
                sap.m.MessageToast.show("Error updating theme in the database.");
                console.error("Error updating theme:", error);
            } finally {
                sap.ui.core.BusyIndicator.hide();
            }
        },

        //Base function for opening the Profile PopOver..
        onPressAvatarPopOverBaseFunction: async function (oEvent) {
            var This = this;
            const oUserId = This.ID;
            var oView = This.getView();
            const oModel1 = this.getOwnerComponent().getModel();

            try {
                const data = await new Promise((resolve, reject) => {
                    oModel1.read("/Users", {
                        success: resolve,
                        error: reject,
                    });
                });

                const user = data.results.find((user) => user.userID === oUserId);
                const oProfileModel = new sap.ui.model.json.JSONModel({
                    Name: `${user.fName} ${user.lName}`,
                    Number: user.phoneNo,
                });

                if (!this.oPopoverUserDetailsFragment) {
                    this.oPopoverUserDetailsFragment = await this.loadFragment("ProfileDialog");
                }

                this.oPopoverUserDetailsFragment.setModel(oProfileModel, "profile");
                this.oPopoverUserDetailsFragment.openBy(oEvent.getSource());
            } catch (error) {
                sap.m.MessageToast.show("Error fetching user data");
                console.error("Error while opening the popover:", error);
            }
            this.applyStoredProfileImage();
        },
        //Account Details press function from popover and Bind the data from the Helper Function...
        onPressAccountDetails_CM: async function () {
            const oUserID = this.ID;

            try {
                sap.ui.core.BusyIndicator.show(0);
                // Fetch user data using the helper function
                const oProfileModel = await this.fetchUserData_BindToModel(oUserID);

                // Load the fragment asynchronously if not already loaded
                if (!this.oUserDetailsFragment) {
                    this.oUserDetailsFragment = await this.loadFragment("UserDetails");
                }

                // Set the model to the fragment
                this.oUserDetailsFragment.setModel(oProfileModel, "oUserModel");
                this.oUserDetailsFragment.open();
            } catch (error) {
                sap.m.MessageToast.show("Unable to open Account Details");
            } finally {
                sap.ui.core.BusyIndicator.hide();
            }
            this.applyStoredProfileImage();
        },
        //Close the Account Details Dailog Box...
        onPressDeclineProfileDetailsDailog_CM: function () {
            if (this.oUserDetailsFragment) {
                this.oUserDetailsFragment.close();
            }
            this.onPressCancelProfileDetails_CMPage();
        },
        //Hover Effect btn function(from Popover)...
        onPressPopoverProfileImageAvatar_CM: function () {
            const This = this;
            const oModel1 = This.getOwnerComponent().getModel();
            const oUserID = This.ID;
            var fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.style.display = "none";
            // Add event listener to handle the file selection
            fileInput.addEventListener("change", async (event) => {
                if (fileInput.files.length > 1) {
                    sap.m.MessageToast.show("Please select only one image.");
                    return;
                }
                const selectedFile = event.target.files[0];
                if (selectedFile) {
                    const MAX_FILE_SIZE = 2 * 1024 * 1024;   // 2MB
                    if (selectedFile.size > MAX_FILE_SIZE) {
                        sap.m.MessageToast.show("Please choose an image below 2MB.");
                        return; // Stop further processing if the file size exceeds 2MB
                    }
                    try {
                        // Step 1: Compress the image
                        const compressedFile = await this.compressImage(selectedFile);
                        console.log("Compressed image size:", compressedFile.size);
                        // Step 2: Convert the compressed image to Base64
                        const reader = new FileReader();
                        reader.onload = async (e) => {
                            const selectedImageBase64 = e.target.result; // Base64 image
                            // Update all avatar images with the new Base64 image
                            This.updateAllAvatarImages(selectedImageBase64);
                            // Clean the Base64 data for backend storage
                            const cleanBase64 = selectedImageBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
                            // Payload to send to the backend
                            const oPayload = { profileImage: cleanBase64 };
                            // Retrieve user data and find the user path by ID
                            const oUserdata = await new Promise((resolve, reject) => {
                                oModel1.read("/Users", { success: resolve, error: reject });
                            });
                            const user = oUserdata.results.find((user) => user.userID === oUserID);
                            const oUserPath = user.ID;
                            // Update the user's profile image URL in the backend
                            await new Promise((resolve, reject) => {
                                oModel1.update(`/Users('${oUserPath}')`, oPayload, { success: resolve, error: reject, });
                            });
                            sap.m.MessageToast.show("Profile image updated successfully.");
                        };
                        reader.readAsDataURL(compressedFile);
                    } catch (error) {
                        sap.m.MessageToast.show("Failed to update the profile image.");
                        console.error("Error compressing image:", error);
                    }
                } else {
                    sap.m.MessageToast.show("No image selected.");
                }
            });
            fileInput.click();
        },
        //Compressing the image while user selectes an image from local..
        compressImage: async function (file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                // Step 1: Read the image file as a data URL
                reader.onload = function (event) {
                    const img = new Image();
                    img.onload = function () {
                        const canvas = document.createElement("canvas");
                        const maxDimension = 300; // Profile image should be 300x300 px
                        let width = img.width;
                        let height = img.height;

                        // Step 2: Resize to square aspect ratio for profile image (width == height)
                        if (width > maxDimension || height > maxDimension) {
                            // Calculate new dimensions while maintaining aspect ratio
                            if (width > height) {
                                height = Math.round((height * maxDimension) / width);
                                width = maxDimension;
                            } else {
                                width = Math.round((width * maxDimension) / height);
                                height = maxDimension;
                            }
                        } else {
                            // If the image is already smaller, keep original dimensions
                            width = width;
                            height = height;
                        }
                        // Step 3: Resize the image using canvas
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0, width, height);
                        // Step 4: Convert canvas to a compressed image
                        canvas.toBlob(
                            (blob) => {
                                if (blob) {
                                    const compressedFile = new File([blob], file.name, {
                                        type: file.type,
                                        lastModified: Date.now(),
                                    });
                                    resolve(compressedFile);
                                } else {
                                    reject(new Error("Canvas toBlob failed."));
                                }
                            },
                            file.type, // Use the original file's MIME type
                            0.7 // Compression quality (70% for profile images)
                        );
                    };
                    img.onerror = function () {
                        reject(new Error("Image loading failed."));
                    };
                    img.src = event.target.result;
                };
                reader.onerror = function () {
                    reject(new Error("File reading failed."));
                };
                reader.readAsDataURL(file); // Read the file as a Data URL
            });
        },
        //Pls keep this may be use in future case...
        // convertImageToURL: async function (file) {
        //     return new Promise((resolve, reject) => {
        //         try {
        //             const fileReader = new FileReader();
        //             // Convert to a Blob URL
        //             fileReader.onload = (e) => {
        //                 const blob = new Blob([e.target.result], { type: file.type });
        //                 const imageUrl = URL.createObjectURL(blob); // Generate a Blob URL
        //                 resolve(imageUrl);
        //             };
        //             fileReader.onerror = reject;
        //             fileReader.readAsArrayBuffer(file); // Read file as ArrayBuffer
        //         } catch (error) {
        //             reject(error);
        //         }
        //     });
        // },
        //Upload btn from the dailog..
        onPressUploadProfilePic_CMPage: async function () {
            var This = this;
            const oModel = This.getOwnerComponent().getModel();
            const oUserID = This.ID;
            var fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.style.display = "none";

            // Add event listener to handle the file selection
            fileInput.addEventListener("change", async (event) => {
                var selectedFiles = event.target.files;
                if (selectedFiles.length > 1) {
                    sap.m.MessageToast.show("Please select only one image.");
                    return; // Stop further processing if multiple files are selected
                }

                var selectedFile = selectedFiles[0];
                if (selectedFile) {
                    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
                    if (selectedFile.size > MAX_FILE_SIZE) {
                        sap.m.MessageToast.show("Please choose an image below 2MB.");
                        return; // Stop further processing if the file size exceeds 2MB
                    }

                    try {
                        const compressedFile = await This.compressImage(selectedFile);
                        console.log("Compressed image size:", compressedFile.size);

                        // Step 5: Convert the compressed image to Base64
                        var reader = new FileReader();
                        reader.onload = async (e) => {
                            var selectedImageBase64 = e.target.result; // Get the base64 encoded image
                            // Update all avatar images with the new base64 image
                            This.updateAllAvatarImages(selectedImageBase64);

                            // Clean the Base64 data for backend storage
                            const cleanBase64 = selectedImageBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
                            const oPayload = {
                                profileImage: cleanBase64
                            };

                            // Update the user's profile image in the backend
                            const oUserdata = await new Promise((resolve, reject) => {
                                oModel.read("/Users", { success: resolve, error: reject });
                            });
                            const user = oUserdata.results.find((user) => user.userID === oUserID);
                            const oUserPath = user.ID;
                            // Update the user's profile image URL in the backend
                            await new Promise((resolve, reject) => {
                                oModel.update(`/Users('${oUserPath}')`, oPayload, { success: resolve, error: reject });
                            });
                            sap.m.MessageToast.show("Profile image updated successfully.");
                        };
                        reader.readAsDataURL(compressedFile); // Read the file as a Data URL (base64 string)
                    } catch (error) {
                        sap.m.MessageToast.show("Failed to update the profile image.");
                        console.error("Error compressing image:", error);
                    }
                } else {
                    sap.m.MessageToast.show("Please select an image to upload.");
                }
            });
            fileInput.click();
        },
        updateAllAvatarImages: function (imageBase64) {
            var This = this;
            var oView = This.getView();
            // Find all avatar controls by checking if they are instances of sap.m.Avatar
            var allAvatarImages = oView.findElements(true, function (element) {
                return element.isA("sap.m.Avatar");
            });
            // Loop through all found avatar controls and update their image source
            allAvatarImages.forEach(function (avatarControl) {
                avatarControl.setSrc(imageBase64);
            });
            //window.location.reload();
        },
        //Deleting the Profile Images...
        onPressDeleteProfilePic_CMPage: async function () {
            debugger
            const This = this;
            const oModel = This.getOwnerComponent().getModel();
            const oUserID = This.ID;
            try {
                sap.ui.core.BusyIndicator.show(0);
                const usersData = await new Promise((resolve, reject) => {
                    oModel.read("/Users", { success: resolve, error: reject });
                });
                const user = usersData.results.find((user) => user.userID === oUserID);
                const oUserPath = `/Users('${user.ID}')`;
                if (user.profileImage) {
                    const oPayload = {
                        profileImage: "" // Clear the field in the backend
                    };
                    await new Promise((resolve, reject) => {
                        oModel.update(oUserPath, oPayload, { success: resolve, error: reject });
                    });
                    // Clear the image from UI and local storage
                    This.clearAllAvatarImages();
                    sap.m.MessageToast.show("Profile image removed successfully!");
                } else {
                    sap.m.MessageToast.show("No profile image found to delete.");
                }
            } catch (oError) {
                console.error("Error deleting profile image:", oError);
            } finally {
                this.applyStoredProfileImage();
                sap.ui.core.BusyIndicator.hide();
            }
        },
        clearAllAvatarImages: function () {
            var This = this;
            var oView = This.getView();
            var allAvatarImagesRemoving = oView.findElements(true, function (element) {
                return element.isA("sap.m.Avatar");
            });
            // Loop through all found avatar controls and update their image source
            allAvatarImagesRemoving.forEach(function (avatarControl) {
                avatarControl.setSrc("");
            });
            this.onRefreshAllavatarsfromApplication();
            //this.applyStoredProfileImage();
            //window.location.reload();
        },
        //Edit Btn for Profile details changing...
        onPressEditProfileDetails_CMPage: function () {
            this.pastFirstName = this.byId("idInputTextResourceFirstname_CMPage").getText();
            this.pastlLastName = this.byId("idInputTextResourceLastname_CMPage").getText();
            this.pastPhonenumber = this.byId("idInputTextUserPhonenumber_CMPage").getText();

            // Hide view-only fields and show editable input fields
            this.byId("idInputTextResourceFirstname_CMPage").setVisible(false);
            this.byId("idInputTextResourceLastname_CMPage").setVisible(false);
            this.byId("idInputTextUserPhonenumber_CMPage").setVisible(false);

            this.byId("idFrontandInputFirstName_CMPage").setVisible(true).setValue(this.pastFirstName);
            this.byId("idFrontandInputLastName_CMPage").setVisible(true).setValue(this.pastlLastName);
            this.byId("idFrontandInputPhoneNumber_CMPage").setVisible(true).setValue(this.pastPhonenumber);

            // Toggle button visibility
            this.byId("idBtnUploadImageforProfile_CMPage").setVisible(false);
            this.byId("idBtnDeleteImageforProfile_CMPage").setVisible(false);
            this.byId("idBtnEditDetailsforProfile_CMPage").setVisible(false);
            this.byId("idBtnSaveProfileDetails_CMPage").setVisible(true);
            this.byId("idBtnCancelProfileDetails_CMPage").setVisible(true);
        },
        onPressSaveProfileDetails_CMPage: async function () {
            debugger
            var oUserID = this.ID; // Assuming this is defined as the user ID for the current session
            var oModel = this.getOwnerComponent().getModel();

            // Get the input values
            var sFName = this.byId("idFrontandInputFirstName_CMPage").getValue();
            var sLName = this.byId("idFrontandInputLastName_CMPage").getValue();
            var sPhone = this.byId("idFrontandInputPhoneNumber_CMPage").getValue();

            var bValid = true;

            // Check for empty or too-short values in Name field
            if (!sFName || sFName.length < 3) {
                this.byId("idFrontandInputFirstName_CMPage").setValueState(sap.ui.core.ValueState.Error);
                this.byId("idFrontandInputFirstName_CMPage").setValueStateText(sFName ? "Firstname should be at least 3 letters!" : "Firstname is required! \n💡atleast three letters from the name!");
                bValid = false;
            } else {
                this.byId("idFrontandInputFirstName_CMPage").setValueState(sap.ui.core.ValueState.None);
            }

            if (!sLName || sLName.length < 1) {
                this.byId("idFrontandInputLastName_CMPage").setValueState(sap.ui.core.ValueState.Error);
                this.byId("idFrontandInputLastName_CMPage").setValueStateText(sLName ? "Lastname should be at least 1 letters!" : "Lastname is required! \n💡atleast one letter from the surname!");
                bValid = false;
            } else {
                this.byId("idFrontandInputLastName_CMPage").setValueState(sap.ui.core.ValueState.None);
            }

            // Check for empty or too-short values in Phone field
            var phoneRegex = /^[6-9]\d{9}$/;
            if (!sPhone || sPhone.length < 3 || !phoneRegex.test(sPhone)) {
                this.byId("idFrontandInputPhoneNumber_CMPage").setValueState(sap.ui.core.ValueState.Error);
                this.byId("idFrontandInputPhoneNumber_CMPage").setValueStateText(sPhone ? "Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9." : "Phone number is required! \n💡10 digits only!");
                bValid = false;
            } else {
                this.byId("idFrontandInputPhoneNumber_CMPage").setValueState(sap.ui.core.ValueState.None);
            }

            // If any field is invalid, show an error message and return
            if (!bValid) {
                sap.m.MessageBox.error("Please correct the highlighted errors.");
                return;
            }
            // Retrieve all resources for validation
            try {
                sap.ui.core.BusyIndicator.show(0);
                const oUserdata = await new Promise((resolve, reject) => {
                    oModel.read("/Users", {
                        success: resolve,
                        error: reject,
                    });
                });
                const user = oUserdata.results.find((user) => user.userID === oUserID);
                const oUserPath = user.ID;

                // Check if the phone number has been changed
                if (user.phoneNo !== sPhone) {
                    const existingResources = await new Promise((resolve, reject) => {
                        oModel.read(`/Users`, {
                            success: (oData) => resolve(oData.results),
                            error: (oError) => reject(oError)
                        });
                    });

                    // Check if the new phone number is already used by another resource
                    if (existingResources.some(resource => resource.phoneNo === sPhone && resource.ID !== oUserID)) {
                        sap.m.MessageBox.error("Phone number is already used. Please enter a different phone number.");
                        return;
                    }
                }

                // Proceed with updating the resource details
                var sEntityPath = `/Users('${oUserPath}')`;
                var oPayload = {
                    fName: sFName,
                    lName: sLName,
                    phoneNo: sPhone,
                };

                await new Promise((resolve, reject) => {
                    oModel.update(sEntityPath, oPayload, {
                        success: resolve,
                        error: reject
                    });
                });
                sap.m.MessageToast.show("Profile details updated successfully!");
                // Hide buttons and show text fields
                this.byId("idBtnSaveProfileDetails_CMPage").setVisible(false);
                this.byId("idBtnCancelProfileDetails_CMPage").setVisible(false);
                this.byId("idBtnEditDetailsforProfile_CMPage").setVisible(true);
                this.byId("idBtnUploadImageforProfile_CMPage").setVisible(true);
                this.byId("idBtnDeleteImageforProfile_CMPage").setVisible(true);

                this.byId("idFrontandInputFirstName_CMPage").setVisible(false);
                this.byId("idFrontandInputLastName_CMPage").setVisible(false);
                this.byId("idFrontandInputPhoneNumber_CMPage").setVisible(false);

                this.byId("idInputTextResourceFirstname_CMPage").setVisible(true);
                this.byId("idInputTextResourceLastname_CMPage").setVisible(true);
                this.byId("idInputTextUserPhonenumber_CMPage").setVisible(true);
            } catch (error) {
                sap.m.MessageToast.show("Error updating profile or fetching data.");
            } finally {
                this.applyStoredProfileImage();
                sap.ui.core.BusyIndicator.hide();
            }
        },
        //Cancel the Profile Details Changing...
        onPressCancelProfileDetails_CMPage: function () {
            this.byId("idInputTextResourceFirstname_CMPage").setText(this.pastFirstName).setVisible(true);
            this.byId("idInputTextResourceLastname_CMPage").setText(this.pastlLastName).setVisible(true);
            this.byId("idInputTextUserPhonenumber_CMPage").setText(this.pastPhonenumber).setVisible(true);

            // Hide editable input fields
            this.byId("idFrontandInputFirstName_CMPage").setVisible(false);
            this.byId("idFrontandInputLastName_CMPage").setVisible(false);
            this.byId("idFrontandInputPhoneNumber_CMPage").setVisible(false);

            // Restore button visibility
            this.byId("idBtnUploadImageforProfile_CMPage").setVisible(true);
            this.byId("idBtnDeleteImageforProfile_CMPage").setVisible(true);
            this.byId("idBtnEditDetailsforProfile_CMPage").setVisible(true);
            this.byId("idBtnSaveProfileDetails_CMPage").setVisible(false);
            this.byId("idBtnCancelProfileDetails_CMPage").setVisible(false);
        },

        //Default Settings btn from the Profile Popover...
        onPressUserDefaultSettingsBack_CM: async function () {
            debugger
            const oUserID = this.ID;
            const oModelDefault = this.getOwnerComponent().getModel();
            //Read the table data and finding perticular userdata based on USERID...
            const usersData = await new Promise((resolve, reject) => {
                oModelDefault.read("/Users", { success: resolve, error: reject });
            });
            const oUser = usersData.results.find((user) => user.userID === oUserID);
            const oUserPath = `/Users(${oUser.ID})`;
            sap.m.MessageBox.warning("Reset to default settings?", {
                title: "Default Settings:",
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.CANCEL],
                onClose: async function (status) {
                    if (status === sap.m.MessageBox.Action.YES) {
                        try {
                            sap.ui.core.BusyIndicator.show(0);
                            // Clear local storage
                            localStorage.clear();
                            // Prepare the payload to reset backend data
                            const oPayload = {
                                backGroundTheme: "",
                                profileImage: ""
                            };
                            // Update the backend with empty/default values
                            await new Promise((resolve, reject) => {
                                oModelDefault.update(oUserPath, oPayload, { success: resolve, error: reject });
                            });
                            window.location.reload();
                            sap.m.MessageToast.show("Settings resetting to default, Please wait!");
                        } catch (oError) {
                            //sap.m.MessageToast.show("Failed to reset settings on the backend.");
                            console.error("Error resetting backend data:", oError);
                        } finally {
                            sap.ui.core.BusyIndicator.hide();
                        }
                    } else {
                        sap.m.MessageToast.show("Reset to default settings cancelled.");
                    }
                }
            });
        },
        //Signout Btn from Profile Popover...
        onSignoutBtnPressProfilePopover_CM: function () {
            sessionStorage.clear();
            localStorage.clear();
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteLoginPage", {}, true);
        },


    })

});