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

    MvNotificacionesController.$inject = ['AvisosService', 'UserService'];
    function MvNotificacionesController(AvisosService, UserService) {

        var vm = this;
        vm.avisos = [];
        vm.avisosOriginales = [];

        AvisosService.get().then(function (data) {
            vm.avisos = data;
            vm.avisosOriginales = [];
            for(var i =0; i<data.length; i++){
                vm.avisosOriginales.push(angular.copy(data[i]));
            }
        });


    }


})();

