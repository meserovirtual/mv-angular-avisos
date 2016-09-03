(function () {

    'use strict';


    angular.module('acAvisosAdministracion', [])

        .component('acAvisosAdministracion', acAvisosAdministracion());

    function acAvisosAdministracion() {
        return {
            bindings: {
                searchFunction: '&'
            },
            templateUrl: window.installPath + '/ac-angular-avisos/ac-avisos-administracion.html',
            controller: AcAvisosController
        }
    }

    AcAvisosController.$inject = ['AvisosService', 'UserService'];
    function AcAvisosController(AvisosService, UserService) {
        var vm = this;
        vm.avisos = [];
        vm.avisosOriginales = [];
        vm.save = save;

        AvisosService.get().then(function (data) {
            vm.avisos = data;
            vm.avisosOriginales = [];
            for(var i =0; i<data.length; i++){
                vm.avisosOriginales.push(angular.copy(data[i]));
            }
        });


        function save() {
            for (var i = 0; i < vm.avisos.length; i++) {
                if (vm.avisos[i].aviso != vm.avisosOriginales[i].aviso) {
                    vm.avisos[i].usuario_id = UserService.getFromToken().data.id;
                }
            }

            AvisosService.save(vm.avisos).then(function (data) {
                return AvisosService.get();
            }).then(function (data) {
                vm.avisos = data;
                vm.avisosOriginales = [];
                for(var i =0; i<data.length; i++){
                    vm.avisosOriginales.push(angular.copy(data[i]));
                }
            })


        }


    }


})();

