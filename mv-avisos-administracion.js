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

    MvAvisosController.$inject = ['AvisosService', 'UserService', 'MvUtils', 'AvisosVars'];
    function MvAvisosController(AvisosService, UserService, MvUtils, AvisosVars) {

        var vm = this;
        vm.avisos = [];
        vm.aviso = {};
        vm.detailsOpen = false;

        vm.save = save;
        vm.cancel = cancel;
        vm.setData = setData;
        vm.loadAvisos = loadAvisos;
        vm.remove = remove;

        loadAvisos();

        function loadAvisos() {
            AvisosService.get().then(function (data) {
                setData(data);
            });
        }

        function save() {
            vm.aviso.usuario_id = UserService.getFromToken().data.id;
            AvisosService.save(vm.aviso).then(function (data) {
                vm.detailsOpen = (data === undefined || data < 0) ? true : false;
                if(data === undefined) {
                    MvUtils.showMessage('error', 'Error actualizando el dato');
                }
                else {
                    vm.aviso = {};
                    loadAvisos();
                    MvUtils.showMessage('success', 'La operación se realizó satisfactoriamente');
                }
            }).catch(function (data) {
                vm.aviso = {};
                vm.detailsOpen = true;
            });

        }

        function setData(data) {
            vm.avisos = data;
            vm.paginas = AvisosVars.paginas;
        }

        function remove() {
            if(vm.aviso.aviso_id == undefined) {
                alert('Debe seleccionar una aviso');
            } else {
                var result = confirm('¿Esta seguro que desea eliminar el aviso seleccionada?');
                if(result) {
                    AvisosService.remove(vm.aviso.aviso_id).then(function(data){
                        console.log(data);
                        if(data.status == 200) {
                            vm.aviso = {};
                            vm.detailsOpen = false;
                            loadAvisos();
                            MvUtils.showMessage('success', 'El registro se borro satisfactoriamente');
                        } else {
                            MvUtils.showMessage('error', 'Error borrando el registro');
                        }
                    }).catch(function(data){
                        console.log(data);
                    });
                }
            }
        }


        function cancel() {
            vm.avisos = [];
            vm.aviso = {};
            vm.detailsOpen=false;
            AvisosVars.clearCache = true;
            loadAvisos();
        }


        // Implementación de la paginación
        vm.start = 0;
        vm.limit = AvisosVars.paginacion;
        vm.pagina = AvisosVars.pagina;
        vm.paginas = AvisosVars.paginas;

        function paginar(vars) {
            if (vars == {}) {
                return;
            }
            vm.start = vars.start;
            vm.pagina = vars.pagina;
        }

        vm.next = function () {
            paginar(MvUtils.next(AvisosVars));
        };
        vm.prev = function () {
            paginar(MvUtils.prev(AvisosVars));
        };
        vm.first = function () {
            paginar(MvUtils.first(AvisosVars));
        };
        vm.last = function () {
            paginar(MvUtils.last(AvisosVars));
        };

        vm.goToPagina = function () {
            paginar(MvUtils.goToPagina(vm.pagina, AvisosVars));
        }


    }


})();

