sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
    "sap/m/MessageToast",
    "sap/m/MessageBox",
	'sap/ui/export/library',
    "sap/ui/core/Fragment",
	'sap/ui/export/Spreadsheet',
    
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */ 
    function (Controller, Filter, FilterOperator,  MessageToast,MessageBox, exportLibrary, Fragment, Spreadsheet) {
        "use strict";

        //http://CLD-ERP02.solviads.local:8010/sap/opu/odata/sap/ZSLV_STJ_OGR_SRV/ogrenciListSet?$format=json

        var EdmType = exportLibrary.EdmType;

        return Controller.extend("com.solvia.project4.controller.Main", {
            onInit : function () {

                var globalModel = this.getOwnerComponent().getModel("globalModel");
                var oDataModel = this.getOwnerComponent().getModel("myOdataModel");

                var oButton = this.byId("idDownload");
                //oButton.addStyleClass("pinkButton");

                var But = this.byId("idSil");
                But.addStyleClass("pinkButton");
      
                var Button = this.byId("idEdit");
                Button.addStyleClass("pinkButton");
                // Butonun rengini pembe yap
                

                var Fakulteler= [
                    { "key" :"", "text":"Bir Fakülte Seçiniz" },
                    { "key" :"Mühendislik", "text":"Mühendislik" },
                    { "key" :"Tıp Fakültesi", "text":"Tıp Fakültesi" },
                    { "key" :"Havacılık", "text":"Havacılık" },
                    { "key" :"Teknoloji ", "text":"Teknoloji" },
                    { "key" :"Sağlık Bilimleri", "text":"Sağlık Bilimleri" },
                    { "key" :"İşletme", "text":"İşletme" },
                    { "key" :"İlahiyat", "text":"İlahiyat" },
                    { "key" :"Mimarlık", "text":"Mimarlık" },
                    { "key" :"Hukuk", "text":"Hukuk" },
                    { "key" :"Eczacılık", "text":"Eczacılık" }
                ];
                globalModel.setProperty("/FakulteList", Fakulteler );

                this.onGetData();
               
                this.sSearchQuery = 0;

                
            },
            
            onGetData : function (oEvent) {

                var oDataModel = this.getOwnerComponent().getModel("myOdataModel");
                var globalModel = this.getOwnerComponent().getModel("globalModel");

                //get entity set

                oDataModel.read("/ogrenciListSet",{
                    success : function (oData){

                        debugger;
                        globalModel.setProperty("/List", oData.results );
                        
                    },
                    error : function(oError){

                        MessageToast.show("Error!");
                    }

                });
            

            },
            //http://localhost:8080/test/flpSandbox.html?sap-client=100&sap-ui-xx-viewCache=false#comsolviaproject4-display
            onChange: function(oEvent){

                //DATAYI ALMA YÖNTEMLERİ

                var globalModel = this.getOwnerComponent().getModel("globalModel");

                var path = oEvent.getParameter("selectedItem").getBindingContext("globalModel").getPath();
                var line = globalModel.getProperty(path);
                var selectControl = this.getView().byId("selectId");
                var selectedKey = selectControl.getSelectedKey();
            },

            onRefresh:function(){

                this.getView().byId("idAd").setValue("");
                this.getView().byId("idSoyad").setValue("");
                this.getView().byId("idFakulte").setSelectedKey("");
                this.getView().byId("idBolum").setValue("");

                this.onRefreshValueState();

        },

            onMessageBox() {

                debugger;

                var that = this;

                MessageBox.warning("Silmek İstediğinize Emin Misiniz?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,

                    onClose: function (sAction) {

                        if (sAction === 'OK') {
                            that.onDelete();
                            MessageToast.show("Seçilen Kişi Silindi");
                        }
                    }
                });
            },
            onDeleteFinal(){

                var oSelected = this.byId("idStudents").getSelectedItem();

                if(oSelected!==null){

                    this.onMessageBox();

                }else{

                    MessageToast.show("Bir Veri Seçiniz!!");

                }
            },


            onDelete: function(oEvent){
                var that=this;
                var oContext,
                oSelected =this.byId("idStudents").getSelectedItem();
                var oEntry = oSelected.getBindingContext("globalModel").getObject();

                var oDataModel = this.getOwnerComponent().getModel("myOdataModel");
                oDataModel.remove("/ogrenciListSet('"+oEntry.OgrNo+"')", {
                    method: "DELETE",
                    success: function(data) {
                    that.onGetData();
                     MessageBox("success");
                
                    },
                    error: function(e) {
                     MessageBox("error");
                    }
                   });
            
            },

            createColumnConfig: function() {
                var aCols = [];
    
                aCols.push({
                    label: 'Öğrenci Numarası',
                    property: ['OgrNo'],
                    type: EdmType.Number 
                });
    
                aCols.push({
                    label: 'İsim',
                    type: EdmType.String,
                    property: 'Isim',
                });
    
                aCols.push({
                    label: 'Soyisim',
                    property: 'Soyisim',
                    type: EdmType.String
                });
    
                aCols.push({
                    label: 'Fakülte',
                    property: 'Fakulte',
                    type: EdmType.String
                });
    
                aCols.push({
                    label: 'Bölüm',
                    property: 'Bolum',
                    type: EdmType.String,
                    width: 30
                });
                return aCols;
            },
    
            onExport: function() {
                var aCols, oRowBinding, oSettings, oSheet, oTable;
    
                if (!this._oTable) {
                    this._oTable = this.byId('idStudents');
                }
    
                oTable = this._oTable;
                oRowBinding = oTable.getBinding('items');
                aCols = this.createColumnConfig();
    
                oSettings = {
                    workbook: {
                        columns: aCols,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: oRowBinding,
                    fileName: 'Table export sample.xlsx',
                    worker: false // We need to disable worker because we are using a MockServer as OData Service
                };
     

                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function() {
                    oSheet.destroy();
                });
            },

            onOpenDialog : function () {
                var path;
                var model;
                var selectedLine;
                var oSelected = this.byId("idStudents").getSelectedItem();

                if(oSelected!==null){
                
                // create dialog lazily
                if (!this.pDialog) {
                    this.pDialog = Fragment.load({name:"com.solvia.project4.view.edit", controller : this });

                } 
                this.pDialog.then(function(oDialog) {
                    oDialog.open();

                    path=this.byId('idStudents').getSelectedItem().getBindingContext("globalModel").getPath();
                    model= this.byId('idStudents').getSelectedItem().getBindingContext("globalModel").getModel();
                    selectedLine=model.getProperty(path);
                    selectedLine=JSON.parse(JSON.stringify(selectedLine))
                    model.setProperty("/selectedLine",selectedLine);
                    oDialog.setModel(model,"globalModel");
                    this.oDialog=oDialog;

                    debugger;
                }.bind(this));}
                else{
                    MessageToast.show("Lütfen Bir Seçim Yapınız!");
                }
            },

            onCloseDialog : function(oEvent){

                this.oDialog.close();
                debugger;
            },

            onUpdateDialog : function(oEvent){

                var globalModel = this.getOwnerComponent().getModel("globalModel");
                var oDataModel = this.getOwnerComponent().getModel("myOdataModel");
                var that=this;

                var ad= sap.ui.getCore().byId("idAdEdit").mProperties.value.trim();
                var soyad = sap.ui.getCore().byId("idSoyadEdit").mProperties.value.trim();
               // var fakulte = sap.ui.getCore().byId("idFakulteEdit").mProperties.value;
                var fakulteKey = sap.ui.getCore().byId("idFakulteEdit").getSelectedKey();
                var bolum = sap.ui.getCore().byId("idBolumEdit").mProperties.value.trim();
                
                if( ad==="" || soyad==="" || fakulteKey==="" || bolum==="" ){
                    MessageBox.warning("Zorunlu Alanları Doldurun!")
                    if(ad === ""){sap.ui.getCore().byId("idAdEdit").setValueState("Error");}
                    if(soyad === ""){sap.ui.getCore().byId("idSoyadEdit").setValueState("Error");}
                    if(fakulteKey === ""){sap.ui.getCore().byId("idFakulteEdit").setValueState("Error");}
                    if(bolum === ""){sap.ui.getCore().byId("idBolumEdit").setValueState("Error");}
                    return;
                }else{
                    var kEntry={};
                    
                    kEntry.Isim = ad;
                    kEntry.Soyisim = soyad;
                    kEntry.Fakulte = fakulteKey;
                    kEntry.Bolum = bolum;

                    var that=this;
                    var oSelected =this.byId("idStudents").getSelectedItem();
                    var kRow = oSelected.getBindingContext("globalModel").getObject();
                    kEntry.OgrNo = kRow.OgrNo;
                    var oDataModel = this.getOwnerComponent().getModel("myOdataModel");

                    oDataModel.update("/ogrenciListSet('"+kEntry.OgrNo+"')", kEntry, {
                        method: "PUT",
                        success: function(data) {

                        that.oDialog.close();
                        that.onGetData();
                        that.onRefresh();
                        
                         MessageBox.success("success");
                        },
                        error: function(e) {
                         MessageBox.error("error");
                        }
                       });
            }; 
        },
        onNewOpenDialog : function () {
            var model;
            this.getView().byId("idStudents").removeSelections();
            if (!this.aDialog) {
                this.aDialog = Fragment.load({name:"com.solvia.project4.view.new", controller : this });
            } 
            this.aDialog.then(function(oDialog) {
                oDialog.open();
                var globalModel = this.getOwnerComponent().getModel("globalModel");
                oDialog.setModel(globalModel);
                this.oDialog=oDialog;

                debugger;
            }.bind(this));
           
        },
        onSaveInsideButtonNew: function(oEvent){

            var globalModel = this.getOwnerComponent().getModel("globalModel");
            var oDataModel = this.getOwnerComponent().getModel("myOdataModel");
            var that=this;

            var ad= sap.ui.getCore().byId("idAd").mProperties.value.trim();
            var soyad = sap.ui.getCore().byId("idSoyad").mProperties.value.trim();
           // var fakulte = sap.ui.getCore().byId("idFakulteEdit").mProperties.value;
            var fakulteKey = sap.ui.getCore().byId("idFakulte").getSelectedKey();
            var bolum = sap.ui.getCore().byId("idBolum").mProperties.value.trim();


            if( ad==="" || soyad==="" || fakulteKey==="" || bolum==="" ){
                MessageBox.warning("Zorunlu Alanları Doldurun!")
                if(ad === ""){sap.ui.getCore().byId("idAd").setValueState("Error");}
                if(soyad === ""){sap.ui.getCore().byId("idSoyad").setValueState("Error");}
                if(fakulteKey === ""){sap.ui.getCore().byId("idFakulte").setValueState("Error");}
                if(bolum === ""){sap.ui.getCore().byId("idBolum").setValueState("Error");}
                return;
            }else{
                var oEntry={};
               
                oEntry.Isim = ad;
                oEntry.Soyisim = soyad;
                oEntry.Fakulte = fakulteKey;
                oEntry.Bolum = bolum;
            
                oDataModel.create("/ogrenciListSet",oEntry,{
                success:function(oData){

                    
                    var type = oData.Type;
                    if(type==="S")
                    debugger;
                    //MessageBox.success("success");
                    MessageToast.show("Başarıyla Kaydedildi");
                    that.onGetData();
                    that.onRefreshNew();
                    that.onCloseDialogButtonNew();
                    that.onRefreshValueState();
                   
                },
                error:function(oEvent) {
                    MessageBox.error("error");
                    debugger;
                }
                })};
        },
        onCloseDialogButtonNew : function(){

            this.oDialog.close();
        },
        onRefreshNew:function(){

            sap.ui.getCore().byId("idAd").setValue("");
            sap.ui.getCore().byId("idSoyad").setValue("");
            sap.ui.getCore().byId("idFakulte").setSelectedKey("");
            sap.ui.getCore().byId("idBolum").setValue("");

            this.onRefreshValueState();

    },
    onRefreshValueState: function(oEvent){
        sap.ui.getCore().byId("idAd").setValueState("None");
        sap.ui.getCore().byId("idSoyad").setValueState("None");
        sap.ui.getCore().byId("idFakulte").setValueState("None");
        sap.ui.getCore().byId("idBolum").setValueState("None");
    },
    fnApplyFiltersAndOrdering: function (oEvent){
        var aFilters = []
          
        if (this.sSearchQuery) {
            var oFilter = new Filter("Isim", FilterOperator.Contains, this.sSearchQuery);
            aFilters.push(oFilter);
        }

        this.byId("idStudents").getBinding("items").filter(aFilters).sort(aSorters);
    },
   
    onFilter: function (oEvent) {
        this.sSearchQuery = oEvent.getSource().getValue();
        this.fnApplyFiltersAndOrdering();
    }

    
    });
    });
