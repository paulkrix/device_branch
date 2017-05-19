<?php

$fp = fsockopen("localhost", 8084, $errno, $errstr, 30);

if( !$fp ) {
	echo "$errstr ($errno)<br />\n";
} else {

  $id = 0;

	$content = "{\"temperatureSensor1\":23.2,\"temperatureSensor2\":22.6,\"temperatureSensor3\":21.4}";

	$out = "POST /devices/" . $id . "/input HTTP/1.1\n";
	$out .= "Host: localhost\n";
	$out .= "Content-Type: application/json; charset=utf-8\n";
	$out .= "Content-Length: " . strlen( $content ) . "\n";
	$out .= "Connection: Close\n\n";
	$out .= $content . "\n";

	echo $out . "\n";

	fwrite( $fp, $out );
	while( !feof( $fp ) ) {
		echo fgets( $fp, 128 );
	}
	fclose( $fp );
	echo "\n";
}

?>
