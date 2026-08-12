<?php
/**
 * mailer.php
 * Envía emails por SMTP autenticado (usando una casilla real de tu
 * dominio) en vez de la función mail() de PHP, que en hosting
 * compartido suele fallar en silencio.
 *
 * Requiere las credenciales SMTP completas en server/.env
 * (ver server/.env.example).
 *
 * Uso (desde contacto.php o postulacion.php):
 *   require_once __DIR__ . '/../mailer.php';
 *   $ok = enviarEmailSMTP($destinatario, $asunto, $cuerpo, $replyTo);
 */

require_once __DIR__ . '/PHPMailer/Exception.php';
require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

/**
 * Envía un email por SMTP. Devuelve true si se envió, o false si falló
 * (y deja el motivo en el error_log de PHP).
 */
function enviarEmailSMTP($destinatario, $asunto, $cuerpo, $replyTo = null) {
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = getenv('SMTP_HOST');
        $mail->SMTPAuth   = true;
        $mail->Username   = getenv('SMTP_USER');
        $mail->Password   = getenv('SMTP_PASS');
        $mail->Port       = getenv('SMTP_PORT') ?: 587;

        $seguridad = getenv('SMTP_SECURE') ?: 'tls';
        $mail->SMTPSecure = $seguridad === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;

        $mail->CharSet = 'UTF-8';

        $desdeEmail = getenv('SMTP_USER');
        $desdeNombre = getenv('SMTP_FROM_NAME') ?: 'Pieza Viva - Sitio web';
        $mail->setFrom($desdeEmail, $desdeNombre);
        $mail->addAddress($destinatario);

        if ($replyTo) {
            $mail->addReplyTo($replyTo);
        }

        $mail->isHTML(false);
        $mail->Subject = $asunto;
        $mail->Body    = $cuerpo;

        $mail->send();
        return true;
    } catch (PHPMailerException $e) {
        error_log('Error enviando email por SMTP: ' . $mail->ErrorInfo);
        return false;
    }
}
