(function () {
    'use strict';

    var scripts = document.getElementsByTagName("script");
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module('mvAvisos', ['ngRoute'])
        .factory('AvisosService', AvisosService)
        .service('AvisosVars', AvisosVars);


    AvisosService.$inject = ['$http', 'AvisosVars', '$cacheFactory', 'MvUtils', 'MvUtilsGlobals', 'ErrorHandler', '$q'];
    function AvisosService($http, AvisosVars, $cacheFactory, MvUtils, MvUtilsGlobals, ErrorHandler, $q) {
        var service = {};
        var url = window.installPath + '/mv-angular-avisos/includes/mv-avisos.php';


        service.get = get;
        service.getByParams = getByParams;

        service.save = save;
        service.create = create;
        service.update = update;
        service.remove = remove;


        return service;


        /**
         * Función que determina si es un update o un create
         * @param producto
         * @returns {*}
         */
        function save(aviso) {
            var deferred = $q.defer();

            if (aviso.aviso_id != undefined) {
                deferred.resolve(update(aviso));
            } else {
                deferred.resolve(create(aviso));
            }
            return deferred.promise;
        }

        function get() {
            MvUtilsGlobals.startWaiting();
            var urlGet = url + '?function=get';
            var $httpDefaultCache = $cacheFactory.get('$http');
            var cachedData = [];

            // Verifica si existe el cache de usuarios
            if ($httpDefaultCache.get(urlGet) != undefined) {
                if (AvisosVars.clearCache) {
                    $httpDefaultCache.remove(urlGet);
                }
                else {
                    var deferred = $q.defer();
                    cachedData = $httpDefaultCache.get(urlGet);
                    deferred.resolve(cachedData);
                    MvUtilsGlobals.stopWaiting();
                    return deferred.promise;
                }
            }

            return $http.get(urlGet, {cache: true})
                .then(function (response) {

                    for (var x in response.data) {
                        response.data[x].cajas = [];
                        for (var i = 1; i <= response.data[x].pos_cantidad; i++) {
                            response.data[x].cajas.push({caja_id: i, nombre: 'Caja ' + i})
                        }
                    }

                    $httpDefaultCache.put(urlGet, response.data);
                    AvisosVars.clearCache = false;
                    AvisosVars.paginas = (response.data.length % AvisosVars.paginacion == 0) ? parseInt(response.data.length / AvisosVars.paginacion) : parseInt(response.data.length / AvisosVars.paginacion) + 1;
                    MvUtilsGlobals.stopWaiting();
                    return response.data;
                })
                .catch(function (response) {
                    MvUtilsGlobals.stopWaiting();
                    ErrorHandler(response);
                });
        }

        /**
         * @description Retorna la lista filtrada de avisos
         * @param param -> String, separado por comas (,) que contiene la lista de par�metros de b�squeda, por ej: nombre, sku
         * @param value
         * @param callback
         */
        function getByParams(params, values, exact_match, callback) {
            get(function (data) {
                MvUtils.getByParams(params, values, exact_match, data, callback);
            })
        }



        /** @name: remove
         * @param aviso_id
         * @param callback
         * @description: Elimina el aviso seleccionado.
         */
        function remove(aviso_id) {
            return $http.post(url,
                {function: 'remove', 'aviso_id': aviso_id})
                .then(function (data) {
                    //console.log(data);
                    if (data.status == 200) {
                        AvisosVars.clearCache = true;
                        return data;
                    }
                })
                .catch(function (data) {
                    AvisosVars.clearCache = true;
                    ErrorHandler(data)
                })
        }

        /**
         * @description: Crea un aviso.
         * @param aviso
         * @param callback
         * @returns {*}
         */
        function create(aviso) {

            return $http.post(url,
                {
                    'function': 'create',
                    'aviso': JSON.stringify(aviso)
                })
                .then(function (response) {
                    AvisosVars.clearCache = true;
                    return response.data;
                })
                .catch(function (response) {
                    AvisosVars.clearCache = true;
                    ErrorHandler(response.data)
                });
        }


        /** @name: update
         * @param aviso
         * @description: Realiza update al aviso.
         */
        function update(aviso) {

            return $http.post(url,
                {
                    'function': 'update',
                    'aviso': JSON.stringify(aviso)
                })
                .then(function (response) {
                    AvisosVars.clearCache = true;
                    return response.data;
                })
                .catch(function (response) {
                    AvisosVars.clearCache = true;
                    ErrorHandler(response.data)
                });
        }


        /**
         * Para el uso de la p�ginaci�n, definir en el controlador las siguientes variables:
         *
         vm.start = 0;
         vm.pagina = SucursalesVars.pagina;
         SucursalesVars.paginacion = 5; Cantidad de registros por p�gina
         vm.end = SucursalesVars.paginacion;


         En el HTML, en el ng-repeat agregar el siguiente filtro: limitTo:appCtrl.end:appCtrl.start;

         Agregar un bot�n de next:
         <button ng-click="appCtrl.next()">next</button>

         Agregar un bot�n de prev:
         <button ng-click="appCtrl.prev()">prev</button>

         Agregar un input para la p�gina:
         <input type="text" ng-keyup="appCtrl.goToPagina()" ng-model="appCtrl.pagina">

         */


        /**
         * @description: Ir a p�gina
         * @param pagina
         * @returns {*}
         * uso: agregar un m�todo
         vm.goToPagina = function () {
                vm.start= SucursalesService.goToPagina(vm.pagina).start;
            };
         */
        function goToPagina(pagina) {
            if (isNaN(pagina) || pagina < 1) {
                AvisosVars.pagina = 1;
                return AvisosVars;
            }

            if (pagina > AvisosVars.paginas) {
                AvisosVars.pagina = AvisosVars.paginas;
                return AvisosVars;
            }

            AvisosVars.pagina = pagina - 1;
            AvisosVars.start = AvisosVars.pagina * AvisosVars.paginacion;
            return AvisosVars;

        }

        /**
         * @name next
         * @description Ir a pr�xima p�gina
         * @returns {*}
         * uso agregar un metodo
         vm.next = function () {
                vm.start = SucursalesService.next().start;
                vm.pagina = SucursalesVars.pagina;
            };
         */
        function next() {
            if (AvisosVars.pagina + 1 > AvisosVars.paginas) {
                return AvisosVars;
            }
            AvisosVars.start = (AvisosVars.pagina * AvisosVars.paginacion);
            AvisosVars.pagina = AvisosVars.pagina + 1;
            //SucursalesVars.end = SucursalesVars.start + SucursalesVars.paginacion;
            return AvisosVars;
        }

        /**
         * @name previous
         * @description Ir a p�gina anterior
         * @returns {*}
         * uso, agregar un m�todo
         vm.prev = function () {
                vm.start= SucursalesService.prev().start;
                vm.pagina = SucursalesVars.pagina;
            };
         */
        function prev() {
            if (AvisosVars.pagina - 2 < 0) {
                return AvisosVars;
            }
            //SucursalesVars.end = SucursalesVars.start;
            AvisosVars.start = (AvisosVars.pagina - 2 ) * AvisosVars.paginacion;
            AvisosVars.pagina = AvisosVars.pagina - 1;
            return AvisosVars;
        }


    }


    AvisosVars.$inject = [];
    /**
     * @description Almacena variables temporales de avisos
     * @constructor
     */
    function AvisosVars() {
        // Cantidad de páginas total del recordset
        this.paginas = 1;
        // Página seleccionada
        this.pagina = 1;
        // Cantidad de registros por página
        this.paginacion = 10;
        // Registro inicial, no es página, es el registro
        this.start = 0;

        // Indica si se debe limpiar el cache la próxima vez que se solicite un get
        this.clearCache = true;

    }

})();