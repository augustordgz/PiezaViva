<?php
/**
 * env.php
 * Carga variables desde un archivo .env a getenv()/$_ENV, sin depender
 * de Composer ni ninguna librería externa (pensado para hosting
 * compartido como HostGator, donde no siempre se puede instalar nada).
 *
 * Uso (desde cualquier archivo dentro de server/form/):
 *   require_once __DIR__ . '/../env.php';
 *   cargarEnv(__DIR__ . '/../.env');
 */

function cargarEnv($ruta) {
    if (!file_exists($ruta)) return;

    $lineas = file($ruta, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lineas as $linea) {
        $linea = trim($linea);

        if ($linea === '' || strpos($linea, '#') === 0) continue;
        if (strpos($linea, '=') === false) continue;

        list($nombre, $valor) = explode('=', $linea, 2);
        $nombre = trim($nombre);
        $valor = trim($valor);
        // Saca comillas simples o dobles si las tiene, ej: DB_PASS="abc 123"
        $valor = trim($valor, "\"'");

        if (getenv($nombre) === false) {
            putenv("$nombre=$valor");
            $_ENV[$nombre] = $valor;
        }
    }
}
