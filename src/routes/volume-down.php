<?php

VlcRemote::send(VlcCommand::VOLUME_DOWN);

header('HX-Redirect: /');
http_response_code(200);
