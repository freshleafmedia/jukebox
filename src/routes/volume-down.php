<?php

VlcRemote::send(VlcCommand::VolumeDown);

header('HX-Redirect: /');
http_response_code(200);
