<?php


session_start();


// Token

if (file_exists('../../../includes/MyDBi.php')) {
    require_once '../../../includes/MyDBi.php';
    require_once '../../../includes/utils.php';
} else {
    require_once 'MyDBi.php';
}


class Avisos extends Main
{
    private static $instance;

    public static function init($decoded)
    {
        self::$instance = new Main(get_class(), $decoded['function']);
        try {
            call_user_func(get_class() . '::' . $decoded['function'], $decoded);
        } catch (Exception $e) {

            $file = 'error.log';
            $current = file_get_contents($file);
            $current .= date('Y-m-d H:i:s') . ": " . $e . "\n";
            file_put_contents($file, $current);

            header('HTTP/1.0 500 Internal Server Error');
            echo $e;
        }
    }


    function get()
    {
        $db = self::$instance->db;

//        $results = $db->get('avisos');

        $results = $db->rawQuery('Select u.usuario_id, u.nombre, u.apellido, a.aviso_id, a.fecha, a.aviso from avisos a inner join usuarios u on u.usuario_id = a.usuario_id where empresa_id = ' . getEmpresa() . ' ORDER By a.fecha DESC;');

        echo json_encode($results);
    }


    /**
     * @description Crea una categoría, esta es la tabla paramétrica, la funcion createAvisos crea las relaciones
     * @param $params
     */
    function create($params)
    {
        $db = self::$instance->db;
        $db->startTransaction();
        $aviso_decoded = self::checkAviso(json_decode($params["aviso"]));

        $data = array(
            'usuario_id' => $aviso_decoded->usuario_id,
            'aviso' => $aviso_decoded->aviso,
            'empresa_id' => getEmpresa()
        );

        $result = $db->insert('avisos', $data);
        if ($result > -1) {
            $db->commit();
            echo json_encode($result);
        } else {
            $db->rollback();
            echo json_encode(-1);
        }
    }


    /**
     * @description Modifica una aviso
     * @param $params
     */
    function update($params)
    {
        $db = self::$instance->db;
        $db->startTransaction();
        $aviso_decoded = self::checkAviso(json_decode($params["aviso"]));

        $result = false;
        foreach ($aviso_decoded as $row) {
            $db->where('aviso_id', $row->aviso_id);
            $data = array(
                'usuario_id' => $row->usuario_id,
                'aviso' => $row->aviso
            );
            $result = $db->update('avisos', $data);

        }


        if ($result) {
            $db->commit();
            echo json_encode($result);
        } else {
            $db->rollback();
            echo json_encode(-1);
        }
    }


    /**
     * @description Elimina una aviso
     * @param $aviso_id
     */
    function remove($params)
    {
        $db = self::$instance->db;

        $db->where("aviso_id", $params["aviso_id"]);
        $results = $db->delete('avisos');

        if ($results) {

            echo json_encode(1);
        } else {
            echo json_encode(-1);

        }
    }


    /**
     * @description Verifica todos los campos de aviso del carrito para que existan
     * @param $aviso
     * @return mixed
     */
    function checkAviso($aviso)
    {
        $aviso->aviso_id = (!array_key_exists("aviso_id", $aviso)) ? -1 : $aviso->aviso_id;
        $aviso->usuario_id = (!array_key_exists("usuario_id", $aviso)) ? 0 : $aviso->usuario_id;
        $aviso->fecha = (!array_key_exists("fecha", $aviso)) ? 0 : $aviso->fecha;
        $aviso->aviso = (!array_key_exists("aviso", $aviso)) ? 0 : $aviso->aviso;

        return $aviso;
    }
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = file_get_contents("php://input");
    $decoded = json_decode($data);
    Avisos::init(json_decode(json_encode($decoded), true));
} else {
    Avisos::init($_GET);
}
