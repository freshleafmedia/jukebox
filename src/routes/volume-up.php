<?php

VlcRemote::send(VlcCommand::VOLUME_UP);

header('HX-Redirect: /');
http_response_code(200);
