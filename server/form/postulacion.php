<?php
/**
 * postulacion.php
 * Recibe el formulario de postulaciones, guarda el CV adjunto,
 * guarda los datos en MySQL y envía un email a la empresa.
 * Pensado para hosting compartido (HostGator).
 *
 * ANTES DE SUBIR:
 * 1. Completa server/.env con los datos reales (mirá server/.env.example).
 * 2. Crea la tabla ejecutando el SQL que está al final de este archivo
 *    (una sola vez, desde phpMyAdmin).
 * 3. Asegurate de que la carpeta server/uploads/cv/ exista y tenga permisos
 *    de escritura (755 o 775) en el servidor.
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
$carpetaCV = __DIR__ . '/../uploads/cv/';
$pesoMaximoCV = 4 * 1024 * 1024; // 4 MB
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
$nombre   = trim($_POST['nombre']   ?? '');
$email    = trim($_POST['email']    ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$cargo    = trim($_POST['cargo']    ?? '');
$mensaje  = trim($_POST['mensaje']  ?? '');

if ($nombre === '' || $email === '') {
    http_response_code(400);
    responder(false, 'Faltan campos obligatorios');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    responder(false, 'Email inválido');
}

// ---------- Validar y guardar el CV (obligatorio, PDF, máx. 4MB) ----------
if (empty($_FILES['cv']) || $_FILES['cv']['error'] === UPLOAD_ERR_NO_FILE) {
    http_response_code(400);
    responder(false, 'Debes adjuntar tu CV en PDF');
}

if ($_FILES['cv']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    responder(false, 'Hubo un problema al recibir el archivo');
}

if ($_FILES['cv']['size'] > $pesoMaximoCV) {
    http_response_code(400);
    responder(false, 'El CV supera el peso máximo de 4MB');
}

$extension = strtolower(pathinfo($_FILES['cv']['name'], PATHINFO_EXTENSION));
$tipoMime  = function_exists('mime_content_type') ? mime_content_type($_FILES['cv']['tmp_name']) : '';

if ($extension !== 'pdf' || $tipoMime !== 'application/pdf') {
    http_response_code(400);
    responder(false, 'El CV debe ser un archivo PDF');
}

if (!is_dir($carpetaCV)) {
    mkdir($carpetaCV, 0755, true);
}

$nombreArchivo = uniqid('cv_') . '.pdf';
$rutaDestino = $carpetaCV . $nombreArchivo;

if (!move_uploaded_file($_FILES['cv']['tmp_name'], $rutaDestino)) {
    http_response_code(500);
    responder(false, 'No se pudo guardar el CV, intenta nuevamente');
}

// ---------- Guardar en MySQL ----------
try {
    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($mysqli->connect_errno) {
        throw new Exception('Conexión a BD falló');
    }

    $stmt = $mysqli->prepare(
        "INSERT INTO postulaciones (nombre, email, telefono, cargo, mensaje, archivo_cv, creado_en)
         VALUES (?, ?, ?, ?, ?, ?, NOW())"
    );
    $stmt->bind_param('ssssss', $nombre, $email, $telefono, $cargo, $mensaje, $nombreArchivo);
    $stmt->execute();
    $stmt->close();
    $mysqli->close();
} catch (Exception $e) {
    // No detenemos el envío del email aunque falle la BD,
    // pero lo dejamos registrado para revisar el log de errores de PHP.
    error_log('Error guardando postulación: ' . $e->getMessage());
}

// ---------- Enviar email ----------
$asuntoEmail = "Nueva postulación: $nombre";
$cuerpo = "Nombre: $nombre\n"
        . "Email: $email\n"
        . "Teléfono: $telefono\n"
        . "Cargo o área de interés: $cargo\n\n"
        . "Mensaje:\n$mensaje\n\n"
        . "CV guardado en el servidor como: $nombreArchivo\n";

$headers = "From: web@piezaviva.cl\r\nReply-To: $email\r\n";

@mail($destinatario, $asuntoEmail, $cuerpo, $headers);

responder(true, 'Postulación enviada correctamente');

/*
-- SQL para crear la tabla (ejecutar una sola vez en phpMyAdmin):

CREATE TABLE postulaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(40),
    cargo VARCHAR(150),
    mensaje TEXT,
    archivo_cv VARCHAR(255),
    creado_en DATETIME
);
*/
