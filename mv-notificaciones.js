(function () {
    'use strict';

    angular.module('mvNotificaciones', [])
        .component('mvNotificaciones', mvNotificaciones());

    function mvNotificaciones() {
        return {
            bindings: {
                searchFunction: '&'
            },
            templateUrl: window.installPath + '/mv-angular-avisos/mv-notificaciones.html',
            controller: MvNotificacionesController
        }
    }

    MvNotificacionesController.$inject = ['AvisosService', 'UserService', 'StockService', '$interval', 'ContactsService',
        'SucursalesService', 'ComandasService'];
    function MvNotificacionesController(AvisosService, UserService, StockService, $interval, ContactsService,
                                        SucursalesService, ComandasService) {

        var vm = this;
        vm.showAvisos = false;
        vm.avisos = [];
        vm.aReponer = [];
        vm.avisosOriginales = [];

        var sucursal = "";



        if(UserService.getFromToken().data != undefined) {
            loadAReponer();
            loadComandasNoEntregadas();
        }

        function getCaja() {
            if(UserService.getFromToken().data.caja_id == 1) {
                return "Caja 1";
            }
            return "Caja 2";
        }

        SucursalesService.get().then(function(data){
            for(var i=0; i <= data.length - 1; i++) {
                if(data[i].sucursal_id == UserService.getFromToken().data.sucursal_id) {
                    sucursal = data[i].nombre;
                    break;
                }
            }
        }).catch(function(data){
            console.log(data);
        });

        function loadComandasNoEntregadas() {

            $interval(function () {

                var comanda = {};
                ComandasService.getComandaNoEntregadas(comanda).then(function(comandas){
                    var aviso = {usuario_id: UserService.getFromToken().data.id, aviso: armarAvisoComandaNoEntregada(comandas)};

                    AvisosService.create(aviso).then(function(data){
                        console.log('armo el aviso');
                        if(data > 0) {
                            loadAvisos();
                            var mensaje = '';

                            mensaje = mensaje + '<div style="width:100%;background-color:#76986A;font-family:Arial;">';
                            mensaje = mensaje + '<div style="height:80px;"><h2 style="color:#fff;text-align:center;">Comandas No Entregadas</h2></div>';
                            mensaje = mensaje + '<div style="height:110px;background-color:#293333;">';
                            mensaje = mensaje + '<div style="margin: 15px;padding-top:10px;border-bottom: 2px solid #fff;">';
                            mensaje = mensaje + '<label style="color:#76986A;text-align:center;font-weight:bold;">Sucursal:</label>';
                            mensaje = mensaje + '<label style="color:#fff;text-align:center;">' + sucursal + '</label></div>';
                            mensaje = mensaje + '<div style="margin: 15px;border-bottom: 2px solid #fff;">';
                            mensaje = mensaje + '<label style="color:#76986A;text-align:center;font-weight:bold;">Caja:</label>';
                            mensaje = mensaje + '<label style="color:#fff;text-align:center;">' + getCaja() + '</label></div>';
                            mensaje = mensaje + '<div style="margin: 15px;border-bottom: 2px solid #fff;">';
                            mensaje = mensaje + '<label style="color:#76986A;text-align:center;font-weight:bold;">Fecha:</label>';
                            mensaje = mensaje + '<label style="color:#fff;text-align:center;">' + new Date().getDate() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear() + '</label></div></div>';

                            mensaje = mensaje + '<table style="width:100%;"><thead><tr>';
                            mensaje = mensaje + '<th style="border: 1px solid black;background-color:#293333;color:#fff;padding: 5px 0;">Comanda</th>';
                            mensaje = mensaje + '<th style="border: 1px solid black;background-color:#293333;color:#fff;padding: 5px 0;">Fecha</th>';
                            mensaje = mensaje + '<th style="border: 1px solid black;background-color:#293333;color:#fff;padding: 5px 0;">Tiempo</th>';
                            mensaje = mensaje + '</tr></thead><tbody>';

                            for (var i = 0; i < comandas.length; i++) {
                                mensaje = mensaje + '<tr>';
                                mensaje = mensaje + '<td style="font-size: 12px;border-width: 1px;padding: 8px;border-style: solid;border-color: #000;background-color: #76986A;color: #fff;">' + comandas[i].comanda_id + '</td>';
                                mensaje = mensaje + '<td style="font-size: 12px;border-width: 1px;padding: 8px;border-style: solid;border-color: #000;text-align:center;background-color: #76986A;color: #fff;">' + comandas[i].fecha + '</td>';
                                mensaje = mensaje + '<td style="font-size: 12px;border-width: 1px;padding: 8px;border-style: solid;border-color: #000;text-align:center;background-color: #76986A;color: #fff;">' + '> 30 min' + '</td>';
                                mensaje = mensaje + '</tr>';

                            }
                            mensaje = mensaje + '</tbody></table></div>';

                            console.log('Se armo el mail de avisos');
                            var sucursalHeader = 'Sucursal:' + sucursal + ' Caja: ' + getCaja() + ' Fecha: ' + new Date().getDate() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear();

                            ContactsService.sendMail(window.mailAdmin, mailAdmins, 'Mail de Comandas No Entregadas', sucursalHeader, mensaje).then(function (data) {
                                console.log(data);
                                //loadAvisos();
                            }).catch(function(data){
                                console.log(data);
                            });
                        }
                    }).catch(function(data){
                        console.log(data);
                    });

                }).catch(function(data){
                    console.log(data);
                });
            }, 600000); //10 minutos

        }

        function loadAReponer() {

            $interval(function () {
                var mailAdmins = [];

                UserService.get('0').then(function(data) {
                    for(var i = 0; i <= data.length - 1; i++) {
                        var mailAdmin = {mail: data[i].mail}
                        mailAdmins.push(mailAdmin);
                    }
                }).catch(function(data){
                    console.log(data);
                });

                StockService.getAReponer(UserService.getFromToken().data.sucursal_id).then(function(aReponer){
                    console.log(aReponer);
                    if(aReponer.length > 0) {
                        vm.aReponer = aReponer;
                        var aviso = {usuario_id: UserService.getFromToken().data.id, aviso: armarAvisoStockAReponer(aReponer)};
                        //loadAvisos();

                        AvisosService.create(aviso).then(function(data){
                            console.log('Paso 1 hr - ' + new Date().getHours() + ':' + new Date().getMinutes());
                            if(data > 0) {
                                loadAvisos();
                                var mensaje = '';

                                mensaje = mensaje + '<div style="width:100%;background-color:#76986A;font-family:Arial;">';
                                mensaje = mensaje + '<div style="height:80px;"><h2 style="color:#fff;text-align:center;">Avisos</h2></div>';
                                mensaje = mensaje + '<div style="height:110px;background-color:#293333;">';
                                mensaje = mensaje + '<div style="margin: 15px;padding-top:10px;border-bottom: 2px solid #fff;">';
                                mensaje = mensaje + '<label style="color:#76986A;text-align:center;font-weight:bold;">Sucursal:</label>';
                                mensaje = mensaje + '<label style="color:#fff;text-align:center;">' + sucursal + '</label></div>';
                                mensaje = mensaje + '<div style="margin: 15px;border-bottom: 2px solid #fff;">';
                                mensaje = mensaje + '<label style="color:#76986A;text-align:center;font-weight:bold;">Caja:</label>';
                                mensaje = mensaje + '<label style="color:#fff;text-align:center;">' + getCaja() + '</label></div>';
                                mensaje = mensaje + '<div style="margin: 15px;border-bottom: 2px solid #fff;">';
                                mensaje = mensaje + '<label style="color:#76986A;text-align:center;font-weight:bold;">Fecha:</label>';
                                mensaje = mensaje + '<label style="color:#fff;text-align:center;">' + new Date().getDate() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear() + '</label></div></div>';

                                mensaje = mensaje + '<table style="width:100%;"><thead><tr>';
                                mensaje = mensaje + '<th style="border: 1px solid black;background-color:#293333;color:#fff;padding: 5px 0;">Producto</th>';
                                mensaje = mensaje + '<th style="border: 1px solid black;background-color:#293333;color:#fff;padding: 5px 0;">Pto. Reposición</th>';
                                mensaje = mensaje + '<th style="border: 1px solid black;background-color:#293333;color:#fff;padding: 5px 0;">Cant. Actual</th>';
                                mensaje = mensaje + '</tr></thead><tbody>';

                                for (var i = 0; i < aReponer.length; i++) {
                                    mensaje = mensaje + '<tr>';
                                    mensaje = mensaje + '<td style="font-size: 12px;border-width: 1px;padding: 8px;border-style: solid;border-color: #000;background-color: #76986A;color: #fff;">' + aReponer[i].nombre + '</td>';
                                    mensaje = mensaje + '<td style="font-size: 12px;border-width: 1px;padding: 8px;border-style: solid;border-color: #000;text-align:center;background-color: #76986A;color: #fff;">' + aReponer[i].pto_repo + '</td>';
                                    mensaje = mensaje + '<td style="font-size: 12px;border-width: 1px;padding: 8px;border-style: solid;border-color: #000;text-align:center;background-color: #76986A;color: #fff;">' + aReponer[i].cant_actual + '</td>';
                                    mensaje = mensaje + '</tr>';

                                }
                                mensaje = mensaje + '</tbody></table></div>';

                                console.log('Se armo el mail de avisos');
                                var sucursalHeader = 'Sucursal:' + sucursal + ' Caja: ' + getCaja() + ' Fecha: ' + new Date().getDate() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear();

                                ContactsService.sendMail(window.mailAdmin, mailAdmins, 'Mail de Avisos', sucursalHeader, mensaje).then(function (data) {
                                    console.log(data);
                                    //loadAvisos();
                                }).catch(function(data){
                                    console.log(data);
                                });
                            }
                        }).catch(function(data){
                            console.log(data);
                        })

                    }
                }).catch(function(data){
                    console.log(data);
                });
                //}, 10000);
                //}, 600000); //10 minutos
                //}, 1200000); //20 minutos
                //}, 2400000); //40 minutos
            }, 3600000); //60 minutos

        }

        function armarAvisoStockAReponer(aReponer){
            var aux = '';
            for(var i = 0; i <= aReponer.length - 1; i++) {
                aux += 'Produc:' + aReponer[i].producto_id + ' - ' + aReponer[i].nombre + ' - Cant Act:' + aReponer[i].cant_actual + ' - Pto Repo:' + aReponer[i].pto_repo + ' - ';
            }
            return aux;
        }

        function armarAvisoComandaNoEntregada(comandas) {
            var aux = '';
            for(var i = 0; i <= comandas.length - 1; i++) {
                aux += 'Comanda: ' + comandas[i].comanda_id + ' - ';
            }
            return aux;
        }

        function loadAvisos() {
            AvisosService.get().then(function (data) {
                vm.avisos = [];
                for(var i=0; i <= 3; i++){
                    vm.avisos.push(data[i]);
                }
            });
        }

    }

})();

