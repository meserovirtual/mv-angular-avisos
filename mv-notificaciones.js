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
        vm.avisos = [];
        vm.aReponer = [];
        vm.avisosOriginales = [];

        //console.log(UserService.getFromToken().data);

        if(UserService.getFromToken().data != undefined) {
            loadAvisos();
        }

        function loadAvisos() {
            console.log('cargar avisos');

            $interval(function () {
                StockService.getAReponer(UserService.getFromToken().data.sucursal_id).then(function(data){
                    console.log(data);
                    vm.aReponer = data;
                }).catch(function(data){
                    console.log(data);
                });
            }, 30000);

        }

        AvisosService.get().then(function (data) {
            vm.avisos = data;
            vm.avisosOriginales = [];
            for(var i =0; i<data.length; i++){
                vm.avisosOriginales.push(angular.copy(data[i]));
            }
        });


    }


})();

