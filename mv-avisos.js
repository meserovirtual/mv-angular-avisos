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

            deferred.resolve(update(aviso));
            //if (aviso.aviso_id != undefined) {
            //    deferred.resolve(update(aviso));
            //} else {
            //    deferred.resolve(create(aviso));
            //}
            return deferred.promise;
        }

        function get() {
            //AcUtilsGlobals.startWaiting();
            var urlGet = url + '?function=get';
            //var $httpDefaultCache = $cacheFactory.get('$http');
            //var cachedData = [];
            //
            //
            //// Verifica si existe el cache de avisos
            //if ($httpDefaultCache.get(urlGet) != undefined) {
            //    if (AvisosVars.clearCache) {
            //        $httpDefaultCache.remove(urlGet);
            //    }
            //    else {
            //        var deferred = $q.defer();
            //        cachedData = $httpDefaultCache.get(urlGet);
            //        deferred.resolve(cachedData);
            //        AcUtilsGlobals.stopWaiting();
            //        return deferred.promise;
            //    }
            //}

            return $http.get(urlGet, {cache: false})
                .then(function (response) {
                    //$httpDefaultCache.put(urlGet, response.data);
                    AvisosVars.clearCache = false;
                    MvUtilsGlobals.stopWaiting();
                    return response.data;
                })
                .catch(function (response) {
                    MvUtilsGlobals.stopWaiting();
                    ErrorHandler(response.data);
                    AvisosVars.clearCache = false;
                })
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
                    console.log(data);
                    if (data !== 'false') {
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

    }


    AvisosVars.$inject = [];
    /**
     * @description Almacena variables temporales de avisos
     * @constructor
     */
    function AvisosVars() {



        // Indica si se debe limpiar el cache la próxima vez que se solicite un get
        this.clearCache = true;

    }
})();