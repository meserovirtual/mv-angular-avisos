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

    MvNotificacionesController.$inject = ['AvisosService', 'UserService', 'StockService', '$interval'];
    function MvNotificacionesController(AvisosService, UserService, StockService, $interval) {

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
                StockService.getAReponer(UserService.getFromToken().data.sucursal_id).then(function(data){
                    console.log(data);
                    if(data.length > 0) {
                        vm.aReponer = data;
                        var aviso = {usuario_id: UserService.getFromToken().data.id, aviso: armarAvisoStockAReponer(data)};
                        loadAvisos();

                        AvisosService.create(aviso).then(function(data){
                            if(data > 0) {
                                loadAvisos();
                            }
                        }).catch(function(data){
                            console.log(data);
                        })

                    }
                }).catch(function(data){
                    console.log(data);
                });
                //}, 300000);
            }, 600000); //Productivo tendra un timer de 1 hr, 60 minutos

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

