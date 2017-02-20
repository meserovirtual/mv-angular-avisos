(function () {

    'use strict';


    angular.module('mvAvisosAdministracion', [])
        .component('mvAvisosAdministracion', mvAvisosAdministracion());

    function mvAvisosAdministracion() {
        return {
            bindings: {
                searchFunction: '&'
            },
            templateUrl: window.installPath + '/mv-angular-avisos/mv-avisos-administracion.html',
            controller: MvAvisosController
        }
    }

    MvAvisosController.$inject = ['AvisosService', 'UserService'];
    function MvAvisosController(AvisosService, UserService) {
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

