
<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
include 'db_connection.php';
$username = $_POST['username'] ?? "";
$email = $_POST['email'] ?? "";
$password = $_POST['password'] ?? "";

if ($username && $email && $password) {
  $check = $conn->prepare("SELECT email FROM userdata WHERE email=?");
  $check->bind_param("s", $email);
  $check->execute();
  $check->store_result();
  if ($check->num_rows > 0) {
    echo "Email already exists!";
  } else {
    $stmt = $conn->prepare("INSERT INTO userdata (username, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $username, $email, $password);
    if ($stmt->execute()) {
      echo "success";
    } else {
      echo "Registration error!";
    }
    $stmt->close();
  }
  $check->close();
  $conn->close();
} else {
  echo "Please fill all fields!";
}
?>
