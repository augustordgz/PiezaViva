<?php
/**
 * contacto.php
 * Recibe el formulario de contacto, lo guarda en MySQL y envía
 * un email a la empresa. Pensado para hosting compartido (HostGator).
 *
 * ANTES DE SUBIR:
 * 1. Completa server/.env con los datos reales (mirá server/.env.example).
 * 2. Crea la tabla ejecutando el SQL que está al final de este archivo
 *    (una sola vez, desde phpMyAdmin).
 */

require_once __DIR__ . '/../env.php';
cargarEnv(__DIR__ . '/../.env');

header('Content-Type: application/json; charset=utf-8');

// ---------- CONFIGURACIÓN (viene de server/.env, no está escrita acá) ----------
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME'));
define('DB_USER', getenv('DB_USER'));
define('DB_PASS', getenv('DB_PASS'));

$destinatario = getenv('CONTACT_EMAIL') ?: 'contacto@piezaviva.cl';
// ------------------------------------

function responder($ok, $mensaje) {
    echo json_encode(['ok' => $ok, 'mensaje' => $mensaje]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    responder(false, 'Método no permitido');
}

// ---------- Recibir y limpiar datos ----------
$nombre  = trim($_POST['nombre']  ?? '');
$email   = trim($_POST['email']   ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$motivo  = trim($_POST['motivo']  ?? '');
$asunto  = trim($_POST['asunto']  ?? '');
$mensaje = trim($_POST['mensaje'] ?? '');

if ($nombre === '' || $email === '' || $asunto === '' || $mensaje === '') {
    http_response_code(400);
    responder(false, 'Faltan campos obligatorios');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    responder(false, 'Email inválido');
}

// ---------- Guardar en MySQL ----------
try {
    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($mysqli->connect_errno) {
        throw new Exception('Conexión a BD falló');
    }

    $stmt = $mysqli->prepare(
        "INSERT INTO mensajes_contacto (nombre, email, telefono, motivo, asunto, mensaje, creado_en)
         VALUES (?, ?, ?, ?, ?, ?, NOW())"
    );
    $stmt->bind_param('ssssss', $nombre, $email, $telefono, $motivo, $asunto, $mensaje);
    $stmt->execute();
    $stmt->close();
    $mysqli->close();
} catch (Exception $e) {
    // No detenemos el envío del email aunque falle la BD,
    // pero lo dejamos registrado para revisar el log de errores de PHP.
    error_log('Error guardando contacto: ' . $e->getMessage());
}

// ---------- Enviar email ----------
$asuntoEmail = "Nuevo mensaje web: $asunto";
$cuerpo = "Nombre/Empresa: $nombre\n"
        . "Email: $email\n"
        . "Teléfono: $telefono\n"
        . "Motivo: $motivo\n"
        . "Asunto: $asunto\n\n"
        . "Mensaje:\n$mensaje\n";

$headers = "From: web@piezaviva.cl\r\nReply-To: $email\r\n";

@mail($destinatario, $asuntoEmail, $cuerpo, $headers);

responder(true, 'Mensaje enviado correctamente');

/*
-- SQL para crear la tabla (ejecutar una sola vez en phpMyAdmin):

CREATE TABLE mensajes_contacto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(40),
    motivo VARCHAR(40),
    asunto VARCHAR(200),
    mensaje TEXT,
    creado_en DATETIME
);
*/
