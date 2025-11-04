<?php
$servername = "localhost";
$username = "root";     // default for XAMPP
$password = "";         // default is blank
$dbname = "service_app"; // your database name

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
?>
