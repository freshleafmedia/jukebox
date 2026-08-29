<?php

VlcRemote::send(VlcCommand::VolumeUp);

header('HX-Redirect: /');
http_response_code(200);
