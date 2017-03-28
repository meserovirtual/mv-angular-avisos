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

    MvNotificacionesController.$inject = ['AvisosService', 'UserService', 'StockService', '$interval', 'ContactsService'];
    function MvNotificacionesController(AvisosService, UserService, StockService, $interval, ContactsService) {

        var vm = this;
        vm.showAvisos = false;
        vm.avisos = [];
        vm.aReponer = [];
        vm.avisosOriginales = [];

        //console.log(UserService.getFromToken().data);

        if(UserService.getFromToken().data != undefined) {
            loadAReponer();
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

                StockService.getAReponer(UserService.getFromToken().data.sucursal_id).then(function(data){
                    console.log(data);
                    if(data.length > 0) {
                        vm.aReponer = data;
                        var aviso = {usuario_id: UserService.getFromToken().data.id, aviso: armarAvisoStockAReponer(data)};
                        loadAvisos();

                        AvisosService.create(aviso).then(function(data){
                            if(data > 0) {
                                //loadAvisos();
                                var mensaje = '';
                                mensaje = mensaje + '<table style="width:100%;border: 1px solid black;"><thead><tr>';
                                mensaje = mensaje + '<th style="border: 1px solid black;background-color: #eee">Producto</th>';
                                mensaje = mensaje + '<th style="border: 1px solid black;background-color: #eee">Pto. Reposición</th>';
                                mensaje = mensaje + '<th style="border: 1px solid black;background-color: #eee">Cant. Actual</th>';
                                mensaje = mensaje + '</tr></thead><tbody>';

                                for (var i = 0; i < data.length; i++) {

                                    mensaje = mensaje + '<tr>';
                                    mensaje = mensaje + '<td style="font-size: 12px;border-width: 1px;padding: 8px;border-style: solid;border-color: #515C4B;background-color: #293333;color: #fff;">' + data[i].nombre + '</td>';
                                    mensaje = mensaje + '<td style="font-size: 12px;border-width: 1px;padding: 8px;border-style: solid;border-color: #515C4B;background-color: #293333;color: #fff;">' + data[i].pto_repo + '</td>';
                                    mensaje = mensaje + '<td style="font-size: 12px;border-width: 1px;padding: 8px;border-style: solid;border-color: #515C4B;text-align:right;background-color: #293333;color: #fff;">$' + data[i].cant_actual + '</td>';
                                    mensaje = mensaje + '</tr>';

                                }
                                mensaje = mensaje + '</tbody></table>';

                                console.log('Se armo el mail de avisos');
                                var sucursalHeader = 'Sucursal:' + vm.sucursal_nombre + ' Caja: ' + UserService.getFromToken().data.caja_id + ' Fecha: ' + new Date().getDate() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear();

                                ContactsService.sendMail(window.mailAdmin, mailAdmins, 'Mail de Avisos', sucursalHeader, mensaje).then(function (data) {
                                    console.log(data);
                                    loadAvisos();
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
            }, 10000);
            //}, 600000); //Productivo tendra un timer de 1 hr, 60 minutos

        }

        function armarAvisoStockAReponer(aReponer){
            var aux = '';
            for(var i = 0; i <= aReponer.length - 1; i++) {
                aux += 'Produc:' + aReponer[i].producto_id + ' - ' + aReponer[i].nombre + ' - Cant Act:' + aReponer[i].cant_actual + ' - Pto Repo:' + aReponer[i].pto_repo + ' - ';
            }
            return aux;
        }

        function loadAvisos() {
            AvisosService.get().then(function (data) {
                vm.avisos = [];
                for(var i=0; i <= 4; i++){
                    vm.avisos.push(data[i]);
                }
            });
        }

    }

})();

